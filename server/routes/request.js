import express from "express";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create request
router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = { 
      ...req.body, 
      user: req.user._id, 
      createdAt: req.body.createdAt || new Date(),
      unitsRequested: req.body.unitsRequested || 1 // default to 1 unit
    };
    const request = new Request(payload);
    await request.save();
    return res.status(201).json(request);
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return res.status(400).json({ error: err.message });
  }
});

// List all requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    console.error("GET /api/requests error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// User's requests
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    console.error("GET /api/requests/my error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete request
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const reqDoc = await Request.findById(req.params.id);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });
    if (!reqDoc.user || reqDoc.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await reqDoc.remove();
    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Accept request
router.post("/:id/accept", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const request = await Request.findById(req.params.id);
    if (!user || !request) return res.status(404).json({ message: "User or request not found" });

    if (!user.bloodGroup || user.bloodGroup !== request.bloodType) {
      return res.status(400).json({ message: "Blood group does not match" });
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (user.lastAcceptedDate && user.lastAcceptedDate > threeMonthsAgo) {
      return res.status(400).json({ message: "Already accepted in last 3 months" });
    }

    if (user.acceptedRequests?.includes(request._id)) {
      return res.status(400).json({ message: "Already accepted this request" });
    }

    user.lastAcceptedDate = new Date();
    user.acceptedRequests = user.acceptedRequests || [];
    user.acceptedRequests.push(request._id);
    await user.save();

    request.acceptedBy = user._id;
    await request.save();

    return res.json({ message: "Request accepted successfully", acceptedDate: user.lastAcceptedDate });
  } catch (err) {
    console.error("POST /api/requests/:id/accept error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Inventory summary: total units per blood type
router.get("/inventory", async (req, res) => {
  try {
    const requests = await Request.find();
    const inventory = {};

    requests.forEach(req => {
      if (!inventory[req.bloodType]) inventory[req.bloodType] = 0;
      inventory[req.bloodType] += req.unitsRequested;
    });

    res.json(inventory);
  } catch (err) {
    console.error("GET /api/requests/inventory error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
