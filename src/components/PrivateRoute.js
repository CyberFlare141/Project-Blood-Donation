// src/components/PrivateRoute.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 20 }}>Checking authentication...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Login required</h2>
        <p>
          You must <Link to="/login">login</Link> to access this page.
        </p>
      </div>
    );
  }

  return children;
}
