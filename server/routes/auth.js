import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to generate JWT + set cookie
const sendToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "3d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  };

  console.log("auth.sendToken: setting cookie options:", cookieOptions);
  // For debugging only: do not log token in production
  console.log("auth.sendToken: userId=", user._id.toString());

  res.cookie("token", token, cookieOptions);

  return res.json({
    message: "Auth successful",
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, profilePic: user.profilePic },
  });
};
// ===== Signup =====
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

    return sendToken(user, res);
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Login =====
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

    return sendToken(user, res);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = req.user;
  res.json({ user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});

// --- NEW: profile routes ---
router.get("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("GET /profile/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // only allow owner to update their profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, phone, profilePic } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (profilePic !== undefined) user.profilePic = profilePic;

    await user.save();
    const safeUser = await User.findById(id).select("-password");
    return res.json(safeUser);
  } catch (err) {
    console.error("PUT /profile/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;