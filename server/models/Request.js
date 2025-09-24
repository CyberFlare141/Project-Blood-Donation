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
  unitsRequested: { type: Number, required: true, default: 1 }, // added
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // owner
  acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // accepted by
});

const Request = mongoose.model("Request", requestSchema);
export default Request;
