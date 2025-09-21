// server/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Temporary OTP stores (in-memory; replace with persistent store in production)
const signupOtpStore = {};
const loginOtpStore = {};

// Helper: sign JWT and set cookie
const sendToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
  };

  res.cookie("token", token, cookieOptions);

  return res.json({
    message: "Auth successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
    },
  });
};

// Configure nodemailer transporter (Gmail + App Password recommended)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// optional: verify transporter at startup (logs but doesn't crash)
transporter.verify().then(() => {
  console.log("Nodemailer transporter ready");
}).catch((err) => {
  console.warn("Nodemailer verify failed:", err.message || err);
});

// ===== Signup Step 1: request OTP =====
router.post("/signup-request", async (req, res) => {
  try {
    const { name, email, password, phone = "", profilePic = "" } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "All fields required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    signupOtpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      userData: { name, email, password, phone, profilePic },
    };

    try {
      await transporter.sendMail({
        from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Signup OTP — BloodBridge",
        text: `Hello ${name},\n\nYour OTP for signup is ${otp}. It expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
      });
    } catch (mailErr) {
      console.error("Failed to send OTP email:", mailErr);
      // remove stored OTP on failure to avoid stale state
      delete signupOtpStore[email];
      return res.status(500).json({ message: "Failed to send OTP. Check email credentials or network." });
    }

    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Signup request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Signup Step 2: verify OTP =====
router.post("/signup-verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = signupOtpStore[email];

    if (!record) return res.status(400).json({ message: "No OTP found" });
    if (record.expiresAt < Date.now()) {
      delete signupOtpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const { name, password, phone, profilePic } = record.userData;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, profilePic });
    await user.save();

    delete signupOtpStore[email];

    return sendToken(user, res);
  } catch (err) {
    console.error("Signup verify error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Login Step 1: request OTP =====
router.post("/login-request", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    loginOtpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    try {
      await transporter.sendMail({
        from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Login OTP — BloodBridge",
        text: `Your login OTP is ${otp}. It expires in 5 minutes.`,
      });
    } catch (mailErr) {
      console.error("Failed to send login OTP:", mailErr);
      delete loginOtpStore[email];
      return res.status(500).json({ message: "Failed to send OTP. Check email credentials or network." });
    }

    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Login request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Login Step 2: verify OTP =====
router.post("/login-verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = loginOtpStore[email];
    if (!record) return res.status(400).json({ message: "No OTP found" });
    if (record.expiresAt < Date.now()) {
      delete loginOtpStore[email];
      return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    delete loginOtpStore[email];
    return sendToken(user, res);
  } catch (err) {
    console.error("Login verify error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Middleware to check JWT in cookie
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ===== Get current user =====
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ===== Update current user =====
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, phone, profilePic } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.profilePic = profilePic ?? user.profilePic;

    await user.save();
    const safeUser = await User.findById(user._id).select("-password");
    return res.json({ user: safeUser });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Logout =====
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});

// ===== Profile routes (by id) =====
router.get("/profile/:id", requireAuth, async (req, res) => {
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

router.put("/profile/:id", requireAuth, async (req, res) => {
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
