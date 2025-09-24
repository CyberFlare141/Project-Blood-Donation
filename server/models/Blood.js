// server/models/Blood.js
import mongoose from "mongoose";

const bloodSchema = new mongoose.Schema({
  bloodType: { type: String, required: true, unique: true },
  units: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const Blood = mongoose.model("Blood", bloodSchema);
export default Blood;
