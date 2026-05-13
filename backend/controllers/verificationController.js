const Receipt = require("../models/Receipt");
const User = require("../models/User");

const verifyReceipt = async (req, res) => {
  const { referenceNumber, studentId } = req.body;

  // Check 1: Does the receipt exist?
  const receipt = await Receipt.findOne({ referenceNumber }).populate(
    "student",
    "fullName studentId email level",
  );

  if (!receipt) {
    return res.status(404).json({
      success: false,
      status: "INVALID",
      message:
        "Receipt not found. This reference number does not exist in our system.",
    });
  }

  // Check 2: Does it belong to this student?
  if (receipt.studentId !== studentId) {
    return res.status(403).json({
      success: false,
      status: "INVALID",
      message:
        "Receipt does not belong to this student. Possible fraud attempt.",
    });
  }

  // Check 3: Has it already been verified?
  if (receipt.isVerified) {
    return res.status(400).json({
      success: false,
      status: "DUPLICATE",
      message: "This receipt has already been verified.",
      data: {
        verifiedAt: receipt.verifiedAt,
        referenceNumber: receipt.referenceNumber,
      },
    });
  }

  // All checks passed — mark as verified
  receipt.isVerified = true;
  receipt.verifiedAt = new Date();
  receipt.verifiedBy = req.user._id;
  await receipt.save();

  res.json({
    success: true,
    status: "VALID",
    message: "Receipt successfully verified.",
    data: {
      referenceNumber: receipt.referenceNumber,
      studentName: receipt.student.fullName,
      studentId: receipt.student.studentId,
      amount: receipt.amount,
      paymentType: receipt.paymentType,
      academicYear: receipt.academicYear,
      level: receipt.level,
      verifiedAt: receipt.verifiedAt,
    },
  });
};

const getVerificationHistory = async (req, res) => {
  const verified = await Receipt.find({ isVerified: true })
    .populate("student", "fullName studentId")
    .populate("verifiedBy", "fullName")
    .sort({ verifiedAt: -1 });

  res.json({ success: true, count: verified.length, data: verified });
};

module.exports = { verifyReceipt, getVerificationHistory };
