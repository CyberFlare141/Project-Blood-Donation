import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./BloodRequestForm.css";

function BloodRequestForm() {
  const { API_BASE } = useAuth();
  const [formData, setFormData] = useState({
    patientName: "",
    hospitalName: "",
    city: "",
    bloodType: "",
    date: "",
    time: "",
    contactNumber: "",
    emergency: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Unknown error" }));
        setSubmitStatus({ type: "error", message: err.message || "Submit failed" });
      } else {
        await res.json();
        setSubmitStatus({ type: "success", message: "Request submitted successfully" });
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
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmitStatus({ type: "error", message: "Network/server error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="brf-page">
      <div className="brf-card">
        <div className="brf-header">
          <div className="brf-title">
            <svg className="brf-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2v10" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 12h14" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="17" r="4" stroke="#b71c1c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Request Blood</h2>
          </div>
          <p className="brf-sub">Submit urgent or routine blood requests. Emergency toggle highlights urgency.</p>
        </div>

        {submitStatus && (
          <div className={`brf-status ${submitStatus.type}`}>
            {submitStatus.message}
            <div className="brf-debug">API: {API_BASE}/api/requests</div>
          </div>
        )}

        <form className="brf-form" onSubmit={handleSubmit}>
          <input
            className="full"
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

          <select
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="">Select City</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chittagong">Chittagong</option>
            <option value="Khulna">Khulna</option>
            <option value="Rajshahi">Rajshahi</option>
            <option value="Mymensingh">Mymensingh</option>
            <option value="Barisal">Barisal</option>
            <option value="Sylhet">Sylhet</option>
          </select>

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

          <div className="emergency-row full">
            <span className="emergency-left">
              <strong>Emergency</strong>
              <span className="emergency-help">  (Mark if immediate attention required)</span>
            </span>

            <label className={`switch ${isSubmitting ? "disabled" : ""}`}>
              <input
                type="checkbox"
                name="emergency"
                checked={formData.emergency}
                onChange={handleChange}
                disabled={isSubmitting}
                aria-label="Emergency"
              />
              <span className="slider" />
            </label>
          </div>

          <button className="submit-btn full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
        <aside className="brf-side">
          <div className="side-badge">⚕️</div>
          <div className="side-title">Quick Tips</div>
          <div className="side-text">
            Use the Emergency toggle for life‑threatening needs. Provide accurate contact info so donors can reach you fast.
          </div>
        </aside>
      </div>
    </section>
  );
}

export default BloodRequestForm;
