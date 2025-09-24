import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Request from "../models/Request.js"; 
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const signupOtpStore = {};
const loginOtpStore = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
transporter.verify()
  .then(() => console.log("Nodemailer ready"))
  .catch(console.warn);

const sendToken = (user, res) => {
  const payload = { id: user._id, v: user.tokenVersion ?? 0 };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
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
      bloodGroup: user.bloodGroup,
      lastAcceptedDate: user.lastAcceptedDate || null,
      acceptedRequests: user.acceptedRequests || [],
    },
  });
};

// ===== Signup request OTP =====
router.post("/signup-request", async (req, res) => {
  try {
    const { name, email, password, phone = "", profilePic = "", bloodGroup = "" } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User exists" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    signupOtpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      userData: { name, email, password, phone, profilePic, bloodGroup },
    };

    await transporter.sendMail({
      from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Signup OTP — BloodBridge",
      text: `Hello ${name},\nYour OTP is ${otp}. Expires in 5 minutes.`,
    });

    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Signup verify OTP =====
router.post("/signup-verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = signupOtpStore[email];
    if (!record) return res.status(400).json({ message: "No OTP found" });
    if (record.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const { name, password, phone, profilePic, bloodGroup } = record.userData;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, phone, profilePic, bloodGroup });
    await user.save();
    delete signupOtpStore[email];

    return sendToken(user, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Login request OTP =====
router.post("/login-request", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    loginOtpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

    await transporter.sendMail({
      from: `"BloodBridge" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Login OTP — BloodBridge",
      text: `Hello ${user.name},\nYour OTP is ${otp}. Expires in 5 minutes.`,
    });

    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Login verify OTP =====
router.post("/login-verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = loginOtpStore[email];
    if (!record) return res.status(400).json({ message: "No OTP found" });
    if (record.expiresAt < Date.now()) return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    delete loginOtpStore[email];

    return sendToken(user, res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===== Middleware =====
const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verify failed:", err);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).populate("acceptedRequests");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (typeof decoded.v !== "undefined" && decoded.v !== (user.tokenVersion ?? 0))
      return res.status(401).json({ message: "Token revoked" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Get current user 
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

// Update user
router.put("/me", requireAuth, async (req, res) => {
  try {
    const { name, phone, profilePic, bloodGroup } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = name ?? user.name;
    user.phone = phone ?? user.phone;
    user.profilePic = profilePic ?? user.profilePic;
    user.bloodGroup = bloodGroup ?? user.bloodGroup;

    await user.save();
    const safeUser = await User.findById(user._id).select("-password").populate("acceptedRequests");
    return res.json({ user: safeUser });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Accept blood request 
router.post("/requests/:id/accept", requireAuth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (req.user.bloodGroup !== request.bloodType)
      return res.status(400).json({ message: "Your blood type does not match the request" });

    if (req.user.lastAcceptedDate) {
      const last = new Date(req.user.lastAcceptedDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (last > threeMonthsAgo)
        return res.status(400).json({ message: "You must wait 3 months between donations" });
    }

    req.user.acceptedRequests.push(request._id);
    req.user.lastAcceptedDate = new Date();
    await req.user.save();

    return res.json({ message: "Request accepted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

//Revoke JWTs 
router.post("/revoke", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.tokenVersion = (user.tokenVersion ?? 0) + 1;
    await user.save();

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return res.json({ success: true, message: "Tokens revoked for this account" });
  } catch (err) {
    console.error("Revoke error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
