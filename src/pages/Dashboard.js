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
        const res = await fetch(`${API_BASE}/api/requests`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
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

  const sortedRequests = useMemo(() => {
    if (!requests) return [];
    const arr = [...requests];
    const order = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "date") {
      arr.sort((a, b) => {
        const da = new Date(a.date).getTime() || 0;
        const db = new Date(b.date).getTime() || 0;
        return (da - db) * order;
      });
    } else if (sortBy === "emergency") {
      arr.sort((a, b) => {
        const ea = a.emergency ? 1 : 0;
        const eb = b.emergency ? 1 : 0;
        return (eb - ea) * order;
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

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "-";

  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <h2 className="dashboard-title">
          <span className="dashboard-icon" role="img" aria-label="dashboard">📊</span>
          Dashboard
        </h2>
        <div className="dashboard-sub">Track and sort blood requests</div>
      </header>

      <div className="controls">
        <div className="control-group">
          <label className="control-label">Sort by</label>
          <select className="control-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="emergency">Emergency</option>
            <option value="location">Location (city)</option>
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Order</label>
          <select className="control-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="control-stats">Showing <strong>{sortedRequests.length}</strong> requests</div>
      </div>

      {loading ? (
        <div className="loading">Loading requests...</div>
      ) : error ? (
        <div className="error-block">
          <div>{error}</div>
          <div className="debug-info">Trying to connect to: {API_BASE}/api/requests</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Blood</th>
                <th>Hospital</th>
                <th>City</th>
                <th>Date</th>
                <th>Time</th>
                <th className="col-emergency">Emergency</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((req, idx) => (
                <tr key={req._id || idx} className={req.emergency ? "row-emergency" : ""}>
                  <td className="patient-cell">{req.patientName}</td>
                  <td>
                    <span className={`blood-type-badge blood-type-${(req.bloodType || "").replace("+", "pos").replace("-", "neg")}`}>
                      {req.bloodType}
                    </span>
                  </td>
                  <td className="muted">{req.hospitalName}</td>
                  <td>{req.city}</td>
                  <td>{formatDate(req.date)}</td>
                  <td>{req.time || "-"}</td>
                  <td className="col-emergency">
                    {req.emergency ? <span className="emergency-pill">EMERGENCY</span> : <span className="ok-pill">Normal</span>}
                  </td>
                  <td><a className="contact-link" href={`tel:${req.contactNumber}`}>{req.contactNumber}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}