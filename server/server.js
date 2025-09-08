import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDb from "./config/db.js";
import authRoutes from "./routes/auth.js";
import requestRoutes from "./routes/request.js"; 

dotenv.config();
const app = express();

app.use(cors({ origin: ["http://localhost:3000"], credentials: false }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes); 


app.get("/", (req, res) => {
  res.send("✅ Server is running and MongoDB connection initialized");
});


const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
