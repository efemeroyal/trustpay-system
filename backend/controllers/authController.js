const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const registerStudent = async (req, res) => {
  const { fullName, email, password, studentId, programme, level } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }
  const user = await User.create({
    fullName,
    email,
    password,
    role: "student",
    studentId,
    programme,
    level,
  });
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      token: generateToken(user._id),
    },
  });
};

const registerAdmin = async (req, res) => {
  const { fullName, email, password, department } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("A user with this email already exists");
  }
  const user = await User.create({
    fullName,
    email,
    password,
    role: "admin",
    department,
  });
  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    },
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        token: generateToken(user._id),
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json({ success: true, data: user });
};

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.json({ success: true, count: users.length, data: users });
};

module.exports = {
  registerStudent,
  registerAdmin,
  loginUser,
  getProfile,
  getAllUsers,
};
