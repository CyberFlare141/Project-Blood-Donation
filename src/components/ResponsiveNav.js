// ...new file...
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./ResponsiveNav.css";

export default function ResponsiveNav() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/request", label: "Request Blood" },
    { to: "/contact", label: "Contact" },
    { to: "/faq", label: "FAQ" },
    { to: "/profile", label: "Profile" }
 
  ];

  return (
    <>
      <nav className="resp-nav">
        <div className="nav-inner container">
          <div className="nav-left">
            <button
              aria-label="Open navigation"
              className="hamburger-btn"
              onClick={() => setOpen(true)}
            >
              <span className="bar" />
              <span className="bar" />
              <span className="bar" />
            </button>
            <Link to="/" className="nav-brand">Be a Hero</Link>
          </div>

          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.to} className={loc.pathname === l.to ? "active" : ""}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className={`side-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      <aside className={`side-panel ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="side-head">
          <strong>Navigation</strong>
          <button aria-label="Close navigation" className="close-btn" onClick={() => setOpen(false)}>×</button>
        </div>
        <ul className="side-links" onClick={() => setOpen(false)}>
          {links.map((l) => (
            <li key={l.to} className={loc.pathname === l.to ? "active" : ""}>
              <Link to={l.to}>{l.label}</Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}