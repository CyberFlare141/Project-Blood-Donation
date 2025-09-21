// src/pages/Profile.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  // Try to read API_BASE from context; fallback to env or localhost
  const { user, setUser, API_BASE } = useAuth();
  const apiBase = API_BASE || process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", profilePic: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: attempt to fetch profile from a list of endpoints
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

      const endpoints = [
        `${apiBase}/api/auth/me`, // preferred (uses cookie)
        `${apiBase}/api/auth/profile/${user._id}`, // fallback
      ];

      let loaded = false;
      for (const url of endpoints) {
        try {
          const res = await fetch(url, { credentials: "include" });

          // handle unauthorized: clear local user and redirect to login
          if (res.status === 401) {
            setUser(null);
            localStorage.removeItem("user");
            if (mounted) navigate("/login");
            return;
          }

          // try next endpoint if not found
          if (res.status === 404) {
            continue;
          }

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
          }

          let data = await res.json().catch(() => null);
          // some endpoints return { user: {...} }, others return profile directly
          if (data && data.user) data = data.user;

          if (mounted) {
            setProfile(data);
            setForm({
              name: data?.name || "",
              phone: data?.phone || "",
              profilePic: data?.profilePic || "",
            });
          }
          loaded = true;
          break;
        } catch (err) {
          console.error("Profile fetch attempt failed:", url, err);
          // if this was last endpoint, set a user-facing error
          if (url === endpoints[endpoints.length - 1] && mounted) {
            setError("Failed to load profile");
          }
          // otherwise keep trying the next endpoint
        }
      }

      if (mounted && !loaded && !error) {
        setError("Profile not found");
      }
      if (mounted) setLoading(false);
    };

    loadProfile();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const endpoints = [
      `${apiBase}/api/auth/me`,
      `${apiBase}/api/auth/profile/${user._id}`,
    ];

    let saved = false;
    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(form),
        });

        if (res.status === 401) {
          // token expired or invalid
          setUser(null);
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (res.status === 404) {
          // try next endpoint
          continue;
        }

        if (!res.ok) {
          const msg = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
          throw new Error(msg.message || `HTTP ${res.status}`);
        }

        let data = await res.json().catch(() => null);
        if (data && data.user) data = data.user;

        // update profile in UI + auth context + localStorage
        setProfile(data);
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        setEdit(false);
        saved = true;
        break;
      } catch (err) {
        console.error("Profile update attempt failed:", url, err);
        if (url === endpoints[endpoints.length - 1]) {
          setError("Failed to update profile");
        }
      }
    }

    if (!saved) {
      // final fallback
      setError((prev) => prev || "Failed to update profile");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  // Not logged in view
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
  if (!profile) return <div style={{ color: "#555" }}>No profile data found</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={profile.profilePic || "/assets/profile.jpg"}
          alt="Profile"
          className="profile-avatar"
          onError={(e) => {
            e.target.src = "/assets/profile.jpg";
          }}
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
            <div className="profile-edit-btn-wrap">
              <button className="profile-edit-btn" onClick={() => setEdit(true)}>Edit Profile</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
