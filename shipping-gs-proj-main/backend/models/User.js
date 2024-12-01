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
    // adminId:{}
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangeAt: Date,
  },
  { timestamps: true }
);

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log(resetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
