const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");
const User = require("../models/User");

const getDashboardStats = async (req, res) => {
  const { academicYear } = req.query;
  const filter = academicYear ? { academicYear } : {};

  const totalPayments = await Payment.countDocuments({
    ...filter,
    status: "success",
  });
  const totalRevenue = await Payment.aggregate([
    { $match: { ...filter, status: "success" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalStudents = await User.countDocuments({ role: "student" });
  const verifiedReceipts = await Receipt.countDocuments({
    ...filter,
    isVerified: true,
  });
  const pendingVerifications = await Receipt.countDocuments({
    ...filter,
    isVerified: false,
  });
  const failedPayments = await Payment.countDocuments({
    ...filter,
    status: "failed",
  });

  const revenueByType = await Payment.aggregate([
    { $match: { ...filter, status: "success" } },
    {
      $group: {
        _id: "$paymentType",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const paymentsByLevel = await Payment.aggregate([
    { $match: { ...filter, status: "success" } },
    {
      $group: { _id: "$level", total: { $sum: "$amount" }, count: { $sum: 1 } },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalStudents,
      verifiedReceipts,
      pendingVerifications,
      failedPayments,
      revenueByType,
      paymentsByLevel,
    },
  });
};

module.exports = { getDashboardStats };
