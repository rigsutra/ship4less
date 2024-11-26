const express = require("express");
const Faq = require("../models/Faq");

const router = express.Router();

router.post("/createFaqs", async (req, res) => {
  const { question, answer } = req.body;

  if (!answer || !question) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  const newFaq = new Faq({
    question,
    answer,
  });

  try {
    const savedFaq = await newFaq.save();
    res.status(201).json(savedFaq);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    res
      .status(400)
      .json({ message: "Error creating FAQ", error: error.message });
  }
});

router.get("/getFaqs", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ date: -1 });
    res.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/updateFaq/:id", async (req, res) => {
  const { question, answer } = req.body;

  if (!answer || !question) {
    return res
      .status(400)
      .json({ message: "Please fill in all required fields." });
  }

  try {
    const updatedFaq = await Faq.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );
    res.json(updatedFaq);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    res.status(400).json({ message: "Error updating FAQ" });
  }
});

router.delete("/deleteFaq/:id", async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: "FAQ not found." });
    }
    res.json({ message: "FAQ deleted successfully." });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
