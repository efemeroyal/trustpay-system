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
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "validated", "rejected"],
      default: "pending",
    },
    verifiedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verificationCount: { type: Number, default: 0 },
    isDuplicate: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Receipt", receiptSchema);
