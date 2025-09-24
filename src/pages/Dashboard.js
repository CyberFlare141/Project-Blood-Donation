import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import ResponsiveNav from "../components/ResponsiveNav"; 
export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { API_BASE } = useAuth();

  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        const data = await res.json();
        setUser(data.user);
        setAcceptedRequests(data.user.acceptedRequests || []);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [API_BASE]);

 
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
        console.error(err);
        setError("Failed to load requests. Check if server is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [API_BASE]);

 
  useEffect(() => {
    if (!user) return;
    const acceptedIds = new Set(acceptedRequests.map(r => r._id));
    setPendingRequests(requests.filter(r => !acceptedIds.has(r._id)));
  }, [requests, acceptedRequests, user]);

 
  const handleAccept = async (req) => {
    try {
      const res = await fetch(`${API_BASE}/api/requests/${req._id}/accept`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAcceptedRequests(prev => [...prev, req]);
        setPendingRequests(prev => prev.filter(r => r._id !== req._id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to accept request");
    }
  };

 
  const canAccept = (req) => {
    if (!user) return { ok: false, reason: "Login required" };
    if (acceptedRequests.find(r => r._id === req._id)) return { ok: false, reason: "Already accepted" };
    if (!user.bloodGroup || user.bloodGroup !== req.bloodType) return { ok: false, reason: "Blood type mismatch" };
    if (user.lastAcceptedDate) {
      const last = new Date(user.lastAcceptedDate);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      if (last > threeMonthsAgo) return { ok: false, reason: "Wait 3 months between donations" };
    }
    return { ok: true, reason: "" };
  };

  const formatDate = d =>
    d ? new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "-";

 
  const sortedPending = useMemo(() => {
    const arr = [...pendingRequests];
    const order = sortOrder === "asc" ? 1 : -1;
    if (sortBy === "date") arr.sort((a,b)=> (new Date(a.date) - new Date(b.date)) * order);
    else if (sortBy === "emergency") arr.sort((a,b)=> ((b.emergency?1:0)-(a.emergency?1:0)) * order);
    else if (sortBy==="location") arr.sort((a,b)=> ((a.city||"").localeCompare(b.city||"")) * order);
    return arr;
  }, [pendingRequests, sortBy, sortOrder]);

  return (
    <><ResponsiveNav />
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <h2 className="dashboard-title"><span>📊</span> Dashboard</h2>
        <div className="dashboard-sub">Track and manage blood requests</div>
      </header>

      <div className="controls">
        <div className="control-group">
          <label>Sort by:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Date</option>
            <option value="emergency">Emergency</option>
            <option value="location">City</option>
          </select>
        </div>
        <div className="control-group">
          <label>Order:</label>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
        <div className="control-stats">
          Pending: {sortedPending.length} | Accepted: {acceptedRequests.length}
        </div>
      </div>

      {loading ? <p className="loading">Loading requests...</p> :
      error ? <p className="error-block">{error}</p> : <>
        <h3>Pending Requests</h3>
        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Patient</th><th>Blood</th><th>Hospital</th><th>City</th>
                <th>Date</th><th>Time</th><th>Emergency</th><th>Contact</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedPending.map(req=>{
                const {ok, reason} = canAccept(req);
                return (
                  <tr key={req._id} className={req.emergency?"row-emergency":""}>
                    <td>{req.patientName}</td>
                    <td>
                      <span className={`blood-type-badge blood-type-${req.bloodType.replace("+","pos").replace("-","neg")}`}>
                        {req.bloodType}
                      </span>
                    </td>
                    <td>{req.hospitalName}</td>
                    <td>{req.city}</td>
                    <td>{formatDate(req.date)}</td>
                    <td>{req.time || "-"}</td>
                    <td>{req.emergency?
                      <span className="emergency-pill">EMERGENCY</span>
                      :<span className="ok-pill">Normal</span>}
                    </td>
                    <td><a href={`tel:${req.contactNumber}`}>{req.contactNumber}</a></td>
                    <td>
                      {acceptedRequests.find(r=>r._id===req._id)?(
                        <span className="accepted-msg">Accepted</span>
                      ):(
                        <button className={`accept-btn ${!ok?"disabled-btn":""}`} disabled={!ok} title={!ok?reason:"Accept request"} onClick={()=>handleAccept(req)}>
                          Accept
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <h3>Accepted Requests</h3>
        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Patient</th><th>Blood</th><th>Hospital</th><th>City</th>
                <th>Date</th><th>Time</th><th>Emergency</th><th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {acceptedRequests.map(req=>(
                <tr key={req._id} className={req.emergency?"row-emergency":""}>
                  <td>{req.patientName}</td>
                  <td>
                    <span className={`blood-type-badge blood-type-${req.bloodType.replace("+","pos").replace("-","neg")}`}>
                      {req.bloodType}
                    </span>
                  </td>
                  <td>{req.hospitalName}</td>
                  <td>{req.city}</td>
                  <td>{formatDate(req.date)}</td>
                  <td>{req.time || "-"}</td>
                  <td>{req.emergency?
                    <span className="emergency-pill">EMERGENCY</span>
                    :<span className="ok-pill">Normal</span>}
                  </td>
                  <td><a href={`tel:${req.contactNumber}`}>{req.contactNumber}</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>}
    </div>
    </>
  );
}
