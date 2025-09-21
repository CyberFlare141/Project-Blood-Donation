import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", profilePic: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    fetch("http://localhost:5000/api/auth/me", {
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 401) {
          // 🔑 Token expired or invalid
          setUser(null);
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setError(err.message || "Failed to load profile");
          return;
        }

        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setProfile(data.user);
          setForm({
            name: data.user.name,
            phone: data.user.phone,
            profilePic: data.user.profilePic || "",
          });
        }
      })
      .catch((e) => setError("Network error: " + e.message));
  }, [user, navigate, setUser]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (res.status === 401) {
        // 🔑 Handle expired token on save too
        setUser(null);
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setEdit(false);
      }
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  // Logged out view
  if (!user) {
    return (
      <div className="profile-container">
        <div className="login-message-card">
          <p>You have to log in to see the contents of this page.</p>
          <button onClick={() => navigate("/login")}>Go to Login</button>
        </div>
      </div>
    );
  }

  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={profile.profilePic || "/assets/profile.jpg"}
          alt="Profile"
          className="profile-avatar"
        />
        {edit ? (
          <form onSubmit={handleSave} className="profile-form">
            <div className="profile-form-group">
              <label>Name:</label>
              <input name="name" value={form.name} onChange={handleChange} />
            </div>
            <div className="profile-form-group">
              <label>Phone:</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="profile-form-group">
              <label>Profile Picture URL:</label>
              <input
                name="profilePic"
                value={form.profilePic}
                onChange={handleChange}
              />
            </div>
            <div className="profile-form-actions">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEdit(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-phone">{profile.phone}</div>
            <div className="profile-edit-btn-wrap">
              <button className="profile-edit-btn" onClick={() => setEdit(true)}>
                Edit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
