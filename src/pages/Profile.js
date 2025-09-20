import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", profilePic: "" });

  useEffect(() => {
    if (user?._id) {
      fetch(`http://localhost:5000/api/auth/profile/${user._id}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          setForm({ name: data.name, phone: data.phone, profilePic: data.profilePic || "" });
        });
    }
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async e => {
    e.preventDefault();
    const res = await fetch(`http://localhost:5000/api/auth/profile/${user._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setProfile(data);
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
    setEdit(false);
  };

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
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="profile-form-group">
              <label>Phone:</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
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
              <button type="button" onClick={() => setEdit(false)}>Cancel</button>
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