const mongoose = require("mongoose");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    confirmPassword: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ["user", "admin"] },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangeAt: Date,
  },
  { timestamps: true }
);

// Method to create a password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex"); // Generate plain token
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex"); // Hash and store in DB
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 mins
  return resetToken; // Return plain token to send via email
};

module.exports = mongoose.model("User", userSchema);
