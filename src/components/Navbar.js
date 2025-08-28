// src/components/Navbar.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Avatar({ name }) {
  const ch = (name || "U").trim().charAt(0).toUpperCase();
  return (
    <div
      aria-label="profile"
      title={name || "User"}
      style={{
        width: 28,
        height: 28,
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
      style={{
        marginLeft: 8,
        padding: "2px 8px",
        borderRadius: 999,
        border: `1px solid ${c.bd}`,
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

  // one-time lightweight styles for nav links
  if (typeof document !== "undefined" && !document.getElementById("navlink-style")) {
    const s = document.createElement("style");
    s.id = "navlink-style";
    s.innerHTML = `
      .nav-link {
        color: #ffffff;
        opacity: .85;
        text-decoration: none;
        padding: 6px 10px;
        border-radius: 8px;
        transition: background .15s ease, opacity .15s ease;
      }
      .nav-link:hover { opacity: 1; background: rgba(255,255,255,.12); }
      .nav-link.active {
        opacity: 1;
        background: rgba(255,255,255,.18);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.25);
      }
      .nav-btn {
        background: transparent;
        border: 1px solid rgba(255,255,255,.6);
        color: white;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
      }
      .nav-btn:hover { background: rgba(255,255,255,.12); }
    `;
    document.head.appendChild(s);
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        backgroundColor: "#0d6efd",
        color: "white",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Left: Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontWeight: 800, letterSpacing: .3 }}>Moto Service</span>
        {user && <RoleChip role={user.role} />}
      </div>

      {/* Center: Nav links */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {!user ? (
          <>
            <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Login
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Dashboard
            </NavLink>

            {user.role === "taker" && (
              <>
                <NavLink to="/book" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  Book
                </NavLink>
                <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                  My Bookings
                </NavLink>
              </>
            )}

            {user.role === "lister" && (
              <NavLink to="/lister/motorcycles" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                My Motorcycles
              </NavLink>
            )}

            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              Analytics
            </NavLink>
          </>
        )}
      </div>

      {/* Right: Profile / logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {user && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={user.name} />
              <span style={{ fontSize: 13, opacity: .95 }}>{user.name}</span>
            </div>
            <button className="nav-btn" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}
