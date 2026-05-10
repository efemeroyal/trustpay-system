const express = require("express");
const router = express.Router();
const {
  registerStudent,
  registerAdmin,
  loginUser,
  getProfile,
  getAllUsers,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.post("/register/student", registerStudent);
router.post("/register/admin", registerAdmin);
router.post("/login", loginUser);
router.get("/profile", protect, getProfile);
router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;
