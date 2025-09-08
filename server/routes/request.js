import express from "express";
import Request from "../models/Request.js";

const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const { patientName, hospitalName, city, bloodType, date, time, contactNumber } = req.body;
    const newRequest = new Request({ patientName, hospitalName, city, bloodType, date, time, contactNumber });
    await newRequest.save();
    res.status(201).json({ message: "Blood request created successfully", request: newRequest });
  } catch (err) {
    res.status(500).json({ error: "Failed to create blood request" });
  }
});


router.get("/", async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

export default router;
