const mongoose = require("mongoose");
const Counter = require("./Counter");

const fedexOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  no: { type: Number, unique: true },
  status: {
    type: String,
    default: "Pending",
    enum: ["Pending", "In Process", "Completed"],
  },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
  price: { type: String, required: true },
  senderAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FedexAddress",
    required: true,
  },
  receiverAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FedexAddress",
    required: true,
  },
  pickAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FedexAddress",
  },
  signature: { type: Boolean },
  pickupDate: { type: Date },
  fromPickupTime: { type: String },
  toPickupTime: { type: String },
  shipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FedexShipment",
    required: true,
  },
  tracking: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Added userId field
});

fedexOrderSchema.pre("validate", async function (next) {
  if (!this.no) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: "orderNo" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Assign the generated sequence number to 'no' and create the orderId
    this.no = counter.seq;
  }
  this.orderId = `SHFEDO${this.no}`;
  next();
});

module.exports = mongoose.model("FedexOrderDomestic", fedexOrderSchema);