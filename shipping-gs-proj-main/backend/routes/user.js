const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");

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

router.post("/getusers", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password"); // Exclude password field
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Failed to fetch users." });
  }
})


module.exports = router;
