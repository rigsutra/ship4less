const express = require("express");
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const Address = require("../models/address.model");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Fetch price based on order type
router.post("/getPrices", (req, res) => {
  const prices = {
    "USPS Ground OZ": 10,
    "USPS Ground lb": 15,
    "USPS Priority": 20,
    "USPS Express": 30,
    "USPS Priority v2": 25,
  };

  const price = prices[req.body.type];

  if (price) {
    res.json({ price });
  } else {
    res.status(400).json({ message: "Invalid order type" });
  }
});

// POST /api/orders/normal - Create Normal Order
router.post("/orders/normal", authMiddleware, async (req, res) => {
  const orderData = req.body;
  orderData.userId = req.userId; // Add userId from JWT
  delete orderData.id;

  const newOrder = new Order(orderData);

  try {
    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error("Error creating normal order:", error);
    res.status(400).json({
      success: false,
      message: "Error creating normal order",
      error: error.message,
    });
  }
});

// POST /api/orders/quick - Create Quick Order
router.post("/orders/quick", authMiddleware, async (req, res) => {
  const orderData = req.body;
  orderData.userId = req.userId; // Add userId from JWT
  delete orderData.id;

  // Set specific order type for quick orders if not provided
  orderData.order_type = orderData.order_type || "Quick Order";

  const newOrder = new Order(orderData);

  try {
    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    console.error("Error creating quick order:", error);
    res.status(400).json({
      success: false,
      message: "Error creating quick order",
      error: error.message,
    });
  }
});

// GET /api/uspsorders - Fetch USPS Orders with pagination and sorting for the logged-in user
router.get("/uspsorders", authMiddleware, async (req, res) => {
  const { page = 1, limit = 10, sort = "asc" } = req.query;

  try {
    const uspsOrders = await Order.find({
      userId: req.userId,
      order_type: /UPS/,
    })
      .sort({ createdAt: sort === "asc" ? 1 : -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalOrders = await Order.countDocuments({
      userId: req.userId,
      order_type: /UPS/,
    });

    res.json({
      orders: uspsOrders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching USPS orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/uspsorders/:id - Update USPS order status
// PUT /api/uspsorders/:id - Update USPS order status
router.put("/uspsordersupdateStatus/:id", authMiddleware, async (req, res) => {
  console.log("req.body UPS", req.body);
  const { status } = req.body;
  console.log(status);

  if (!["Pending", "In Process", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, // Ensure the order belongs to the logged-in user
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Error updating USPS order status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/uspsorders/:orderId - Fetch single USPS Order for the logged-in user
router.get("/uspsorders/:orderId", authMiddleware, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({
      orderId,
      userId: req.userId, // Ensure the order belongs to the logged-in user
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

// DELETE /api/uspsorders/:id - Delete USPS Order
router.delete("/uspsordersdelete/:id", authMiddleware, async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // Ensure the order belongs to the logged-in user
    });

    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting USPS order:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/uspsorders/duplicateOrder/:id - Duplicate a USPS Order
router.post(
  "/uspsorders/duplicateOrder/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const existingOrder = await Order.findOne({
        _id: req.params.id,
        userId: req.userId, // Ensure the order belongs to the logged-in user
      }).exec();

      if (!existingOrder)
        return res.status(404).json({ message: "Order not found" });

      // Duplicate fromAddress
      const duplicateFromAddress = { ...existingOrder.fromAddress };
      delete duplicateFromAddress._id;

      // Duplicate toAddress
      const duplicateToAddress = { ...existingOrder.toAddress };
      delete duplicateToAddress._id;

      // Create new Order
      const newOrder = new Order({
        userId: req.userId, // Link to the same user
        order_type: existingOrder.order_type,
        weight: existingOrder.weight,
        template: existingOrder.template,
        total_price: existingOrder.total_price,
        status: existingOrder.status,
        fromAddress: duplicateFromAddress,
        toAddress: duplicateToAddress,
      });

      await newOrder.save();

      res.status(201).json({
        message: "Order duplicated successfully",
        orderId: newOrder.orderId,
      });
    } catch (error) {
      console.error("Error duplicating USPS order:", error);
      res.status(500).json({ message: "Error duplicating order" });
    }
  }
);

// GET /api/uspsaddresses - Fetch addresses with sorting
router.get("/uspsaddresses", authMiddleware, async (req, res) => {
  try {
    const addresses = await Address.find().sort({ date: -1 });
    res.json({ addresses });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
