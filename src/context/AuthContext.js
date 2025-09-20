// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // keep user in localStorage as fallback so UI can render optimistically
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // keep localStorage in sync with user changes
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  // On mount, try to restore session from httpOnly cookie by calling /api/auth/me
  useEffect(() => {
    const restore = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          method: "GET",
          credentials: "include", // important -- send cookies
        });

        if (!res.ok) {
          // no valid session
          setUser(null);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to restore session:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signup = async (name, email, password, phone = "", profilePic = "") => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important: receive httpOnly cookie from server
        body: JSON.stringify({ name, email, password, phone, profilePic }),
      });

      const data = await res.json();
      console.log("Signup response:", res.status, data);

      if (!res.ok) {
        alert(data?.message || "Signup failed");
        return false;
      }

      setUser(data.user);
      return true;
    } catch (e) {
      console.error("Signup failed:", e);
      alert("Signup failed (network/server error)");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // important: receive httpOnly cookie from server
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Login failed");
        return false;
      }
      setUser(data.user);
      return true;
    } catch (e) {
      console.error("Login failed:", e);
      alert("Login failed (network/server error)");
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, signup, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
