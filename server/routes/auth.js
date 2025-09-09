import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Request from "../models/Request.js";

const router = express.Router();


router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone = "", profilePic = "" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, profilePic });
    await user.save();

    res.status(201).json({
      message: "Signup successful",
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, profilePic: user.profilePic },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const request = new Request(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
});


router.put("/profile/:id", async (req, res) => {
  try {
    const { name, phone, profilePic } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, profilePic },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Failed to update profile" });
  }
});

export default router;