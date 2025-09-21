import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./BloodRequestForm.css";

function BloodRequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    hospitalName: "",
    city: "",
    bloodType: "",
    date: "",
    time: "",
    contactNumber: "",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/requests", formData, {
        withCredentials: true,
      });
      alert("Blood request submitted successfully!");
      setFormData({
        patientName: "",
        hospitalName: "",
        city: "",
        bloodType: "",
        date: "",
        time: "",
        contactNumber: "",
      });
    } catch (err) {
      alert("Failed to submit request");
    }
  };

  // If user is not logged in, show message inside page
  if (!user) {
    return (
      <div className="form-container">
        <div className="login-message-card">
          <p>You have to log in to see the contents of this page.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <h2>Request Blood</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          value={formData.patientName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="hospitalName"
          placeholder="Hospital Name"
          value={formData.hospitalName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <select
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
          required
        >
          <option value="">Select Blood Type</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
        </select>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default BloodRequestForm;
