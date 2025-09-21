import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Export the API_BASE for external use if needed
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5001";

// DEBUG: Check what environment variables are available
console.log("🔍 Environment variables:", {
  REACT_APP_API_BASE: process.env.REACT_APP_API_BASE,
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_FINAL: API_BASE
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Debug: Log the API_BASE being used
  console.log("🔧 API_BASE in AuthProvider:", API_BASE);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    const restore = async () => {
      try {
        console.log("🔄 Attempting to restore session from:", `${API_BASE}/api/auth/me`);
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        console.log("🔄 /api/auth/me status:", res.status);
        // parse JSON safely (some errors return empty body)
        const data = await res.json().catch(() => null);
        console.log("🔄 /api/auth/me data:", data);
        const restoredUser = data?.user ?? data;
        if (restoredUser) setUser(restoredUser);
      } catch (e) {
        console.error("Failed to restore session:", e);
      }
    };
    restore();
  }, []);

  // ... rest of your AuthProvider code remains the same

  const signup = async (name, email, password, phone = "", profilePic = "") => {
    try {
      const url = `${API_BASE}/api/auth/signup`;
      console.log("🔗 Signup - Attempting to connect to:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, phone, profilePic }),
      });

      console.log("📨 Signup - Response status:", res.status);
      const data = await res.json().catch(() => null);
      console.log("📨 Signup - Response data:", data);

      if (!res.ok) {
        console.error("Signup failed:", data);
        alert(data?.message || "Signup failed");
        return false;
      }

      const newUser = data?.user ?? data;
      setUser(newUser);
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
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      console.log("📨 Login - Response status:", res.status);
      const data = await res.json().catch(() => null);
      console.log("📨 Login - Response data:", data);

      if (!res.ok) {
        console.error("Login failed:", data);
        alert(data?.message || "Login failed");
        return false;
      }

      const loggedUser = data?.user ?? data;
      setUser(loggedUser);
      return true;
    } catch (e) {
      console.error("❌ Login failed:", e);
      alert("Login failed (network/server error)");
      return false;
    }
  };

  const logout = async () => {
    try {
      console.log("👋 Logging out user");
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout request failed:", e);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
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
      testAPIConnection,
      API_BASE
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