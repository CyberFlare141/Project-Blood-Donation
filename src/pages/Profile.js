import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, setUser, API_BASE } = useAuth(); // Get API_BASE from context
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", profilePic: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?._id) {
      setLoading(true);
      fetch(`${API_BASE}/api/auth/profile/${user._id}`) // Use API_BASE here
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          setProfile(data);
          setForm({ 
            name: data.name, 
            phone: data.phone || "", 
            profilePic: data.profilePic || "" 
          });
          setError(null);
        })
        .catch(err => {
          console.error("Profile fetch error:", err);
          setError("Failed to load profile");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, API_BASE]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile/${user._id}`, { // Use API_BASE here
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setProfile(data);
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setEdit(false);
      setError(null);
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div className="error">No profile data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={profile.profilePic || "/assets/profile.jpg"}
          alt="Profile"
          className="profile-avatar"
          onError={(e) => {
            e.target.src = "/assets/profile.jpg"; // Fallback image
          }}
        />
        
        {error && <div className="error-message">{error}</div>}
        
        {edit ? (
          <form onSubmit={handleSave} className="profile-form">
            <div className="profile-form-group">
              <label>Name:</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="profile-form-group">
              <label>Phone:</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />
            </div>
            <div className="profile-form-group">
              <label>Profile Picture URL:</label>
              <input
                name="profilePic"
                value={form.profilePic}
                onChange={handleChange}
                placeholder="Enter image URL"
              />
            </div>
            <div className="profile-form-actions">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={() => setEdit(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="profile-name">{profile.name}</div>
            <div className="profile-email">{profile.email}</div>
            {profile.phone && <div className="profile-phone">{profile.phone}</div>}
            <div className="profile-edit-btn-wrap">
              <button className="profile-edit-btn" onClick={() => setEdit(true)}>
                Edit Profile
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;