import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";


dotenv.config(); // ✅ make sure environment variables are loaded

const router = express.Router();

// Temporary OTP stores
const signupOtpStore = {};
const loginOtpStore = {};

// JWT helper
const sendToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

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

// Nodemailer transporter ✅
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // must be set in .env
    pass: process.env.EMAIL_PASS, // use Gmail App Password here
  },
});

// ===== Signup Step 1: request OTP =====
router.post("/signup-request", async (req, res) => {
  try {
    const { name, email, password, phone = "", profilePic = "" } = req.body;

    if (!name?.trim() || !email?.trim() || !password?.trim())
      return res.status(400).json({ message: "All fields required" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    signupOtpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      userData: { name, email, password, phone, profilePic },
    };

    // ✅ send mail
    await transporter.sendMail({
      from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Signup OTP",
      text: `Hello ${name}, your OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Signup request error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ===== Signup Step 2: verify OTP =====
router.post("/signup-verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = signupOtpStore[email];

    if (!record) return res.status(400).json({ message: "No OTP found" });
    if (record.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const { name, password, phone, profilePic } = record.userData;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, profilePic });
    await user.save();

    delete signupOtpStore[email];
    return sendToken(user, res);
  } catch (err) {
    console.error("Signup verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Login Step 1: request OTP =====
router.post("/login-request", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    loginOtpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await transporter.sendMail({
      from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Login OTP",
      text: `Your login OTP is ${otp}. Expires in 5 minutes.`,
    });

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error("Login request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Login Step 2: verify OTP =====
router.post("/login-verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = loginOtpStore[email];
    if (!record) return res.status(400).json({ message: "No OTP found" });
    if (record.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    delete loginOtpStore[email];
    return sendToken(user, res);
  } catch (err) {
    console.error("Login verify error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// Middleware to check JWT in cookie
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message: "User not found" });

    next();
  } catch (err) {
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
    req.user.name = name || req.user.name;
    req.user.phone = phone || req.user.phone;
    req.user.profilePic = profilePic || req.user.profilePic;

    await req.user.save();
    res.json({ user: req.user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
