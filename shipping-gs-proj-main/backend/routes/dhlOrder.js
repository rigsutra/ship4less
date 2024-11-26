const express = require("express");
const jwt = require("jsonwebtoken");
const DHLOrder = require("../models/DHLOrderModel");
const Address = require("../models/address.model");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch price based on order type
router.post("/getPricesDHL", (req, res) => {
  const prices = {
    "DHL Ground OZ": 10,
    "DHL Ground lb": 15,
    "DHL Priority": 20,
    "DHL Express": 30,
    "DHL Priority v2": 25,
  };

  const price = prices[req.body.type];

  if (price) {
    res.json({ price });
  } else {
    res.status(400).json({ message: "Invalid order type" });
  }
});

// POST /api/dhlOrders/normal - Create Normal DHLOrder
router.post("/dhlOrders/normal", authMiddleware, async (req, res) => {
  const orderData = req.body;
  orderData.userId = req.userId; // Add userId from JWT
  delete orderData.id;

  const newDHLOrder = new DHLOrder(orderData);

  try {
    const savedDHLOrder = await newDHLOrder.save();
    res.status(201).json({ success: true, order: savedDHLOrder });
  } catch (error) {
    console.error("Error creating normal order:", error);
    res.status(400).json({
      success: false,
      message: "Error creating normal order",
      error: error.message,
    });
  }
});

// POST /api/dhlOrders/quick - Create Quick DHLOrder
router.post("/dhlOrders/quick", authMiddleware, async (req, res) => {
  const orderData = req.body;
  orderData.userId = req.userId; // Add userId from JWT
  delete orderData.id;

  // Set specific order type for quick dhlOrders if not provided
  orderData.order_type = orderData.order_type || "Quick DHLOrder";

  const newDHLOrder = new DHLOrder(orderData);

  try {
    const savedDHLOrder = await newDHLOrder.save();
    res.status(201).json({ success: true, order: savedDHLOrder });
  } catch (error) {
    console.error("Error creating quick order:", error);
    res.status(400).json({
      success: false,
      message: "Error creating quick order",
      error: error.message,
    });
  }
});

// Fetch DHL orders with pagination and sorting
router.get("/dhlOrders", authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, sort = "asc" } = req.query;

  try {
    const dhlOrders = await DHLOrder.find({
      userId: req.userId,
      order_type: /DHL/,
    })
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOrders = await DHLOrder.countDocuments({
      userId: req.userId,
      order_type: /DHL/,
    });

    res.json({
      dhlOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching DHL orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update DHL order status
router.put("/dhlOrders/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;

  if (!["Waiting", "In Process", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await DHLOrder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch single DHL order
router.get("/dhlOrders/:orderId", authMiddleware, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await DHLOrder.findOne({
      _id: orderId,
      userId: req.userId,
    }).populate(
      "fromAddress toAddress",
      "name street1 street2 city company_name state zip_code country"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete DHL order
router.delete("/dhlOrders/:id", authMiddleware, async (req, res) => {
  try {
    const deletedOrder = await DHLOrder.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Duplicate DHL order
router.post(
  "/dhlOrders/duplicateDHLOrder/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const existingOrder = await DHLOrder.findOne({
        _id: req.params.id,
        userId: req.userId,
      });

      if (!existingOrder)
        return res.status(404).json({ message: "Order not found" });

      const newOrder = new DHLOrder({
        ...existingOrder.toObject(),
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      });

      const savedOrder = await newOrder.save();

      res.status(201).json({
        message: "Order duplicated successfully",
        order: savedOrder,
      });
    } catch (error) {
      console.error("Error duplicating order:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
