const mongoose = require("mongoose");

const BalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, default: 0 },
});

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true }, // e.g., "Pending", "Success", "Failed"
  paymentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Balance: mongoose.model("Balance", BalanceSchema),
  Transaction: mongoose.model("Transaction", TransactionSchema),
};
