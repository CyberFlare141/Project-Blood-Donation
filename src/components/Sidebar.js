import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import profilePic from "../assets/profile.jpg";
import "./Sidebar.css"
import { useAuth } from '../context/AuthContext';

function Sidebar({ onLogout }) {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
      
      {!collapsed && (
        <div className="profile">
          <img
              src={profilePic}
              alt="Profile"
              className="profile-pic"
              style={{ width: 70, height: 70, borderRadius: "50%" }}
            />
          <p className="name">{user?.name}</p>
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

        <Link 
          to="/profile" 
          className={location.pathname === "/profile" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">👤</span>
          {!collapsed && <span className="nav-text">Profile</span>}
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
          <span className="nav-icon">📘</span>
          {!collapsed && <span className="nav-text">ContactUS</span>}
        </Link>
               <Link 
          to="/FAQ" 
          className={location.pathname === "/FAQ" ? "nav-link active" : "nav-link"}
        >
          <span className="nav-icon">📘</span>
          {!collapsed && <span className="nav-text">FAQ</span>}
        </Link>

        <button
          className="logout-btn"
          onClick={onLogout}
        >
          <span className="nav-icon">⏻</span>
          {!collapsed && <span className="nav-text">Logout</span>}
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;