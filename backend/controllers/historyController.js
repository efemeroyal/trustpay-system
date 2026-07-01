const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");
const RequiredFee = require("../models/RequiredFee"); // ← NEW

const getStudentHistory = async (req, res) => {
  const { academicYear, paymentType } = req.query;
  const filter = { student: req.user._id };
  if (academicYear) filter.academicYear = academicYear;
  if (paymentType) filter.paymentType = paymentType;

  const receipts = await Receipt.find(filter)
    .populate("payment")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: receipts.length, data: receipts });
};

const getStudentHistoryByAdmin = async (req, res) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;
  const filter = { studentId };
  if (academicYear) filter.academicYear = academicYear;

  const receipts = await Receipt.find(filter)
    .populate("student", "fullName studentId programme level")
    .populate("payment")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: receipts.length, data: receipts });
};

const getInstallmentStatus = async (req, res) => {
  const { academicYear } = req.query;
  const studentId = req.user.studentId;
  const level = req.user.level;
  const year =
    academicYear ||
    `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;

  // ── Get all successful payments for this student this year ────────────────
  const payments = await Payment.find({
    studentId,
    academicYear: year,
    status: "success",
  });

  // ── Group payments by type and sum their amounts ──────────────────────────
  const paidByType = {};
  payments.forEach((p) => {
    if (!paidByType[p.paymentType]) paidByType[p.paymentType] = 0;
    paidByType[p.paymentType] += p.amount;
  });

  // ── Get required fees set by admin for this level and year ────────────────
  const requiredFees = await RequiredFee.find({ academicYear: year, level });

  // ── Build status per fee type ─────────────────────────────────────────────
  const status = requiredFees.map((fee) => {
    const totalPaid = paidByType[fee.paymentType] || 0;
    const remaining = Math.max(0, fee.requiredAmount - totalPaid);
    const cleared = totalPaid >= fee.requiredAmount;
    const progress = Math.min(
      100,
      Math.round((totalPaid / fee.requiredAmount) * 100),
    );

    return {
      paymentType: fee.paymentType,
      requiredAmount: fee.requiredAmount,
      totalPaid,
      remaining,
      progress, // percentage paid so far
      cleared, // true = fully paid
      academicYear: year,
      level,
    };
  });

  res.json({ success: true, data: status });
};

module.exports = {
  getStudentHistory,
  getStudentHistoryByAdmin,
  getInstallmentStatus,
};
