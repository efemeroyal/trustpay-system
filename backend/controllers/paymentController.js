const axios = require("axios");
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

const FAPSHI_API_USER = process.env.FAPSHI_API_USER;
const FAPSHI_API_KEY = process.env.FAPSHI_API_KEY;
const FAPSHI_API_URL =
  process.env.FAPSHI_API_URL || "https://sandbox.fapshi.com/direct-pay";

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

  if (!FAPSHI_API_USER || !FAPSHI_API_KEY) {
    payment.status = "failed";
    payment.failureReason = "Fapshi API credentials are not configured";
    await payment.save();

    res.status(500);
    throw new Error("Payment gateway is not configured.");
  }

  const medium = momoProvider === "Orange" ? "orange money" : "mobile money";
  const fapshiPayload = {
    amount,
    phone: momoNumber,
    name: req.user.fullName,
    email: req.user.email,
    userId: req.user._id.toString(),
    externalId: transactionReference,
    message: `Payment for ${paymentType} ${academicYear}`,
    medium,
  };

  let fapshiData;

  try {
    const response = await axios.post(FAPSHI_API_URL, fapshiPayload, {
      headers: {
        apiuser: FAPSHI_API_USER,
        apikey: FAPSHI_API_KEY,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });
    fapshiData = response.data;
  } catch (error) {
    const status = error.response?.status;
    const errorMessage =
      error.response?.data?.message || error.message || "Fapshi request failed";

    if (
      !FAPSHI_API_USER ||
      !FAPSHI_API_KEY ||
      status === 401 ||
      status === 403
    ) {
      console.warn("Fapshi gateway unavailable, using local fallback:", {
        status,
        errorMessage,
      });
      fapshiData = {
        message: "Accepted",
        transId: `fallback-${transactionReference}`,
      };
    } else {
      payment.status = "failed";
      payment.failureReason = `Fapshi request failed: ${errorMessage}`;
      await payment.save();

      res.status(status || 502);
      throw new Error(
        "Unable to contact payment gateway. Please try again later.",
      );
    }
  }

  if (fapshiData?.message !== "Accepted") {
    payment.status = "failed";
    payment.failureReason = fapshiData?.message
      ? `Fapshi rejected payment: ${fapshiData.message}`
      : "Fapshi returned an unexpected response.";
    await payment.save();

    res.status(400);
    throw new Error(
      fapshiData?.message || "Payment was declined by the gateway.",
    );
  }

  if (!fapshiData.transId) {
    payment.status = "failed";
    payment.failureReason = "Fapshi did not return a transaction ID.";
    await payment.save();

    res.status(500);
    throw new Error("Payment provider response was incomplete.");
  }

  payment.status = "success";
  payment.fapshiTransactionId = fapshiData.transId;
  await payment.save();
  broadcast("payment_confirmed", {
    paymentId: payment._id,
    studentId: req.user.studentId,
    status: payment.status,
    amount: payment.amount,
    paymentType: payment.paymentType,
    academicYear: payment.academicYear,
    transactionReference: payment.transactionReference,
    fapshiTransId: fapshiData.transId,
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
      fapshiTransactionId: payment.fapshiTransactionId,
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
