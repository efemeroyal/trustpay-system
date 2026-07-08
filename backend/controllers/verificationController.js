const Receipt = require("../models/Receipt");
const User = require("../models/User");
const { broadcast } = require("../wsServer");

const verifyReceipt = async (req, res) => {
  const { referenceNumber, studentId } = req.body;
  const normalizedStudentId = String(studentId || "").trim();

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
  const now = new Date();
  if (receipt.studentId !== normalizedStudentId) {
    receipt.verificationStatus = "rejected";
    receipt.rejectedAt = now;
    receipt.rejectionReason =
      "Receipt does not belong to this student. Possible fraud attempt.";
    receipt.isVerified = false;
    receipt.isDuplicate = false;
    await receipt.save();

    broadcast("receipt_rejected", {
      studentId: receipt.studentId,
      referenceNumber: receipt.referenceNumber,
      reason: receipt.rejectionReason,
    });

    return res.status(403).json({
      success: false,
      status: "INVALID",
      message: receipt.rejectionReason,
    });
  }

  receipt.isVerified = true;
  receipt.verificationStatus = "validated";
  receipt.verifiedAt = now;
  receipt.rejectedAt = undefined;
  receipt.rejectionReason = undefined;
  receipt.verifiedBy = req.user._id;
  receipt.verificationCount = (receipt.verificationCount || 0) + 1;
  receipt.isDuplicate = false;
  await receipt.save();

  broadcast("receipt_validated", {
    studentId: receipt.studentId,
    referenceNumber: receipt.referenceNumber,
    amount: receipt.amount,
    paymentType: receipt.paymentType,
  });

  res.json({
    success: true,
    status: "VALID",
    message:
      receipt.verificationCount > 1
        ? "Receipt verification refreshed successfully."
        : "Receipt successfully verified.",
    data: {
      referenceNumber: receipt.referenceNumber,
      studentName: receipt.student.fullName,
      studentId: receipt.student.studentId,
      amount: receipt.amount,
      paymentType: receipt.paymentType,
      academicYear: receipt.academicYear,
      level: receipt.level,
      verifiedAt: receipt.verifiedAt,
      verificationCount: receipt.verificationCount,
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
