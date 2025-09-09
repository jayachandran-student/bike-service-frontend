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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top">
      <div className="container">
        {/* Brand */}
        <NavLink className="navbar-brand fw-bold" to="/">
          Moto Service
        </NavLink>
        {user && <RoleChip role={user.role} />}

        {/* Hamburger toggler */}
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
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {!user ? (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link">
                    Register
                  </NavLink>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/dashboard" className="nav-link">
                    Dashboard
                  </NavLink>
                </li>

                {user.role === "taker" && (
                  <>
                    <li className="nav-item">
                      <NavLink to="/book" className="nav-link">
                        Book
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink to="/my-bookings" className="nav-link">
                        My Bookings
                      </NavLink>
                    </li>
                  </>
                )}

                {user.role === "lister" && (
                  <li className="nav-item">
                    <NavLink to="/lister/motorcycles" className="nav-link">
                      My Motorcycles
                    </NavLink>
                  </li>
                )}

                <li className="nav-item">
                  <NavLink to="/analytics" className="nav-link">
                    Analytics
                  </NavLink>
                </li>

                {/* Profile + logout */}
                <li className="nav-item d-flex align-items-center ms-lg-3">
                  <Avatar name={user.name} />
                  <span className="ms-2 text-white small">{user.name}</span>
                  <button
                    className="btn btn-outline-light btn-sm ms-3"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
