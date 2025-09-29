import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    const restore = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          credentials: "include",
        });
        if (!res.ok) {
          setUser(null);
          localStorage.removeItem("user");
          return;
        }
        const data = await res.json().catch(() => null);
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

  // Signup functions 
  const signupRequest = async (name, email, password, phone = "", profilePic = "") => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup-request`, {
        name,
        email,
        password,
        phone,
        profilePic,
      });
      return res.data.success;
    } catch (err) {
      alert(err.response?.data?.message || "Signup request failed");
      return false;
    }
  };

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

  // Login functions
  const loginRequest = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login-request`, { email, password });
      return res.data.success;
    } catch (err) {
      alert(err.response?.data?.message || "Login request failed");
      return false;
    }
  };

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

  // Logout
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

  // Request OTP 
  const forgotPasswordRequestOtp = async (email) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password-request`, { email });
      return res.data.success;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send password reset OTP");
      return false;
    }
  };

  // Reset Password
  const forgotPasswordReset = async (email, otp, newPassword) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/forgot-password-reset`, {
        email,
        otp,
        newPassword,
      });
      return res.data.success;
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reset password");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        signupRequest,
        signupVerify,
        loginRequest,
        loginVerify,
        logout,
        forgotPasswordRequestOtp,
        forgotPasswordReset,
        API_BASE,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
