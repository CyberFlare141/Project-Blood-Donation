import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import requestsRoutes from "./routes/request.js";
import bloodRoutes from "./routes/blood.js";
import { co2 } from "@tgwf/co2"; // added
import jwt from "jsonwebtoken"; // make sure you import this

dotenv.config();
console.log("Email user:", process.env.EMAIL_USER ? "Loaded" : "Missing");
console.log("Email pass:", process.env.EMAIL_PASS ? "Loaded" : "Missing");

const app = express();

// ------------------ CO₂ Setup ------------------
const co2Emission = new co2({ model: "swd" }); // Sustainable Web Design model

// Middleware to track request/response size
app.use((req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  // Measure request size
  if (req.body) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.body), "utf8");
  }
  if (req.query) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.query), "utf8");
  }
  if (req.headers) {
    requestBytes += Buffer.byteLength(JSON.stringify(req.headers), "utf8");
  }

  // Intercept response
  const originalWrite = res.write;
  const originalEnd = res.end;

  res.write = function (chunk, ...args) {
    if (chunk) responseBytes += Buffer.byteLength(chunk, "utf8");
    originalWrite.apply(res, [chunk, ...args]);
  };

  res.end = function (chunk, ...args) {
    if (chunk) responseBytes += Buffer.byteLength(chunk, "utf8");

    const totalBytes = requestBytes + responseBytes;
    const emissions = co2Emission.perByte(totalBytes, false); // false = not green hosting

    console.log(`🌍 Data transferred: ${totalBytes} bytes`);
    console.log(`🌱 Estimated CO₂ emissions: ${emissions.toFixed(4)} grams`);

    originalEnd.apply(res, [chunk, ...args]);
  };

  next();
});
// -------------------------------------------------

app.use("/api", bloodRoutes);
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Request log
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  console.log("Request received:", {
    method: req.method,
    path: req.path,
    origin: req.headers.origin,
  });
  next();
});

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    port: process.env.PORT || 5001,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestsRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// JWT Helper
const sendToken = (user, res) => {
  const payload = { id: user._id, v: user.tokenVersion ?? 0 };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "3d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  };

  res.cookie("token", token, cookieOptions);

  return res.json({
    message: "Auth successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
    },
  });
};

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS enabled for: http://localhost:3000`);
  connectDB();
});
