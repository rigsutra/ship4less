const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const { Balance, Transaction } = require("../models/Balance");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// Middleware to verify NOWPayments IPN signature
function verifyNowPaymentsSignature(req, res, next) {
  const receivedSignature = req.headers["x-nowpayments-sig"];
  if (!receivedSignature) {
    return res.status(400).send("Missing signature");
  }

  const sortedData = JSON.stringify(sortObjectKeys(req.body));
  const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
  hmac.update(sortedData);
  const calculatedSignature = hmac.digest("hex");

  if (calculatedSignature !== receivedSignature) {
    return res.status(400).send("Invalid signature");
  }

  next();
}

// Utility function to sort object keys
function sortObjectKeys(obj) {
  return Object.keys(obj)
    .sort()
    .reduce((result, key) => {
      result[key] =
        obj[key] && typeof obj[key] === "object"
          ? sortObjectKeys(obj[key])
          : obj[key];
      return result;
    }, {});
}

// Fetch balance for the user
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const balance = await Balance.findOne({ userId: req.userId });
    res.json({ balance: balance ? balance.amount : 0 });
  } catch (error) {
    console.error("Error fetching balance:", error.message);
    res.status(500).send("Error fetching balance");
  }
});

// Fetch transactions for the user
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).send("Error fetching transactions");
  }
});

// Create a payment and generate an invoice
router.post("/create-payment", authMiddleware, async (req, res) => {
  const { amount, currency } = req.body;

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  if (!currency) {
    return res.status(400).json({ error: "Currency is required" });
  }

  try {
    const response = await axios.post(
      "https://api-sandbox.nowpayments.io/v1/invoice",
      {
        price_amount: amount,
        price_currency: currency,
        pay_currency: currency,
        order_id: `order_${Date.now()}`,
        ipn_callback_url: "https://ship4less.ru/api/ipn",
        success_url: "https://yourdomain.com/payment-success",
        cancel_url: "https://yourdomain.com/payment-cancel",
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    if (!response.data.invoice_url) {
      return res.status(500).json({ error: "Failed to create invoice" });
    }

    const transaction = new Transaction({
      userId: req.userId,
      amount,
      currency,
      status: "Pending",
      paymentId: response.data.id,
    });

    await transaction.save();
    res.json({ invoiceUrl: response.data.invoice_url });
  } catch (error) {
    console.error(
      "Error creating payment with NOWPayments:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Error creating payment" });
  }
});

// Handle IPN notifications from NOWPayments
router.post("/ipn", verifyNowPaymentsSignature, async (req, res) => {
  try {
    const ipnData = req.body;

    if (
      !ipnData.payment_id ||
      !ipnData.order_id ||
      !ipnData.payment_status ||
      typeof ipnData.price_amount !== "number"
    ) {
      return res.status(400).json({ error: "Invalid IPN data" });
    }

    const transaction = await Transaction.findOne({
      paymentId: ipnData.payment_id,
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const statusMap = {
      finished: "Completed",
      failed: "Failed",
      waiting: "Pending",
    };

    const newStatus = statusMap[ipnData.payment_status] || "Unknown";

    transaction.status = newStatus;
    transaction.amountPaid = ipnData.actually_paid || transaction.amount;
    transaction.currency = ipnData.pay_currency || transaction.currency;

    await transaction.save();

    if (newStatus === "Completed") {
      const balance = await Balance.findOne({ userId: transaction.userId });

      if (balance) {
        balance.amount += transaction.amountPaid;
        await balance.save();
      } else {
        const newBalance = new Balance({
          userId: transaction.userId,
          amount: transaction.amountPaid,
        });
        await newBalance.save();
      }
    }

    res.status(200).send("IPN received successfully");
  } catch (error) {
    console.error("Error handling IPN:", error.message);
    res.status(500).send("Error processing IPN");
  }
});

module.exports = router;
