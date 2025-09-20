
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import "./Dashboard.css";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { API_BASE } = useAuth(); // Get API_BASE from context

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/requests`); // Use API_BASE here
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        setRequests(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests. Please check if the server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [API_BASE]); // Add API_BASE as dependency

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading">Loading requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-message">{error}</div>
        <div className="debug-info">
          Trying to connect to: {API_BASE}/api/requests
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-title">
        <span role="img" aria-label="dashboard" className="dashboard-icon">
          📊
        </span>
        Dashboard
      </h2>
      
      {requests.length === 0 ? (
        <div className="no-requests">
          <p>No blood requests found.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Blood Type</th>
                <th>Hospital</th>
                <th>City</th>
                <th>Date</th>
                <th>Time</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req, idx) => (
                <tr key={idx}>
                  <td>{req.patientName}</td>
                  <td>
                    <span className={`blood-type-badge blood-type-${req.bloodType.replace('+', 'pos').replace('-', 'neg')}`}>
                      {req.bloodType}
                    </span>
                  </td>
                  <td>{req.hospitalName}</td>
                  <td>{req.city}</td>
                  <td>{new Date(req.date).toLocaleDateString()}</td>
                  <td>{req.time}</td>
                  <td>
                    <a href={`tel:${req.contactNumber}`} className="contact-link">
                      {req.contactNumber}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}