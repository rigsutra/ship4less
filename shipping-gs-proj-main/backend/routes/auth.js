const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { authorize, authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", async (req, res) => {
  if (!name || !username || !password || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Please fill in all fields" });
  }
  const { name, username, password, email, role = "user" } = req.body; // Default to 'user'

  try {
    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });
    await user.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/getusers", async function (req, res) {
  try {
    const users = await User.find({ role: "user" });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/addadmin",
  authMiddleware,
  authorize("admin"),
  async (req, res) => {
    const { name, username, password } = req.body;

    try {
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const admin = new User({
        name,
        username,
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();

      res
        .status(201)
        .json({ success: true, message: "Admin created successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
