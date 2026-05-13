const express = require("express");
const router = express.Router();
const Receipt = require("../models/Receipt");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/my-receipts", protect, async (req, res) => {
  const receipts = await Receipt.find({ student: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, count: receipts.length, data: receipts });
});

router.get("/all", protect, adminOnly, async (req, res) => {
  const receipts = await Receipt.find({})
    .populate("student", "fullName studentId")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: receipts.length, data: receipts });
});

module.exports = router;
