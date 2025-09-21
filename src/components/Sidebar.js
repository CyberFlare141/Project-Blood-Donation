import React, { useState } from "react";
import "./Sidebar.css";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="toggle-btn"
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        {collapsed ? "➡" : "⬅"}
      </button>

      {!collapsed && user && (
        <div className="profile">
          <img
            src={user.profilePic || "/assets/profile.jpg"}
            alt="Profile"
            className="profile-pic"
            style={{ width: 70, height: 70, borderRadius: "50%" }}
          />
          <p className="name">{user.name}</p>
        </div>
      )}

      <nav className="nav-links">
        <Link
          to="/"
          className={location.pathname === "/" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">🏠</span>
          {!collapsed && <span className="nav-text">Home</span>}
        </Link>

        {/* Profile link: always shown */}
        <Link
          to="/profile"
          className={location.pathname === "/profile" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">👤</span>
          {!collapsed && <span className="nav-text">Profile</span>}
        </Link>

        <Link
          to="/dashboard"
          className={location.pathname === "/dashboard" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">📊</span>
          {!collapsed && <span className="nav-text">Dashboard</span>}
        </Link>

        <Link
          to="/instruction"
          className={location.pathname === "/instruction" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">📘</span>
          {!collapsed && <span className="nav-text">Instruction</span>}
        </Link>

        <Link
          to="/ContactUS"
          className={location.pathname === "/ContactUS" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">📞</span>
          {!collapsed && <span className="nav-text">Contact Us</span>}
        </Link>

        <Link
          to="/FAQ"
          className={location.pathname === "/FAQ" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">❓</span>
          {!collapsed && <span className="nav-text">FAQ</span>}
        </Link>

        {/* Blood Request link: always shown */}
        <Link
          to="/BloodRequestForm"
          className={location.pathname === "/BloodRequestForm" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">🩸</span>
          {!collapsed && <span className="nav-text">Blood Request Form</span>}
        </Link>

        {/* Logout button only if logged in */}
        {user && (
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">⏻</span>
            {!collapsed && <span className="nav-text">Logout</span>}
          </button>
        )}
      </nav>
    </div>
  );
}

export default Sidebar;
