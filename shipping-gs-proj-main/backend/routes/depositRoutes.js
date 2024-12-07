const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const { Balance, Transaction } = require("../models/Balance");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

// Define allowed pay currencies
const allowedPayCurrencies = ["TRX", "BEP", "BTC", "LTC", "ETH"];

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

// Custom middleware to capture raw body
const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || "utf8");
  }
};

// Middleware to verify NOWPayments IPN signature
function verifyNowPaymentsSignature(req, res, next) {
  const receivedSignature = req.headers["x-nowpayments-sig"];
  if (!receivedSignature) {
    return res.status(400).send("Missing signature");
  }

  if (!req.rawBody) {
    return res.status(400).send("Missing raw body");
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(req.rawBody);
  } catch (err) {
    console.error("Invalid JSON in IPN body:", err);
    return res.status(400).send("Invalid JSON");
  }

  const sortedData = sortObjectKeys(parsedBody);
  const hmac = crypto.createHmac("sha512", NOWPAYMENTS_IPN_SECRET);
  hmac.update(JSON.stringify(sortedData));
  const calculatedSignature = hmac.digest("hex");

  if (calculatedSignature !== receivedSignature) {
    return res.status(400).send("Invalid signature");
  }

  // Attach the parsed body to req.body for further processing
  req.body = parsedBody;

  next();
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
    const transactions = await Transaction.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).send("Error fetching transactions");
  }
});

// Estimate the equivalent cryptocurrency amount
router.get("/estimate", authMiddleware, async (req, res) => {
  const { amount, currency, payCurrency } = req.query;
  console.log(
    "Estimate Request - Amount:",
    amount,
    "Currency:",
    currency,
    "PayCurrency:",
    payCurrency
  );

  // Validate amount
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Validate currency and payCurrency
  const allowedCurrencies = ["USD"];

  if (!currency || !allowedCurrencies.includes(currency.toUpperCase())) {
    return res.status(400).json({ error: "Unsupported or missing currency" });
  }

  if (
    !payCurrency ||
    !allowedPayCurrencies.includes(payCurrency.toUpperCase())
  ) {
    return res
      .status(400)
      .json({ error: "Unsupported or missing payment currency" });
  }

  try {
    const response = await axios.get(
      `https://api-sandbox.nowpayments.io/v1/estimate`,
      {
        params: {
          amount: parseFloat(amount),
          currency_from: currency.toUpperCase(),
          currency_to: payCurrency.toUpperCase(),
        },
        headers: { "x-api-key": NOWPAYMENTS_API_KEY },
      }
    );

    console.log("NOWPayments Estimate Response:", response.data);

    if (!response.data.estimated_amount) {
      return res
        .status(500)
        .json({ error: "Invalid response from NOWPayments" });
    }

    res.json({ estimatedAmount: response.data.estimated_amount });
  } catch (error) {
    if (error.response) {
      console.error("NOWPayments API Error:", error.response.data);
    } else {
      console.error("Estimate Error:", error.message);
    }
    res.status(500).json({ error: "Failed to get estimate" });
  }
});

// Create a payment and generate an invoice
router.post("/create-payment", authMiddleware, async (req, res) => {
  const { amount, currency, payCurrency } = req.body;
  console.log(
    "Create Payment - Amount:",
    amount,
    "Currency:",
    currency,
    "PayCurrency:",
    payCurrency
  );

  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  if (!currency || !payCurrency) {
    return res
      .status(400)
      .json({ error: "Currency and pay currency are required" });
  }

  if (!allowedPayCurrencies.includes(payCurrency.toUpperCase())) {
    return res.status(400).json({ error: "Unsupported payment currency" });
  }

  try {
    const response = await axios.post(
      "https://api-sandbox.nowpayments.io/v1/invoice",
      {
        price_amount: amount,
        price_currency: currency.toUpperCase(),
        pay_currency: payCurrency.toUpperCase(),
        order_id: `order_${Date.now()}_${req.userId}`, // Include userId for uniqueness
        ipn_callback_url: process.env.IPN_CALLBACK_URL, // Use environment variable
        success_url: process.env.SUCCESS_URL, // Use environment variable
        cancel_url: process.env.CANCEL_URL, // Use environment variable
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );
    console.log("NOWPayments Invoice Response:", response.data);

    if (!response.data.invoice_url) {
      return res.status(500).json({ error: "Failed to create invoice" });
    }

    const transaction = new Transaction({
      userId: req.userId,
      amount,
      currency: currency.toUpperCase(),
      payCurrency: payCurrency.toUpperCase(),
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
router.post(
  "/ipn",
  bodyParser.json({ verify: rawBodySaver }), // Capture raw body
  verifyNowPaymentsSignature, // Verify signature
  async (req, res) => {
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
      console.log(transaction.status);

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
  }
);

// Optional: Define Success and Cancel Endpoints
router.get("/payment-success", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment-success`);
});

router.get("/payment-cancel", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/payment-cancel`);
});

// Fetch payment status (optional)
router.get("/payment-status/:paymentId", authMiddleware, async (req, res) => {
  console.log("Payment ID:", req.params.paymentId);
  const paymentId = req.params.paymentId;

  try {
    const response = await axios.get(
      `https://api-sandbox.nowpayments.io/v1/payment/${paymentId}`,
      {
        headers: { "x-api-key": NOWPAYMENTS_API_KEY },
      }
    );

    res.json(response.data); // Send the payment details back to the client
    console.log("Payment Status Response:", response.data);
  } catch (error) {
    console.error(
      "Error fetching payment status:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

module.exports = router;
