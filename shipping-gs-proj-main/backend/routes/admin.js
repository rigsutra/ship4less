const express = require("express");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");
const FedexOrderInternational = require("../models/FedexOrderInternational");
const FedexOrderDomestic = require("../models/FedexOrderDomestic");
const Order = require("../models/Order");
const DHLOrder = require("../models/DHLOrderModel");
const DHLOrderModel = require("../models/DHLOrderModel");


const router = express.Router();

// GET /api/AdminDetails - Protected Route for Logged-in User
router.get("/AdminDetails", authMiddleware, async (req, res) => {
  try {
    // Fetch the logged-in user by their ID and select only the 'name' field
    const admin = await User.findById(req.userId).select("name");

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, name: admin.name });
  } catch (error) {
    console.error("Error fetching admin details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/getAllOrdersdomesticAdmin - Fetch Domestic Orders
router.get("/getAllOrdersdomesticAdmin", authMiddleware, async (req, res) => {
  try {
    const orders = await FedexOrderDomestic.find()
      .populate(
        "senderAddress receiverAddress pickAddress",
        "name street street2 city state zip phone email country"
      )
      .populate("shipment")
      .sort("-createdAt");

    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/getAllOrdersInternationalAdmin - Fetch International Orders
router.get(
  "/getAllOrdersInternationalAdmin",
  authMiddleware,
  async (req, res) => {
    try {
      const orders = await FedexOrderInternational.find()
        .populate(
          "senderAddress receiverAddress pickAddress",
          "name street street2 city state zip phone email country"
        )
        .populate("shipment")
        .sort("-createdAt");

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// GET /api/upsordersAdmin - Fetch UPS Orders
router.get("/upsordersAdmin", authMiddleware, async (req, res) => {
  try {
    // Fetch all UPS orders from the database
    const upsOrders = await Order.find(); // Assuming you're using MongoDB and Mongoose

    if (!upsOrders) {
      return res.status(404).json({ message: "No UPS orders found" });
    }

    // Send the array of orders in the response
    res.status(200).json({
      success: true,
      orders: upsOrders, // All UPS orders in the array
      type: "UPS Orders", // Additional info (optional)
    });
  } catch (error) {
    console.error("Error fetching UPS orders:", error);
    res.status(500).json({
      message: "An error occurred while fetching UPS orders.",
      error: error.message,
    });
  }
});
router.get("/dhlordersAdmin", authMiddleware, async (req, res) => {
  try {
    // Fetch all UPS orders from the database
    const dhlOrders = await DHLOrder.find(); // Assuming you're using MongoDB and Mongoose

    if (!dhlOrders) {
      return res.status(404).json({ message: "No DHL orders found" });
    }

    // Send the array of orders in the response
    res.status(200).json({
      success: true,
      orders: dhlOrders, // All UPS orders in the array
      type: "DHL Orders", // Additional info (optional)
    });
  } catch (error) {
    console.error("Error fetching UPS orders:", error);
    res.status(500).json({
      message: "An error occurred while fetching UPS orders.",
      error: error.message,
    });
  }
});

router.get(
  "/getOrderByIddomesticAdmin/:orderId",
  authMiddleware,
  async (req, res) => {
    const { orderId } = req.params;
    // console.log("latest",req.userId)
    try {
      const order = await FedexOrderDomestic.findOne({ orderId })
        .populate(
          "senderAddress receiverAddress pickAddress",
          "name street street2 city state zip phone email country"
        )
        .populate("shipment");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get(
  "/getOrderByIdInternationalAdmin/:orderId",
  authMiddleware,
  async (req, res) => {
    const { orderId } = req.params;
    try {
      const order = await FedexOrderInternational.findOne({ orderId }) // Filter by orderId and userId
        .populate(
          "senderAddress receiverAddress pickAddress",
          "name street street2 city state zip phone email country"
        )
        .populate("shipment");

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/uspsordersAdmin/:orderId", authMiddleware, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findOne({
      orderId,
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
router.get("/dhlordersAdmin/:orderId", authMiddleware, async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await DHLOrder.findOne({
      orderId,
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

router.put(
  "/updateOrderStatusdomesticAdmin/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["Pending", "In Progress", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await FedexOrderDomestic.findOneAndUpdate(
        { _id: req.params.id },
        { status },
        { new: true }
      )
        .populate(
          "senderAddress receiverAddress",
          "name street city zip phone country"
        )
        .populate("shipment");

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found or unauthorized access" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Error updating status" });
    }
  }
);
router.put(
  "/updateOrderStatusInternationalAdmin/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["Pending", "In Progress", "Completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await FedexOrderInternational.findOneAndUpdate(
        { _id: req.params.id },
        { status },
        { new: true }
      )
        .populate(
          "senderAddress receiverAddress",
          "name street city zip phone country"
        )
        .populate("shipment");

      if (!order) {
        return res
          .status(404)
          .json({ message: "Order not found or unauthorized access" });
      }

      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Error updating status" });
    }
  }
);

router.put("/upsOrderStatus/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;
  console.log(status);
  if (!["Pending", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id }, // Ensure the order belongs to the logged-in user
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
router.put("/dhlOrderStatus/:id", authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!["Waiting", "In Progress", "Completed"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await DHLOrder.findOneAndUpdate(
      { _id: req.params.id }, // Ensure the order belongs to the logged-in user
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    console.error("Error updating DHL order status:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.get("/getAllOrdersdomestic/:userId", authMiddleware, async (req, res) => {
  try {
    // console.log(req.userId);
    const orders = await FedexOrderDomestic.find({ userId: req.params.userId }) // Filter by userId
      .populate(
        "senderAddress receiverAddress pickAddress",
        "name street street2 city state zip phone email country"
      )
      .populate("shipment")
      .sort("-createdAt");
      const totalOrderCount = await FedexOrderDomestic.countDocuments({ userId: req.params.userId });
    res.json({orders,totalOrderCount});
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/getAllOrdersinternational/:userId", authMiddleware, async (req, res) => {
  try {
    // console.log(req.userId);
    const orders = await FedexOrderInternational.find({ userId: req.params.userId }) // Filter by userId
      .populate(
        "senderAddress receiverAddress pickAddress",
        "name street street2 city state zip phone email country"
      )
      .populate("shipment")
      .sort("-createdAt");
      const totalOrderCount = await FedexOrderInternational.countDocuments({ userId: req.params.userId });
    res.json({orders,totalOrderCount});
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/upsAllorders/:userId", authMiddleware, async (req, res) => {
  try {
    // Fetch all UPS orders from the database
    const upsOrders = await Order.find({ userId: req.params.userId }); // Assuming you're using MongoDB and Mongoose

    if (!upsOrders) {
      return res.status(404).json({ message: "No UPS orders found" });
    }

    // Send the array of orders in the response
    const totalOrderCount = await Order.countDocuments({ userId: req.params.userId });
    // res.json({orders,totalOrderCount});
    res.status(200).json({
      success: true,
      orders: upsOrders, // All UPS orders in the array
      totalOrderCount:totalOrderCount,
      // type: "UPS Orders", // Additional info (optional)
    });
  } catch (error) {
    console.error("Error fetching UPS orders:", error);
    res.status(500).json({
      message: "An error occurred while fetching UPS orders.",
      error: error.message,
    });
  }
});
router.get("/dhlAllorders/:userId", authMiddleware, async (req, res) => {
  try {
    // Fetch all UPS orders from the database
    const dhlOrders = await DHLOrderModel.find({ userId: req.params.userId }); // Assuming you're using MongoDB and Mongoose

    if (!dhlOrders) {
      return res.status(404).json({ message: "No DHL orders found" });
    }

    // Send the array of orders in the response
    const totalOrderCount = await DHLOrderModel.countDocuments({ userId: req.params.userId });
    // res.json({orders,totalOrderCount});
    res.status(200).json({
      success: true,
      orders: dhlOrders, // All UPS orders in the array
      totalOrderCount:totalOrderCount,
    });
  } catch (error) {
    console.error("Error fetching UPS orders:", error);
    res.status(500).json({
      message: "An error occurred while fetching UPS orders.",
      error: error.message,
    });
  }
});



module.exports = router;
