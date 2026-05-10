const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  getMyPayments,
} = require("../controllers/paymentController");
const { protect, studentOnly } = require("../middleware/authMiddleware");

router.post("/initiate", protect, studentOnly, initiatePayment);
router.get("/my-payments", protect, studentOnly, getMyPayments);

module.exports = router;
