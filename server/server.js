import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dotenv from "dotenv";

import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
// fix: import the actual requests router file (it's named request.js)
import requestsRoutes from "./routes/request.js";
import bloodRoutes from "./routes/blood.js";



dotenv.config();
console.log("Email user:", process.env.EMAIL_USER ? "Loaded" : "Missing");
console.log("Email pass:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
const app = express();

app.use("/api", bloodRoutes);
// Simplified CORS configuration
app.use(cors({
  origin: "http://localhost:3000", // Your React app
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}));

app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});


// Debug middleware to see CORS requests
app.use((req, res, next) => {
  console.log('Request received:', {
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
    timestamp: new Date().toISOString()
  });
});

// Your routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestsRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// Helper: sign JWT and set cookie
const sendToken = (user, res) => {
  // include user.tokenVersion so tokens can be revoked server-side by bumping this value
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

// Use port from environment or default to 5001
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS enabled for: http://localhost:3000`);
  connectDB();
});

