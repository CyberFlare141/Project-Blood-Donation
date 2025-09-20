import React, { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import "./BloodRequestForm.css";

function BloodRequestForm() {
  const [formData, setFormData] = useState({
    patientName: "",
    hospitalName: "",
    city: "",
    bloodType: "",
    date: "",
    time: "",
    contactNumber: "",
    emergency: false, // new
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { API_BASE } = useAuth(); // Get API_BASE from context

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/requests`, { // Use API_BASE here
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitStatus({ type: "success", message: "Blood request submitted successfully!" });
        setFormData({
          patientName: "",
          hospitalName: "",
          city: "",
          bloodType: "",
          date: "",
          time: "",
          contactNumber: "",
          emergency: false,
        });
      } else {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        setSubmitStatus({ 
          type: "error", 
          message: errorData.message || "Failed to submit request. Please try again." 
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitStatus({ 
        type: "error", 
        message: "Network error. Please check if the server is running." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Request Blood</h2>
      
      {submitStatus && (
        <div className={`status-message ${submitStatus.type}`}>
          {submitStatus.message}
          <div className="debug-info">
            API: {API_BASE}/api/requests
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          value={formData.patientName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="hospitalName"
          placeholder="Hospital Name"
          value={formData.hospitalName}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <select
          name="bloodType"
          value={formData.bloodType}
          onChange={handleChange}
          required
          disabled={isSubmitting}
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

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            name="emergency"
            checked={formData.emergency}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          Emergency
        </label>

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          required
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </div>
  );
}

export default BloodRequestForm;
