const express = require("express");
const router = express.Router();
const {
  getStudentHistory,
  getStudentHistoryByAdmin,
  getInstallmentStatus,
} = require("../controllers/historyController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/my-history", protect, getStudentHistory);
router.get("/installments", protect, getInstallmentStatus);
router.get("/student/:studentId", protect, adminOnly, getStudentHistoryByAdmin);

module.exports = router;
