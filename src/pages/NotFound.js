// src/pages/NotFound.js
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <h2>404 — Page Not Found</h2>
      <p style={{ color: "#666" }}>
        The page you’re looking for doesn’t exist or you don’t have access to it.
      </p>
      <div style={{ marginTop: 12 }}>
        {user ? (
          <Link to="/dashboard" style={{ color: "#0d6efd" }}>Go to Dashboard →</Link>
        ) : (
          <Link to="/login" style={{ color: "#0d6efd" }}>Go to Login →</Link>
        )}
      </div>
    </div>
  );
}
