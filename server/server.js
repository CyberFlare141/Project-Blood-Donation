import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/request.js";

dotenv.config();

const app = express();
const PORT = 5001; // Use port 5001

// CORS middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

// Health endpoint
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running on port 5001!" });
});

// Your routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  connectDB();
});
