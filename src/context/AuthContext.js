import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to load user from localStorage on first render
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const signup = async (name, email, password, phone = "", profilePic = "") => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const login = (userData) => {
    setUser(userData); // userData should have _id
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}




