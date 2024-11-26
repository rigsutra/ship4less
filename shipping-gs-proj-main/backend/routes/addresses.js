const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware"); // Authentication middleware
const Address = require("../models/address.model");

const router = express.Router();

// Create a new address (Protected Route)
router.post("/postaddresses", authMiddleware, async (req, res) => {
  const { name, street, street2, zip, city, state, country } = req.body;

  // Validate required fields
  if (!name || !street || !zip || !city || !state || !country) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  const newAddress = new Address({
    name,
    street,
    street2,
    zip,
    city,
    state,
    country,
    userId: req.userId, // Associate address with the logged-in user
  });

  try {
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error("Error creating address:", error);
    res
      .status(400)
      .json({ message: "Error creating address", error: error.message });
  }
});

// Fetch all addresses for the logged-in user (Protected Route)
router.get("/getaddresses", authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.userId }).sort({
      createdAt: -1,
    }); // Filter by user ID
    res.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single address by ID (Protected Route)
router.get("/getaddress/:id", authMiddleware, async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      userId: req.userId,
    }); // Ensure user owns the address
    if (!address) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized." });
    }
    res.json(address);
  } catch (error) {
    console.error("Error fetching address:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Update an address by ID (Protected Route)
router.put("/updateaddress/:id", authMiddleware, async (req, res) => {
  const { name, street, street2, zip, city, state, country } = req.body;

  // Validate required fields
  if (!name || !street || !zip || !city || !state || !country) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  try {
    const updatedAddress = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // Ensure user owns the address
      { name, street, street2, zip, city, state, country },
      { new: true, runValidators: true }
    );

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized." });
    }

    res.json(updatedAddress);
  } catch (error) {
    console.error("Error updating address:", error);
    res
      .status(400)
      .json({ message: "Error updating address", error: error.message });
  }
});

// Delete an address by ID (Protected Route)
router.delete("/deleteaddress/:id", authMiddleware, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    }); // Ensure user owns the address
    if (!address) {
      return res
        .status(404)
        .json({ message: "Address not found or unauthorized." });
    }
    res.json({ message: "Address deleted successfully." });
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
