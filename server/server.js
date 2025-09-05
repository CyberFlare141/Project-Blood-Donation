import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: ["http://localhost:3000"], credentials: false }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("✅ Server is running and MongoDB connection initialized");
});

// Connect Database & Start Server
const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
