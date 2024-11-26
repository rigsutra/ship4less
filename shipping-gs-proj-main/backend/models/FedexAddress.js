// models/FedexAddress.js
const mongoose = require("mongoose");

const fedexAddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  street: { type: String, required: true },
  street2: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  zip: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  country: { type: String, required: true },
});

module.exports = mongoose.model("FedexAddress", fedexAddressSchema);
