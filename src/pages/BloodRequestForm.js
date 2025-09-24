import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./BloodRequestForm.css";
import ResponsiveNav from "../components/ResponsiveNav"; 
function BloodRequestForm() {
  const { user, API_BASE } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: "",
    hospitalName: "",
    city: "",
    bloodType: "",
    date: "",
    time: "",
    contactNumber: "",
    emergency: false,
    unitsRequested: 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((s) => ({
      ...s,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
          unitsRequested: 1,
        });
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus({ type: "error", message: "Network/server error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render nav always, then show login prompt or form
  return (
    <>
      <ResponsiveNav />

      {!user ? (
        <div className="form-container">
          <div className="login-message-card">
            <p>You have to log in to submit requests.</p>
            <button onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      ) : (
        <section className="brf-page">
          <div className="brf-card">
            <h2>Request Blood</h2>
            {submitStatus && <div className={`brf-status ${submitStatus.type}`}>{submitStatus.message}</div>}
            <form className="brf-form" onSubmit={handleSubmit}>
              <input name="patientName" placeholder="Patient Name" value={formData.patientName} onChange={handleChange} required disabled={isSubmitting} />
              <input name="hospitalName" placeholder="Hospital Name" value={formData.hospitalName} onChange={handleChange} required disabled={isSubmitting} />
              <select name="city" value={formData.city} onChange={handleChange} required disabled={isSubmitting}>
                <option value="">Select City</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Khulna">Khulna</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Mymensingh">Mymensingh</option>
                <option value="Barisal">Barisal</option>
                <option value="Sylhet">Sylhet</option>
              </select>
              <select name="bloodType" value={formData.bloodType} onChange={handleChange} required disabled={isSubmitting}>
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
              <input type="date" name="date" value={formData.date} onChange={handleChange} required disabled={isSubmitting} />
              <input type="time" name="time" value={formData.time} onChange={handleChange} required disabled={isSubmitting} />
              <input type="text" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required disabled={isSubmitting} />
              <input type="number" name="unitsRequested" placeholder="Units Needed" value={formData.unitsRequested} onChange={handleChange} min="1" required disabled={isSubmitting} />
              <label>
                Emergency
                <input type="checkbox" name="emergency" checked={formData.emergency} onChange={handleChange} disabled={isSubmitting} />
              </label>
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Request"}</button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}

export default BloodRequestForm;
