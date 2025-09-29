import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

function Profile() {
  const { user, setUser, API_BASE } = useAuth();
  const apiBase = API_BASE || process.env.REACT_APP_API_BASE || "http://localhost:5000";
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", profilePic: "", bloodGroup: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoading(true);
      setError(null);

      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${apiBase}/api/auth/me`, { credentials: "include" });
        if (res.status === 401) {
          setUser(null);
          localStorage.removeItem("user");
          if (mounted) navigate("/login");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        let data = await res.json();
        if (data.user) data = data.user;

        if (mounted) {
          setProfile(data);
          setForm({
            name: data.name || "",
            phone: data.phone || "",
            profilePic: data.profilePic || "",
            bloodGroup: data.bloodGroup || "",
          });
        }
      } catch (err) {
        console.error(err);
        if (mounted) setError("Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();
    return () => (mounted = false);
  }, [user, apiBase, setUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError("You must be logged in to update profile");
      return;
    }

    try {
      const res = await fetch(`${apiBase}/api/auth/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (res.status === 401) {
        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let data = await res.json();
      if (data.user) data = data.user;

      setProfile(data);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setEdit(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!user)
    return (
      <div className="profile-container">
        <div className="login-message-card">
          <p>You have to log in to see this page.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!profile) return <div style={{ color: "#555" }}>No profile data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={profile.profilePic || "/assets/profile.jpg"}
          alt="Profile"
          className="profile-avatar"
          onError={(e) => (e.target.src = "/assets/profile.jpg")}
        />
        {edit ? (
          <form onSubmit={handleSave} className="profile-form">
            <div className="profile-form-group">
              <label>Name:</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="profile-form-group">
              <label>Phone:</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" />
            </div>
            <div className="profile-form-group">
              <label>Profile Picture URL:</label>
              <input name="profilePic" value={form.profilePic} onChange={handleChange} placeholder="Enter image URL" />
            </div>
            <div className="profile-form-group">
              <label>Blood Group:</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => setEdit(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-email">{profile.email}</div>
            {profile.phone && <div className="profile-phone">{profile.phone}</div>}
            {profile.bloodGroup && <div className="profile-blood">Blood Group: {profile.bloodGroup}</div>}
            <div className="profile-edit-btn-wrap">
              <button className="profile-edit-btn" onClick={() => setEdit(true)}>Edit Profile</button>
            </div>
          </>
        )}

        {/* Accepted Blood Requests */}
        <div className="accepted-requests">
          <h3>Accepted Blood Requests</h3>
          {profile.acceptedRequests && profile.acceptedRequests.length > 0 ? (
            <ul>
              {profile.acceptedRequests.map((r) => (
                <li key={r._id}>
                  {r.patientName} - {r.bloodType} - {r.hospitalName} ({new Date(r.date).toLocaleDateString()})
                </li>
              ))}
            </ul>
          ) : (
            <p>No accepted requests yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
