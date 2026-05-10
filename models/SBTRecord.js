const mongoose = require("mongoose");

const sbtRecordSchema = new mongoose.Schema(
  {
    receipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: { type: String, required: true },
    tokenId: { type: String },
    transactionHash: { type: String },
    contractAddress: { type: String },
    network: { type: String, default: "Polygon Amoy Testnet" },
    mintStatus: {
      type: String,
      enum: ["pending", "minted", "failed"],
      default: "pending",
    },
    mintedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SBTRecord", sbtRecordSchema);
