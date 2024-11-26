const express = require("express");
const FedexOrderDomestic = require("../models/FedexOrderDomestic");
const FedexOrderInternational = require("../models/FedexOrderInternational");
const UPSOrder = require("../models/Order"); // Model for UPS orders
const DHLOrder = require("../models/DHLOrderModel"); // Model for DHL orders
const router = express.Router();

// Route to update tracking link for an order
router.put("/updateTracking/:id", async (req, res) => {
  const { trackingId } = req.body;
  const { id } = req.params;

  try {
    // Try updating FedEx Domestic orders
    let order = await FedexOrderDomestic.findByIdAndUpdate(
      id,
      { tracking: trackingId },
      { new: true }
    );

    if (order) {
      return res.json({
        message: "Tracking ID updated successfully for FedEx Domestic order",
        trackingLink: order.tracking,
      });
    }

    // If not found, try updating FedEx International orders
    order = await FedexOrderInternational.findByIdAndUpdate(
      id,
      { tracking: trackingId },
      { new: true }
    );

    if (order) {
      return res.json({
        message:
          "Tracking ID updated successfully for FedEx International order",
        trackingLink: order.tracking,
      });
    }

    // If not found, try updating UPS orders
    order = await UPSOrder.findByIdAndUpdate(
      id,
      { tracking: trackingId },
      { new: true }
    );

    if (order) {
      return res.json({
        message: "Tracking ID updated successfully for UPS order",
        trackingLink: order.tracking,
      });
    }

    // If not found, try updating DHL orders
    order = await DHLOrder.findByIdAndUpdate(
      id,
      { tracking: trackingId },
      { new: true }
    );

    if (order) {
      return res.json({
        message: "Tracking ID updated successfully for DHL order",
        trackingLink: order.tracking,
      });
    }

    // If no orders are found, return a 404 error
    return res.status(404).json({ message: "Order not found" });
  } catch (error) {
    console.error("Error updating tracking ID:", error);
    res.status(500).json({ message: "Error updating tracking ID" });
  }
});

module.exports = router;
