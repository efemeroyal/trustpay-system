const express = require("express");
const router = express.Router();
const {
  verifyReceipt,
  getVerificationHistory,
} = require("../controllers/verificationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/verify", protect, adminOnly, verifyReceipt);
router.get("/history", protect, adminOnly, getVerificationHistory);

module.exports = router;
