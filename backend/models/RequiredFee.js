const mongoose = require("mongoose");

const requiredFeeSchema = new mongoose.Schema(
  {
    paymentType: {
      type: String,
      enum: ["tuition", "registration", "hostel", "library", "other"],
      required: true,
    },
    academicYear: { type: String, required: true },
    level: {
      type: String,
      enum: ["Year 1", "Year 2", "Year 3", "Year 4"],
      required: true,
    },
    requiredAmount: { type: Number, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Ensure only one fee record per combination
requiredFeeSchema.index(
  { paymentType: true, academicYear: true, level: true },
  { unique: true },
);

module.exports = mongoose.model("RequiredFee", requiredFeeSchema);
