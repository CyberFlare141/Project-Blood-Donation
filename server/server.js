import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import dotenv from "dotenv";

import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";

dotenv.config();
console.log("Email user:", process.env.EMAIL_USER ? "Loaded" : "Missing");
console.log("Email pass:", process.env.EMAIL_PASS ? "Loaded" : "Missing");
const app = express();


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


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server Error:", error);
  res.status(500).json({ message: "Internal server error" });
});

// Use port from environment or default to 5001
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`✅ CORS enabled for: http://localhost:3000`);
  connectDB();
});

