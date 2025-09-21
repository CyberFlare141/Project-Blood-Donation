// src/components/Layout.js
import React from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "16px" }}>
        {children}
      </div>
    </div>
  );
}
