const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: ["tuition", "registration", "hostel", "library", "other"],
      required: true,
    },
    academicYear: { type: String, required: true },
    level: { type: String, required: true },
    installment: {
      current: { type: Number, default: 1 },
      total: { type: Number, default: 1 },
    },
    momoProvider: { type: String, enum: ["MTN", "Orange"], required: true },
    momoNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    transactionReference: { type: String, unique: true },
    failureReason: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
