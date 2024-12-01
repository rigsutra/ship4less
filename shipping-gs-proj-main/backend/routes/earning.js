const { authMiddleware } = require("../middleware/authMiddleware");
const express = require("express");
const mongoose = require("mongoose");
const FedexOrderDomestic = require("../models/FedexOrderDomestic");
const FedexOrderInternational = require("../models/FedexOrderInternational");
const Order = require("../models/Order");
const DHLOrder = require("../models/DHLOrderModel");
const router = express.Router();

router.get("/earningDomestic",authMiddleware,async(req,res)=>{
    try {
        // Get today's start and end time
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
    
        // Get the start and end of the current month
        const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
        const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999);
    
        // Get the start and end of the current year
        const yearStart = new Date(todayStart.getFullYear(), 0, 1);
        const yearEnd = new Date(todayStart.getFullYear(), 11, 31, 23, 59, 59, 999);
    
        // Convert price to numbers if stored as strings
        const parsePrice = (orders) =>
            orders.reduce((total, order) => {
              // Remove the '$' and parse the price as a float
              const numericPrice = parseFloat(order.price.replace("$", ""));
              console.log(numericPrice)
              return total + (isNaN(numericPrice) ? 0 : numericPrice); // Handle invalid prices gracefully
            }, 0);

    
        // Get earnings for each time range
        const dailyEarnings = await FedexOrderDomestic.find({
          createdAt: { $gte: todayStart, $lte: todayEnd },
        });
        const monthlyEarnings = await FedexOrderDomestic.find({
          createdAt: { $gte: monthStart, $lte: monthEnd },
        });
        const yearlyEarnings = await FedexOrderDomestic.find({
          createdAt: { $gte: yearStart, $lte: yearEnd },
        });
    
        res.status(200).json({
          dailyEarnings: parsePrice(dailyEarnings),
          monthlyEarnings: parsePrice(monthlyEarnings),
          yearlyEarnings: parsePrice(yearlyEarnings),
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
})
router.get("/earningInternational",authMiddleware,async(req,res)=>{
    try {
        // Get today's start and end time
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
    
        // Get the start and end of the current month
        const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
        const monthEnd = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999);
    
        // Get the start and end of the current year
        const yearStart = new Date(todayStart.getFullYear(), 0, 1);
        const yearEnd = new Date(todayStart.getFullYear(), 11, 31, 23, 59, 59, 999);
    
        // Convert price to numbers if stored as strings
        const parsePrice = (orders) =>
            orders.reduce((total, order) => {
              // Remove the '$' and parse the price as a float
              const numericPrice = parseFloat(order.price.replace("$", ""));
              console.log(numericPrice)
              return total + (isNaN(numericPrice) ? 0 : numericPrice); // Handle invalid prices gracefully
            }, 0);

    
        // Get earnings for each time range
        const dailyEarnings = await FedexOrderInternational.find({
          createdAt: { $gte: todayStart, $lte: todayEnd },
        });
        const monthlyEarnings = await FedexOrderInternational.find({
          createdAt: { $gte: monthStart, $lte: monthEnd },
        });
        const yearlyEarnings = await FedexOrderInternational.find({
          createdAt: { $gte: yearStart, $lte: yearEnd },
        });
    
        res.status(200).json({
          dailyEarnings: parsePrice(dailyEarnings),
          monthlyEarnings: parsePrice(monthlyEarnings),
          yearlyEarnings: parsePrice(yearlyEarnings),
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
})
router.get("/earningUPS", authMiddleware, async (req, res) => {
    try {
      // Define start and end dates for daily, monthly, and yearly earnings
      const now = new Date();
  
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
  
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
  
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  
      // Use MongoDB aggregation for better performance
      const [dailyEarnings, monthlyEarnings, yearlyEarnings] = await Promise.all([
        Order.aggregate([
          { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),
        Order.aggregate([
          { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),
      ]);
  
      // Helper to get total or default to 0
      const getTotal = (result) => (result.length > 0 ? result[0].total : 0);
  
      res.status(200).json({
        dailyEarnings: getTotal(dailyEarnings),
        monthlyEarnings: getTotal(monthlyEarnings),
        yearlyEarnings: getTotal(yearlyEarnings),
      });
    } catch (error) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ error: "Server error" });
    }
  });
router.get("/earningDHL", authMiddleware, async (req, res) => {
    try {
      // Define start and end dates for daily, monthly, and yearly earnings
      const now = new Date();
  
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
  
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
  
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  
      // Use MongoDB aggregation for better performance
      const [dailyEarnings, monthlyEarnings, yearlyEarnings] = await Promise.all([
        DHLOrder.aggregate([
          { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),
        DHLOrder.aggregate([
          { $match: { createdAt: { $gte: monthStart, $lte: monthEnd } } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),
        DHLOrder.aggregate([
          { $match: { createdAt: { $gte: yearStart, $lte: yearEnd } } },
          { $group: { _id: null, total: { $sum: "$total_price" } } },
        ]),
      ]);
  
      // Helper to get total or default to 0
      const getTotal = (result) => (result.length > 0 ? result[0].total : 0);
  
      res.status(200).json({
        dailyEarnings: getTotal(dailyEarnings),
        monthlyEarnings: getTotal(monthlyEarnings),
        yearlyEarnings: getTotal(yearlyEarnings),
      });
    } catch (error) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

module.exports = router;