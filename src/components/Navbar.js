// src/components/Navbar.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

function Avatar({ name }) {
  const ch = (name || "U").trim().charAt(0).toUpperCase();
  return (
    <div
      aria-label="profile"
      title={name || "User"}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: "#0d6efd",
        color: "#fff",
        fontSize: 14,
        fontWeight: 700,
        display: "grid",
        placeItems: "center",
        boxShadow: "0 1px 2px rgba(0,0,0,.15)",
      }}
    >
      {ch}
    </div>
  );
}

function RoleChip({ role }) {
  if (!role) return null;
  const colors = {
    taker: { bg: "#e7f1ff", fg: "#0b5ed7", bd: "#cfe2ff" },
    lister: { bg: "#e8f5e9", fg: "#2e7d32", bd: "#c8e6c9" },
  };
  const c = colors[role] || { bg: "#f1f3f5", fg: "#495057", bd: "#dee2e6" };
  return (
    <span
      className="ms-2 px-2 py-1 rounded-pill border"
      style={{
        borderColor: c.bd,
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {role}
    </span>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Logout clicked (Navbar)");
      // call context logout if available and await possible promise
      if (typeof logout === "function") {
        const maybePromise = logout();
        if (maybePromise && typeof maybePromise.then === "function") {
          await maybePromise;
        }
      }

      // remove keys & header (double-safeguard)
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        console.log("localStorage cleared");
      } catch (e) {
        console.warn("localStorage remove error:", e);
      }
      try {
        if (api && api.defaults && api.defaults.headers) {
          delete api.defaults.headers.common["Authorization"];
          console.log("axios Authorization header removed");
        }
      } catch (e) {
        console.warn("error clearing axios header", e);
      }

      // navigate
      navigate("/login");
      // fallback hard redirect if navigation didn't change location
      setTimeout(() => {
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }, 300);
    } catch (err) {
      console.error("Logout failed:", err);
      try { localStorage.removeItem("token"); } catch {}
      window.location.href = "/login";
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm sticky-top"
      style={{ background: "#ffffff", borderBottom: "1px solid #e9ecef" }}
    >
      <div className="container">
        {/* Brand */}
        <NavLink className="navbar-brand fw-bold text-dark" to="/">
          Moto Service
        </NavLink>

        {/* small role chip next to brand */}
        {user && <RoleChip role={user.role} />}

        {/* toggler */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarsExample"
          aria-controls="navbarsExample"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links */}
        <div className="collapse navbar-collapse" id="navbarsExample">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link text-dark">Login</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link text-dark">Register</NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link text-dark">Dashboard</NavLink>
                </li>

                {user.role === "taker" && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/book" className="nav-link text-dark">Book</NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/my-bookings" className="nav-link text-dark">My Bookings</NavLink>
                    </li>
                  </>
                )}

                {user.role === "lister" && (
                  <li className="nav-item">
                    <NavLink to="/lister/motorcycles" className="nav-link text-dark">My Motorcycles</NavLink>
                  </li>
                )}

                <li className="nav-item">
                  <NavLink to="/analytics" className="nav-link text-dark">Analytics</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Right: always-visible profile + logout (outside collapse so visible on small screens) */}
        <div className="d-flex align-items-center ms-3">
          {user ? (
            <>
              <div className="d-flex align-items-center">
                <Avatar name={user.name} />
                <span className="ms-2 text-dark small d-none d-lg-inline">{user.name}</span>
              </div>
              <button
                className="btn btn-primary btn-sm ms-3"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
