import express from "express";
import Blood from "../models/Blood.js"; // Or your inventory model

const router = express.Router();

// GET /api/blood-inventory
router.get("/blood-inventory", async (req, res) => {
  try {
    const inventory = await Blood.find(); // Or however you store blood units
    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
