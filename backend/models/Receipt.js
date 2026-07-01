const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: { type: String, required: true },
    receiptId: { type: String, required: true, unique: true },
    referenceNumber: { type: String, required: true, unique: true },
    hmacSignature: { type: String, required: true },
    qrCodeData: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentType: { type: String, required: true },
    academicYear: { type: String, required: true },
    level: { type: String, required: true },
    ipfsCID: { type: String }, // ← IPFS CID from Pinata upload
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDuplicate: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Receipt", receiptSchema);
