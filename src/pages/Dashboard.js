// src/pages/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

function Card({ title, value, sub }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 12,
        padding: 16,
        minWidth: 220,
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ fontSize: 14, color: "#666" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]); // taker
  const [listerBookings, setListerBookings] = useState([]); // lister
  const [myBikes, setMyBikes] = useState([]); // lister motorcycles
  const [loading, setLoading] = useState(true);

  // --- tiny one-time style for button-like links ---
  if (typeof document !== "undefined" && !document.getElementById("btn-link-style")) {
    const s = document.createElement("style");
    s.id = "btn-link-style";
    s.innerHTML = `
      .btn-link {
        border: 1px solid #e1e1e1;
        padding: 6px 10px;
        border-radius: 8px;
        text-decoration: none;
        color: #0d6efd;
        background: #fff;
        box-shadow: 0 1px 2px rgba(0,0,0,.04);
        display: inline-block;
      }
      .btn-link:hover { background:#f7f9ff }
    `;
    document.head.appendChild(s);
  }

  useEffect(() => {
    (async () => {
      try {
        if (user?.role === "taker") {
          const { data } = await api.get("/bookings/mine");
          setMyBookings(Array.isArray(data) ? data : []);
        } else if (user?.role === "lister") {
          const [{ data: bookings }, { data: bikes }] = await Promise.all([
            api.get("/bookings/for-my-vehicles"),
            api.get("/motorcycles"),
          ]);
          const owned = (bikes || []).filter((b) => {
            const ownerId = b?.owner?._id || b?.owner || "";
            const me = user?._id || user?.id;
            return ownerId && me ? String(ownerId) === String(me) : true;
          });
          setMyBikes(owned);
          setListerBookings(Array.isArray(bookings) ? bookings : []);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // TAKer metrics
  const takerMetrics = useMemo(() => {
    const today = new Date();
    const confirmed = myBookings.filter((b) => b.status === "confirmed");
    const upcoming = confirmed.filter((b) => new Date(b.startDate) >= today);
    const pending = myBookings.filter((b) => b.status === "pending");
    const cancelled = myBookings.filter((b) => b.status === "cancelled");
    const totalSpent = confirmed.reduce((s, b) => s + Number(b.totalPrice || 0), 0);
    const nextBk = upcoming.sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    )[0];
    return {
      totalSpent,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      nextDate: nextBk ? new Date(nextBk.startDate).toLocaleDateString() : "—",
    };
  }, [myBookings]);

  // LISTER metrics
  const listerMetrics = useMemo(() => {
    const confirmed = listerBookings.filter((b) => b.status === "confirmed");
    const revenue = confirmed.reduce((s, b) => s + Number(b.totalPrice || 0), 0);
    const uniqueCustomers = new Set(confirmed.map((b) => b.user?._id || b.user)).size;
    const totalBookings = listerBookings.length;
    const bikesCount = myBikes.length || "—";
    return {
      revenue,
      uniqueCustomers,
      totalBookings,
      bikesCount,
      confirmedCount: confirmed.length,
    };
  }, [listerBookings, myBikes]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome, {user?.name || "User"} 🎉</h2>
      <div style={{ color: "#666", marginBottom: 18 }}>
        Role: <strong>{user?.role}</strong>
      </div>

      {loading && <p>Loading…</p>}

      {!loading && user?.role === "taker" && (
        <>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 12,
              boxShadow: "0 1px 2px rgba(0,0,0,.04)",
              background: "#fff",
            }}
          >
            <Card title="Total Spent" value={INR(takerMetrics.totalSpent)} sub="Confirmed bookings" />
            <Card title="Confirmed" value={takerMetrics.confirmedCount} />
            <Card title="Pending" value={takerMetrics.pendingCount} />
            <Card title="Cancelled" value={takerMetrics.cancelledCount} />
            <Card title="Next Booking" value={takerMetrics.nextDate} />
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn-link" to="/book">Book a Motorcycle →</Link>
            <Link className="btn-link" to="/my-bookings">My Bookings →</Link>
            <Link className="btn-link" to="/analytics">Analytics →</Link>
          </div>
        </>
      )}

      {!loading && user?.role === "lister" && (
        <>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              padding: 12,
              border: "1px solid #eee",
              borderRadius: 12,
              boxShadow: "0 1px 2px rgba(0,0,0,.04)",
              background: "#fff",
            }}
          >
            <Card title="Revenue" value={INR(listerMetrics.revenue)} sub="Sum of confirmed bookings" />
            <Card title="Confirmed Bookings" value={listerMetrics.confirmedCount} />
            <Card title="All Bookings" value={listerMetrics.totalBookings} />
            <Card title="My Motorcycles" value={listerMetrics.bikesCount} />
            <Card title="Unique Customers" value={listerMetrics.uniqueCustomers} />
          </div>

          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link className="btn-link" to="/lister/motorcycles">Manage Motorcycles →</Link>
            <Link className="btn-link" to="/analytics">Analytics →</Link>
          </div>
        </>
      )}
    </div>
  );
}
