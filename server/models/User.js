import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  profilePic: { type: String },
  bloodGroup: { type: String },
  lastAcceptedDate: { type: Date },
  acceptedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Request" }],
  otp: { type: String },
  otpExpires: { type: Date },

  // tokenVersion allows server-side revocation of JWTs
  tokenVersion: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
export default User;
