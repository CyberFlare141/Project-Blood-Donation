import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.token;
    const headerToken =
      req.headers?.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }


    if (typeof decoded.v !== "undefined" && decoded.v !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({ message: "Token revoked" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
