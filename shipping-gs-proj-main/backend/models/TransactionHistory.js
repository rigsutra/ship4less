const mongoose = require("mongoose");

const TransactionHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TransactionHistory", TransactionHistorySchema);
// Compare this snippet from backend/models/User.js:
