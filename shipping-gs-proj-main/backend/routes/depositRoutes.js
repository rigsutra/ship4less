const express = require("express");
const axios = require("axios");
const { Balance, Transaction } = require("../models/Balance");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();
const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;

// Fetch all available currencies from NowPayments API
router.get("/currencies", async (req, res) => {
  try {
    // Make a request to NowPayments API to fetch the list of supported currencies
    const response = await axios.get("https://api.nowpayments.io/v1/full-currencies", {
      headers: { "x-api-key": NOWPAYMENTS_API_KEY },
    });

    // Check if the data has been received successfully
    if (!response.data || !response.data.currencies) {
      return res.status(500).json({ error: "Failed to fetch currencies" });
    }

    // Return the list of currencies to the client
    res.json({ currencies: response.data.currencies });
  } catch (error) {
    console.error("Error fetching currencies from NowPayments:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Error fetching currencies" });
  }
});

// Fetch balance for the user
router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const balance = await Balance.findOne({ userId: req.userId });
    res.json({ balance: balance ? balance.amount : 0 });
  } catch (error) {
    res.status(500).send("Error fetching balance");
  }
});

// Fetch transactions for the user
router.get("/transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    res.json({ transactions });
  } catch (error) {
    res.status(500).send("Error fetching transactions");
  }
});

// Create a payment and generate an invoice
router.post("/create-payment", authMiddleware, async (req, res) => {
  const { amount } = req.body;

  // Validate amount
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    const response = await axios.post(
      "https://api.nowpayments.io/v1/invoice",
      {
        price_amount: amount,
        price_currency: "USD",
        pay_currency: "LTC",
        order_id: `order_${Date.now()}`,
        // ipn_callback_url: "https://yourdomain.com/api/ipn",
        // success_url: "https://yourdomain.com/wallet?payment=success",
        // cancel_url: "https://yourdomain.com/wallet?payment=cancel",
      },
      { headers: { "x-api-key": NOWPAYMENTS_API_KEY } }
    );

    // Check if invoice_url is present
    if (!response.data.invoice_url) {
      console.error("No invoice_url in NowPayments response:", response.data);
      return res.status(500).json({ error: "Failed to create invoice" });
    }

    // Log the NowPayments response for debugging
    console.log("NowPayments Response:", response.data);

    const transaction = new Transaction({
      userId: req.userId,
      amount,
      status: "Pending",
      paymentId: response.data.id,
    });

    await transaction.save();
    console.log("NowPayments Response:", response.data.invoice_url);
    res.json({ invoiceUrl: response.data.invoice_url });
  } catch (error) {
    console.error(
      "Error creating payment with NowPayments:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Error creating payment" });
  }
});

module.exports = router;
