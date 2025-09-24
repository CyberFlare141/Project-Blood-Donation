import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// API base URL (from env or fallback)
export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

console.log("🔧 API_BASE in AuthContext:", API_BASE);

export function AuthProvider({ children }) {
  // Do NOT trust localStorage on initialization. Start null and perform server verification.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // indicate restore in progress

  // Persist user in localStorage when setUser is called successfully
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Restore session on refresh: call server /api/auth/me to verify cookie/token
  useEffect(() => {
    const restore = async () => {
      try {
        setLoading(true);
        console.log("🔄 Checking session:", `${API_BASE}/api/auth/me`);
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        console.log("🔄 /api/auth/me status:", res.status);

        if (!res.ok) {
          // clear any stale local storage if server doesn't validate session
          setUser(null);
          localStorage.removeItem("user");
          return;
        }

        const data = await res.json().catch(() => null);
        console.log("🔄 /api/auth/me data:", data);

        const restoredUser = data?.user ?? data;
        if (restoredUser) {
          setUser(restoredUser);
          localStorage.setItem("user", JSON.stringify(restoredUser));
        } else {
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (e) {
        console.error("Failed to restore session:", e);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // === Signup step 1 (request OTP) ===
  const signupRequest = async (name, email, password, phone = "", profilePic = "") => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup-request`, {
        name, email, password, phone, profilePic
      });
      return res.data.success;
    } catch (err) {
      alert(err.response?.data?.message || "Signup request failed");
      return false;
    }
  };

  // === Signup step 2 (verify OTP) ===
  const signupVerify = async (email, otp) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/signup-verify`,
        { email, otp },
        { withCredentials: true }
      );
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      return res.data.user;
    } catch (err) {
      alert(err.response?.data?.message || "Signup verification failed");
      return null;
    }
  };

  // === Login step 1 (request OTP) ===
  const loginRequest = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login-request`, { email, password });
      return res.data.success;
    } catch (err) {
      alert(err.response?.data?.message || "Login request failed");
      return false;
    }
  };

  // === Login step 2 (verify OTP) ===
  const loginVerify = async (email, otp) => {
    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/login-verify`,
        { email, otp },
        { withCredentials: true }
      );
      if (res.data.user) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      return res.data.user;
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
      return null;
    }
  };

  // === Logout ===
  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, signupRequest, signupVerify, loginRequest, loginVerify, logout, API_BASE, loading }}
    >
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
