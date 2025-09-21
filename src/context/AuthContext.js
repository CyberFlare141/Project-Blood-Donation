import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

  const signupRequest = async (name, email, password, phone, profilePic) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup-request`, { name, email, password, phone, profilePic });
      return res.data.success;
    } catch (err) {
      alert(err.response?.data?.message || "Signup request failed");
      return false;
    }
  };

  const signupVerify = async (email, otp) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/signup-verify`, { email, otp }, { withCredentials: true });
      if (res.data.user) setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      alert(err.response?.data?.message || "Signup verification failed");
      return null;
    }
  };

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
      const res = await axios.post(`${API_BASE}/api/auth/login-verify`, { email, otp }, { withCredentials: true });
      if (res.data.user) setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
      return null;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signupRequest, signupVerify, loginRequest, loginVerify, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
