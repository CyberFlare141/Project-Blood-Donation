// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // DEBUG: Log the API base URL
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
  console.log("🔗 API_BASE is set to:", API_BASE);

  const signup = async (name, email, password, phone = "", profilePic = "") => {
    try {
      const url = `${API_BASE}/api/auth/signup`;
      console.log("🔗 Signup - Attempting to connect to:", url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, profilePic }),
      });

      console.log("📨 Signup - Response status:", res.status);
      const data = await res.json();
      console.log("📨 Signup - Response data:", data);

      if (!res.ok) {
        alert(data?.message || "Signup failed");
        return false;
      }

      setUser(data.user);
      return true;
    } catch (e) {
      console.error("❌ Signup failed:", e);
      alert("Signup failed (network/server error)");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const url = `${API_BASE}/api/auth/login`;
      console.log("🔗 Login - Attempting to connect to:", url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      console.log("📨 Login - Response status:", res.status);
      const data = await res.json();
      console.log("📨 Login - Response data:", data);

      if (!res.ok) {
        alert(data?.message || "Login failed");
        return false;
      }

      setUser(data.user);
      return true;
    } catch (e) {
      console.error("❌ Login failed:", e);
      alert("Login failed (network/server error)");
      return false;
    }
  };

  const logout = () => {
    console.log("👋 Logging out user");
    setUser(null);
    localStorage.removeItem("user");
  };

  // Add a test function to check API connection
  const testAPIConnection = async () => {
    try {
      const url = `${API_BASE}/api/health`;
      console.log("🧪 Testing API connection to:", url);
      
      const res = await fetch(url);
      const data = await res.json();
      
      console.log("✅ API Connection Test - Success:", data);
      return data;
    } catch (error) {
      console.error("❌ API Connection Test - Failed:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      login, 
      logout, 
      signup,
      testAPIConnection, // Add test function to context
      API_BASE // Expose API_BASE for debugging
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export the API_BASE for external use if needed
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";