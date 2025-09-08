import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  hospitalName: { type: String, required: true },
  city: { type: String, required: true },
  bloodType: { type: String, required: true },
  date: { type: String, required: true },  // store as string for simplicity
  time: { type: String, required: true },  // store as string for simplicity
  contactNumber: { type: String, required: true },
});

const Request = mongoose.model("Request", requestSchema);

export default Request;
