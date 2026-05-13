const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");
const {
  generateReceiptId,
  generateReferenceNumber,
  generateTransactionReference,
} = require("../utils/generateReceipt");
const { generateQRCode } = require("../utils/generateQR");

const simulateMoMoPayment = () => {
  const outcomes = ["success", "success", "success", "failed"];
  return outcomes[Math.floor(Math.random() * outcomes.length)];
};

const initiatePayment = async (req, res) => {
  const {
    amount,
    paymentType,
    academicYear,
    level,
    installment,
    momoProvider,
    momoNumber,
  } = req.body;

  // Duplicate request check — same student, same payment type, same academic year within 60 seconds
  const recentPayment = await Payment.findOne({
    student: req.user._id,
    paymentType,
    academicYear,
    status: "success",
    createdAt: { $gte: new Date(Date.now() - 60000) },
  });

  if (recentPayment) {
    res.status(400);
    throw new Error(
      "Duplicate request detected. A payment for this was already processed recently.",
    );
  }

  const transactionReference = generateTransactionReference();

  // Optimistic recording — save as pending first
  const payment = await Payment.create({
    student: req.user._id,
    studentId: req.user.studentId,
    amount,
    paymentType,
    academicYear,
    level: level || req.user.level,
    installment: installment || { current: 1, total: 1 },
    momoProvider,
    momoNumber,
    status: "pending",
    transactionReference,
  });

  // Simulate MoMo transaction
  const momoResult = simulateMoMoPayment();

  if (momoResult === "failed") {
    payment.status = "failed";
    payment.failureReason = "MoMo transaction declined by provider";
    await payment.save();
    res.status(400);
    throw new Error("Payment failed. Please try again.");
  }

  // Payment succeeded — generate receipt
  payment.status = "success";
  await payment.save();

  const timestamp = payment.createdAt.getTime();
  const receiptId = generateReceiptId(req.user.studentId, amount, timestamp);
  const referenceNumber = await generateReferenceNumber();

  const qrPayload = {
    receiptId,
    referenceNumber,
    studentId: req.user.studentId,
    amount,
    academicYear,
    timestamp,
  };

  const qrCodeData = await generateQRCode(qrPayload);

  const receipt = await Receipt.create({
    payment: payment._id,
    student: req.user._id,
    studentId: req.user.studentId,
    receiptId,
    referenceNumber,
    hmacSignature: receiptId,
    qrCodeData,
    amount,
    paymentType,
    academicYear,
    level: level || req.user.level,
  });

  res.status(201).json({
    success: true,
    message: "Payment successful. Receipt generated.",
    data: {
      referenceNumber: receipt.referenceNumber,
      amount: receipt.amount,
      paymentType: receipt.paymentType,
      academicYear: receipt.academicYear,
      qrCode: receipt.qrCodeData,
      createdAt: receipt.createdAt,
    },
  });
};

const getMyPayments = async (req, res) => {
  const payments = await Payment.find({ student: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, count: payments.length, data: payments });
};

module.exports = { initiatePayment, getMyPayments };
