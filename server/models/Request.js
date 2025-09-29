import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  bloodType: { type: String, required: true },
  hospitalName: { type: String },
  city: { type: String },
  contactNumber: { type: String },
  emergency: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  time: { type: String },
  unitsRequested: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Request = mongoose.model("Request", requestSchema);
export default Request;
