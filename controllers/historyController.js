const Receipt = require("../models/Receipt");
const Payment = require("../models/Payment");

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

  const payments = await Payment.find({
    studentId,
    academicYear:
      academicYear ||
      new Date().getFullYear() + "/" + (new Date().getFullYear() + 1),
    status: "success",
  });

  const installmentMap = {};
  payments.forEach((p) => {
    const key = p.paymentType;
    if (!installmentMap[key])
      installmentMap[key] = { paid: 0, total: p.installment.total };
    installmentMap[key].paid += 1;
  });

  const status = Object.entries(installmentMap).map(([type, info]) => ({
    paymentType: type,
    installmentsPaid: info.paid,
    installmentsTotal: info.total,
    cleared: info.paid >= info.total,
  }));

  res.json({ success: true, data: status });
};

module.exports = {
  getStudentHistory,
  getStudentHistoryByAdmin,
  getInstallmentStatus,
};
