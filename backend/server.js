const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const { setupWebsocket } = require("./wsServer");

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/receipts", require("./routes/receiptRoutes"));
app.use("/api/verify", require("./routes/verificationRoutes"));
app.use("/api/history", require("./routes/historyRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "TrustPay API is running" });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
setupWebsocket(server);

server.listen(PORT, () => {
  console.log(`TrustPay server running on port ${PORT}`);
});
