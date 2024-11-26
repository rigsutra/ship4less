const mongoose = require("mongoose");

const DHLOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Link order to user
    orderId: { type: String, required: true, unique: true },
    no: { type: Number, unique: true },
    order_type: { type: String, required: true },
    weight: { type: Number, required: true },
    tracking: { type: String, default: "" },
    template: { type: String, default: null },
    total_price: { type: Number, required: true },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "In Process", "Completed"],
    },
    fromAddress: {
      name: { type: String, required: true },
      company_name: { type: String, default: null },
      street1: { type: String, required: true },
      street2: { type: String, default: null },
      zip_code: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },
    toAddress: {
      name: { type: String, required: true },
      company_name: { type: String, default: null },
      street1: { type: String, required: true },
      street2: { type: String, default: null },
      zip_code: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

DHLOrderSchema.pre("validate", async function (next) {
  if (this.isNew && !this.no) {
    try {
      const lastOrder = await mongoose
        .model("DHLOrder")
        .findOne()
        .sort("-no")
        .exec();
      let newNo = 1000;
      if (
        lastOrder &&
        typeof lastOrder.no === "number" &&
        !isNaN(lastOrder.no)
      ) {
        newNo = lastOrder.no + 1;
      }
      this.no = newNo;
      this.orderId = `SHDFL${this.no}`;
      next();
    } catch (error) {
      console.error("Error generating orderId:", error);
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("DHLOrder", DHLOrderSchema);
