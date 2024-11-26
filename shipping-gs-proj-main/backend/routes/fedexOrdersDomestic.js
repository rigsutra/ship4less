// routes/fedexOrders.js
const express = require("express");
const FedexOrderDomestic = require("../models/FedexOrderDomestic");
const FedexAddress = require("../models/FedexAddress");
const Shipment = require("../models/FedexShipment");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// Route to create a new Fedex Order
// Route to create a new Fedex Order
router.post("/createfedexorder/domestic", authMiddleware, async (req, res) => {
  let {
    senderName,
    senderStreet,
    senderStreet2,
    senderCity,
    senderState,
    senderZip,
    senderPhone,
    senderEmail,
    senderCountry,
    receiverName,
    receiverStreet,
    receiverStreet2,
    receiverCity,
    receiverState,
    receiverZip,
    receiverPhone,
    receiverEmail,
    receiverCountry,
    pickup,
    pickupDate,
    fromPickupTime,
    toPickupTime,
    signature,
    shipmentPurpose,
    currency,
    specialNotes,
    pickupName,
    pickupStreet,
    pickupStreet2,
    pickupCity,
    pickupState,
    pickupZip,
    pickupPhone,
    pickupCountry,
    items,
  } = req.body;

  // Validate required fields
  if (
    !senderName ||
    !senderStreet ||
    !senderCity ||
    !senderZip ||
    !senderPhone ||
    !senderCountry ||
    !receiverName ||
    !receiverStreet ||
    !receiverCity ||
    !receiverZip ||
    !receiverPhone ||
    !receiverCountry ||
    !shipmentPurpose ||
    !items ||
    items.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  const senderAddress = new FedexAddress({
    name: senderName,
    street: senderStreet,
    street2: senderStreet2,
    city: senderCity,
    state: senderState,
    zip: senderZip,
    phone: senderPhone,
    email: senderEmail,
    country: senderCountry,
  });
  await senderAddress.save();

  // Create receiver address
  const receiverAddress = new FedexAddress({
    name: receiverName,
    street: receiverStreet,
    street2: receiverStreet2,
    city: receiverCity,
    state: receiverState,
    zip: receiverZip,
    phone: receiverPhone,
    email: receiverEmail,
    country: receiverCountry,
  });
  await receiverAddress.save();

  try {
    // Convert item fields to numbers
    items = items.map((item) => ({
      units: Number(item.units),
      description: item.description,
      weight: Number(item.weight),
      value: Number(item.value),
      tariff: Number(item.tariff),
    }));

    // Create sender and receiver addresses as before...
    // (Skipping repeated code for brevity)
    // Create pickup address if pickup is selected
    let pickAddress;
    if (pickup) {
      if (
        !pickupName ||
        !pickupStreet ||
        !pickupCity ||
        !pickupZip ||
        !pickupPhone ||
        !pickupCountry ||
        !pickupDate ||
        !fromPickupTime ||
        !toPickupTime
      ) {
        return res
          .status(400)
          .json({ message: "Please provide all pickup details." });
      }

      pickAddress = new FedexAddress({
        name: pickupName,
        street: pickupStreet,
        street2: pickupStreet2,
        city: pickupCity,
        state: pickupState,
        zip: pickupZip,
        phone: pickupPhone,
        country: pickupCountry,
      });
      await pickAddress.save();
    }

    // Create the shipment document with items
    const newShipment = new Shipment({
      shipmentPurpose,
      currency,
      items,
    });
    await newShipment.save();

    // Calculate or set the price (here we assume a dummy price)
    const price = "$30"; // Replace with actual price calculation if needed

    // Create the order document
    const newOrder = new FedexOrderDomestic({
      note: specialNotes,
      price,
      senderAddress: senderAddress._id,
      receiverAddress: receiverAddress._id,
      pickAddress: pickAddress ? pickAddress._id : undefined,
      signature,
      pickupDate: pickupDate || undefined,
      fromPickupTime: fromPickupTime || undefined,
      toPickupTime: toPickupTime || undefined,
      shipment: newShipment._id,
      userId: req.userId, // Associate the order with the logged-in user
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      orderId: newOrder.orderId,
    });
  } catch (error) {
    console.error("Error creating order:", error.stack);
    res
      .status(500)
      .json({ message: "An error occurred while creating the order." });
  }
});

// Route to get all orders
// routes/fedexOrders.js
// Route to get all orders for the logged-in user
router.get("/getAllOrdersdomestic", authMiddleware, async (req, res) => {
  try {
    // console.log(req.userId);
    const orders = await FedexOrderDomestic.find({ userId: req.userId }) // Filter by userId
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

// Route to update Order Status
router.put(
  "/updateOrderStatusdomestic/:id",
  authMiddleware,
  async (req, res) => {
    const { status } = req.body;
    console.log("status FEDEX dom", status);
    // Validate status
    if (!["Pending", "In Process", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    try {
      // Find the order by ID and check if it belongs to the logged-in user
      const order = await FedexOrderDomestic.findOne({
        _id: req.params.id,
        userId: req.userId,
      })
        .populate(
          "senderAddress receiverAddress pickAddress",
          "name street street2 city state zip phone email country"
        )
        .populate("shipment");

      // If the order is not found or doesn't belong to the user, return a 404 or 403
      if (!order) {
        return res.status(404).json({
          message:
            "Order not found or you don't have permission to update this order",
        });
      }

      // Update the status of the order
      order.status = status;
      await order.save();

      res.json(order); // Send the updated order
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({ message: "Error updating status" });
    }
  }
);

// Route to duplicate an Order
router.post("/duplicateOrderdomestic/:id", authMiddleware, async (req, res) => {
  console.log(req.params.id);
  try {
    const existingOrder = await FedexOrderDomestic.findOne({
      orderId: req.params.id,
    }) // Use orderId instead of _id
      .populate("senderAddress receiverAddress pickAddress shipment")
      .exec();

    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Duplicate addresses
    const duplicateSenderAddress = new FedexAddress({
      ...existingOrder.senderAddress.toObject(),
      _id: undefined, // Remove _id to create a new document
    });
    await duplicateSenderAddress.save();

    const duplicateReceiverAddress = new FedexAddress({
      ...existingOrder.receiverAddress.toObject(),
      _id: undefined,
    });
    await duplicateReceiverAddress.save();

    let duplicatePickAddress;
    if (existingOrder.pickAddress) {
      duplicatePickAddress = new FedexAddress({
        ...existingOrder.pickAddress.toObject(),
        _id: undefined,
      });
      await duplicatePickAddress.save();
    }

    // Duplicate shipment
    const duplicateShipment = new Shipment({
      ...existingOrder.shipment.toObject(),
      _id: undefined,
      items: existingOrder.shipment.items.map((item) => ({
        ...item.toObject(),
        _id: undefined,
      })),
    });
    await duplicateShipment.save();

    // Create the duplicated order
    const newOrder = new FedexOrderDomestic({
      userId: req.userId,
      note: existingOrder.note,
      price: existingOrder.price,
      senderAddress: duplicateSenderAddress._id,
      receiverAddress: duplicateReceiverAddress._id,
      pickAddress: duplicatePickAddress ? duplicatePickAddress._id : undefined,
      signature: existingOrder.signature,
      pickupDate: existingOrder.pickupDate,
      fromPickupTime: existingOrder.fromPickupTime,
      toPickupTime: existingOrder.toPickupTime,
      shipment: duplicateShipment._id,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order duplicated successfully",
      orderId: newOrder.orderId,
    });
  } catch (error) {
    console.error("Error duplicating order backend:", error);
    res.status(500).json({ message: "Error duplicating order backend" });
  }
});

router.get(
  "/getOrderByIddomestic/:orderId",
  authMiddleware,
  async (req, res) => {
    const { orderId } = req.params;
    // console.log("latest",req.userId)
    try {
      const order = await FedexOrderDomestic.findOne({
        orderId,
        userId: req.userId,
      }) // Filter by orderId and userId
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

module.exports = router;
