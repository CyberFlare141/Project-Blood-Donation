import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          🩸 Blood Donation
        </Link>
      </div>

      {/* Hamburger icon */}
      <div
        className={`hamburger ${menuOpen ? "active" : ""}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleMenu();
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`navbar-right ${menuOpen ? "open" : ""}`}>
       
        <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
        <Link to="/faq" onClick={closeMenu}>FAQ</Link>
        <Link to="/contactus" onClick={closeMenu}>Contact Us</Link>
        <Link to="/BloodRequestForm" onClick={closeMenu}>Request Blood</Link>

        {user ? (
          <>
            <Link to="/profile" onClick={closeMenu}>Profile</Link>
            <button className="nav-btn logout-btn" onClick={() => { logout(); closeMenu(); }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="nav-btn login-btn" onClick={closeMenu}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
