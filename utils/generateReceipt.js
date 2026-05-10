const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const generateReceiptId = (studentId, amount, timestamp) => {
  const secret = process.env.JWT_SECRET;
  const data = `${studentId}-${amount}-${timestamp}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

const generateReferenceNumber = async () => {
  const Receipt = require("../models/Receipt");
  const year = new Date().getFullYear();
  const count = await Receipt.countDocuments();
  const padded = String(count + 1).padStart(5, "0");
  return `TRP-${year}-${padded}`;
};

const generateTransactionReference = () => {
  return `TXN-${uuidv4().replace(/-/g, "").substring(0, 12).toUpperCase()}`;
};

module.exports = {
  generateReceiptId,
  generateReferenceNumber,
  generateTransactionReference,
};
