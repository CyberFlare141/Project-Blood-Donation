import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext"; // Import useAuth
import "./Dashboard.css";

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { API_BASE } = useAuth(); // Get API_BASE from context

  // Sorting state
  const [sortBy, setSortBy] = useState("date"); // "date" | "emergency" | "location"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" | "desc"

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
  }, [API_BASE]);

  // derived sorted list
  const sortedRequests = useMemo(() => {
    if (!requests) return [];
    const arr = [...requests];
    const order = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "date") {
      arr.sort((a, b) => {
        // compare yyyy-mm-dd strings safely
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return (da - db) * order;
      });
    } else if (sortBy === "emergency") {
      // emergency first when desc, last when asc
      arr.sort((a, b) => {
        const ea = a.emergency ? 1 : 0;
        const eb = b.emergency ? 1 : 0;
        return (eb - ea) * order; // eb-ea so true (1) sorts before false when order = 1/-1 accordingly
      });
    } else if (sortBy === "location") {
      arr.sort((a, b) => {
        const ca = (a.city || "").toLowerCase();
        const cb = (b.city || "").toLowerCase();
        if (ca < cb) return -1 * order;
        if (ca > cb) return 1 * order;
        return 0;
      });
    }

    return arr;
  }, [requests, sortBy, sortOrder]);

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

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>
          Sort by:&nbsp;
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="emergency">Emergency</option>
            <option value="location">Location (city)</option>
          </select>
        </label>

        <label>
          Order:&nbsp;
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </label>

        <div style={{ marginLeft: "auto", fontSize: 14, color: "#555" }}>
          Showing {sortedRequests.length} request(s)
        </div>
      </div>
      
      {sortedRequests.length === 0 ? (
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
                <th>Emergency</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((req, idx) => (
                <tr key={idx}>
                  <td>{req.patientName}</td>
                  <td>
                    <span className={`blood-type-badge blood-type-${req.bloodType.replace('+', 'pos').replace('-', 'neg')}`}>
                      {req.bloodType}
                    </span>
                  </td>
                  <td>{req.hospitalName}</td>
                  <td>{req.city}</td>
                  <td>{req.date ? new Date(req.date).toLocaleDateString() : "-"}</td>
                  <td>{req.time}</td>
                  <td style={{ textAlign: "center" }}>
                    {req.emergency ? <span style={{ color: "red", fontWeight: 700 }}>YES</span> : "—"}
                  </td>
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