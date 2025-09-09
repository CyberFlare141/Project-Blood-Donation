import React, { useEffect, useState } from "react";
import "./Dashboard.css"; // (Optional: create this if you want custom styles)

export default function Dashboard() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/requests");
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      }
    };
    fetchRequests();
  }, []);

  return (
    <div className="dashboard-page">
      <h2 className="dashboard-title">
        <span role="img" aria-label="dashboard" className="dashboard-icon">
          📊
        </span>
        Dashboard
      </h2>
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
              <td>{req.bloodType}</td>
              <td>{req.hospitalName}</td>
              <td>{req.city}</td>
              <td>{req.date}</td>
              <td>{req.time}</td>
              <td>{req.contactNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}