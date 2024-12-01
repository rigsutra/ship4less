const mongoose = require("mongoose");

const BalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, default: 0 },
});

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    paymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true }, // Add the required currency field
    amountPaid: { type: Number, default: 0 },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = {
  Balance: mongoose.model("Balance", BalanceSchema),
  Transaction: mongoose.model("Transaction", TransactionSchema),
};
