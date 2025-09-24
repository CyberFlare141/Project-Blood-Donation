import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">🩸 Blood Donation</Link>
      </div>
      <div className="navbar-right">
        {/* Always visible links */}
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contactus">Contact Us</Link>
        <Link to="/BloodRequestForm">Request Blood</Link>

        {/* Conditional links */}
        {user ? (
          <>
            <Link to="/profile">Profile</Link>
            <button className="nav-btn logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="nav-btn login-btn">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
