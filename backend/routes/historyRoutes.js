const express = require("express");
const router = express.Router();
const {
  getStudentHistory,
  getStudentHistoryByAdmin,
  getInstallmentStatus,
} = require("../controllers/historyController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const RequiredFee = require("../models/RequiredFee");

router.get("/my-history", protect, getStudentHistory);
router.get("/installments", protect, getInstallmentStatus);
router.get("/student/:studentId", protect, adminOnly, getStudentHistoryByAdmin);

// ── Admin sets required fee amounts ──────────────────────────────────────────
router.post("/required-fees", protect, adminOnly, async (req, res) => {
  const { paymentType, academicYear, level, requiredAmount } = req.body;

  const fee = await RequiredFee.findOneAndUpdate(
    { paymentType, academicYear, level },
    { requiredAmount, createdBy: req.user._id },
    { upsert: true, new: true },
  );

  res.status(201).json({ success: true, data: fee });
});

router.get("/required-fees", protect, adminOnly, async (req, res) => {
  const fees = await RequiredFee.find({}).sort({ academicYear: -1 });
  res.json({ success: true, count: fees.length, data: fees });
});

module.exports = router;
