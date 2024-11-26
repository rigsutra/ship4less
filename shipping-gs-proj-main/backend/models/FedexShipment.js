// models/FedexShipment.js
const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  shipmentPurpose: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
  },
  items: [
    {
      units: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
      },
      weight: {
        type: Number,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      tariff: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("FedexShipment", shipmentSchema);
