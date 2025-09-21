import express from "express";
import Request from "../models/Request.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create request (authenticated) -> attach user as owner
router.post("/", authMiddleware, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user: req.user._id, // attach owner
      createdAt: req.body.createdAt || new Date(),
    };
    const request = new Request(payload);
    await request.save();
    // return created request
    return res.status(201).json(request);
  } catch (err) {
    console.error("POST /api/requests error:", err);
    return res.status(400).json({ error: err.message });
  }
});

// Public: list all requests (for dashboard)
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    console.error("GET /api/requests error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Authenticated: list current user's requests
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (err) {
    console.error("GET /api/requests/my error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete request by id (only owner can delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const reqDoc = await Request.findById(id);
    if (!reqDoc) return res.status(404).json({ message: "Request not found" });

    // check ownership
    if (!reqDoc.user || reqDoc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this request" });
    }

    await reqDoc.remove();
    return res.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/requests/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
