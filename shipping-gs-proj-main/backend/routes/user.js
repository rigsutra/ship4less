const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");
const sendEmail = require("../utils/mailsend");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // Fetch the user by their ID, which is stored in the JWT payload
    const user = await User.findById(req.userId).select("-password"); // Exclude the password field for security reasons

    // Check if the user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Send the user details back as a response
    res.json({
      success: true,
      user: {
        username: user.username,
        name: user.name,
        // Add other fields as necessary
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/getusers", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password"); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

router.post("/updatePassword", authMiddleware, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // Check if newPassword and confirmPassword match
  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "New passwords do not match" });
  }

  try {
    // Find the user by ID
    const user = await User.findById(req.userId);

    // Check if user exists
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Verify the old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect old password" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.patch("/resetpassword/:resetToken", async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: resetPasswordToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid token or token has expired" });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.confirmPassword = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangeAt = Date.now();
  await user.save();
  res.status(200).json({ success: true, message: "Password reset successful" });
});

router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  // Find the user by email
  const user = await User.findOne({ email: email });
  // If user does not exist, return error
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  // Generate a password reset token
  const resetToken = user.createPasswordResetToken();

  console.log(resetToken);
  // Save the user
  await user.save();
  console.log("hii2");

  // Send the reset token to the user's email
  console.log(req.get("host"));
  const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;
  const message = `we have recived a password reset request. The link to reset your password is as follows: \n\n ${resetUrl}
  /n/n This link is only valid for 10 minutes. \n\n If you did not request a password reset, please ignore this email.`;
  console.log("hii3");
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Change request recived",
      message: message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset Link send to the user Email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(500).json({
      success: false,
      message: "Error sending email, Please try again later",
    });
  }
});
router.post("/resetpassword/:resetToken", async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    // Find the user with the token and check if the token is still valid (not expired)
    const user = await User.findOne({
      passwordResetToken: resetPasswordToken,
      passwordResetExpires: { $gt: Date.now() }, // Token has not expired
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Hash the new password
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Set new password and clear reset token fields
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangeAt = Date.now(); // Track the time of password change

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password. Please try again.",
    });
  }
});

module.exports = router;
