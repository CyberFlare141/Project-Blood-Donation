import express from "express";
import Blood from "../models/Blood.js";

const router = express.Router();

router.get("/blood-inventory", async (req, res) => {
  try {
    const inventory = await Blood.find(); 
    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
