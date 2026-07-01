const express = require("express");
const router = express.Router();
const Receipt = require("../models/Receipt");
const SBTRecord = require("../models/SBTRecord");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/my-receipts", protect, async (req, res) => {
  const receipts = await Receipt.find({ student: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, count: receipts.length, data: receipts });
});

router.get("/all", protect, adminOnly, async (req, res) => {
  const receipts = await Receipt.find({})
    .populate("student", "fullName studentId")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: receipts.length, data: receipts });
});

router.get("/on-chain/:tokenId", protect, async (req, res) => {
  const { tokenId } = req.params;

  const sbtRecord = await SBTRecord.findOne({
    tokenId: tokenId.toString(),
  }).populate("receipt");

  if (!sbtRecord) {
    return res.status(404).json({ success: false, message: "Token not found" });
  }

  // ← Now reads from receipt.ipfsCID instead of tokenURI
  const ipfsCID = sbtRecord.receipt?.ipfsCID;

  if (
    !ipfsCID ||
    ipfsCID.startsWith("fallback-") ||
    ipfsCID.startsWith("placeholder-")
  ) {
    return res.status(404).json({
      success: false,
      message: "No valid IPFS metadata found for this receipt",
    });
  }

  const ipfsResponse = await fetch(
    `https://gateway.pinata.cloud/ipfs/${ipfsCID}`,
  );
  const metadata = await ipfsResponse.json();

  res.json({
    success: true,
    data: {
      tokenId: sbtRecord.tokenId,
      transactionHash: sbtRecord.transactionHash,
      contractAddress: sbtRecord.contractAddress,
      polygonscanUrl: `https://amoy.polygonscan.com/tx/${sbtRecord.transactionHash}`,
      metadata,
    },
  });
});

module.exports = router;
