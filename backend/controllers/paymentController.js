const { broadcast } = require("../wsServer");
const Payment = require("../models/Payment");
const Receipt = require("../models/Receipt");
const SBTRecord = require("../models/SBTRecord");
const {
  generateReceiptId,
  generateReferenceNumber,
  generateTransactionReference,
} = require("../utils/generateReceipt");
const { generateQRCode } = require("../utils/generateQR");
const { mintReceiptOnChain } = require("../utils/blockchainBridge");

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

  const momoResult = simulateMoMoPayment();

  if (momoResult === "failed") {
    payment.status = "failed";
    payment.failureReason = "MoMo transaction declined by provider";
    await payment.save();
    res.status(400);
    throw new Error("Payment failed. Please try again.");
  }

  payment.status = "success";
  await payment.save();
  broadcast("payment_confirmed", {
    paymentId: payment._id,
    studentId: req.user.studentId,
    status: payment.status,
    amount: payment.amount,
    paymentType: payment.paymentType,
    academicYear: payment.academicYear,
    transactionReference: payment.transactionReference,
  });

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

  // ── Mint the SBT receipt on-chain using the student's custodial wallet ────
  let sbtRecord;
  if (req.user.walletAddress) {
    const placeholderCID = `placeholder-${receipt.receiptId.substring(0, 16)}`;
    const mintResult = await mintReceiptOnChain(
      req.user.walletAddress,
      placeholderCID,
      payment.transactionReference,
    );

    if (mintResult.success) {
      sbtRecord = await SBTRecord.create({
        receipt: receipt._id,
        student: req.user._id,
        studentId: req.user.studentId,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
        contractAddress: mintResult.contractAddress,
        mintStatus: "minted",
        mintedAt: new Date(),
      });
      broadcast("mint_complete", {
        receiptId: receipt._id,
        studentId: req.user.studentId,
        tokenId: mintResult.tokenId,
        transactionHash: mintResult.transactionHash,
      });
    } else {
      sbtRecord = await SBTRecord.create({
        receipt: receipt._id,
        student: req.user._id,
        studentId: req.user.studentId,
        mintStatus: "failed",
      });
      console.error("SBT minting failed:", mintResult.error);
      broadcast("tx_failed", {
        receiptId: receipt._id,
        studentId: req.user.studentId,
        error: mintResult.error || "Unknown mint failure",
      });
    }
  } else {
    console.warn(
      `Student ${req.user.studentId} has no wallet address — skipping mint`,
    );
  }

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
      sbt: sbtRecord
        ? {
            tokenId: sbtRecord.tokenId,
            transactionHash: sbtRecord.transactionHash,
            mintStatus: sbtRecord.mintStatus,
          }
        : null,
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
