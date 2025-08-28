// src/pages/Analytics.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

const monthKey = (d) => {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const monthLabel = (ym) => {
  const [y, m] = ym.split("-");
  return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en", {
    month: "short",
    year: "numeric",
  });
};

export default function Analytics() {
  const { user } = useAuth();

  const statusRef = useRef(null);
  const monthRef = useRef(null);
  const revenueRef = useRef(null);
  const charts = useRef([]);

  const [raw, setRaw] = useState([]); // raw bookings from API
  const [loading, setLoading] = useState(true);

  // simple date filter state (yyyy-mm-dd)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // fetch bookings once (role-aware)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const url =
          user?.role === "lister"
            ? "/bookings/for-my-vehicles"
            : "/bookings/mine";
        const { data } = await api.get(url);
        setRaw(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();

    // cleanup charts on unmount
    return () => charts.current.forEach((c) => c?.destroy());
  }, [user]);

  // apply date range filter
  const filtered = useMemo(() => {
    if (!from && !to) return raw;
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    return raw.filter((b) => {
      const sd = b.startDate ? new Date(b.startDate) : null;
      if (!sd) return false;
      if (fromDate && sd < fromDate) return false;
      if (toDate && sd > toDate) return false;
      return true;
    });
  }, [raw, from, to]);

  // aggregates
  const { byStatus, byMonth, revenueByBike } = useMemo(() => {
    const _byStatus = {};
    const _byMonth = {};
    const _revenueByBike = {};

    for (const b of filtered) {
      // status counts
      const st = b.status || "unknown";
      _byStatus[st] = (_byStatus[st] || 0) + 1;

      // monthly counts (use startDate)
      if (b.startDate) {
        const k = monthKey(b.startDate);
        _byMonth[k] = (_byMonth[k] || 0) + 1;
      }

      // lister-only revenue
      if (user?.role === "lister" && b.status === "confirmed" && b.totalPrice) {
        const mc = b.motorcycle || {};
        const name =
          [mc.make, mc.model].filter(Boolean).join(" ") ||
          `Bike #${String(mc?._id || "").slice(-4)}`;
        _revenueByBike[name] = (_revenueByBike[name] || 0) + Number(b.totalPrice);
      }
    }

    return { byStatus: _byStatus, byMonth: _byMonth, revenueByBike: _revenueByBike };
  }, [filtered, user]);

  // draw charts
  useEffect(() => {
    // destroy existing charts before re-drawing
    charts.current.forEach((c) => c?.destroy());
    charts.current = [];

    // Status (doughnut)
    if (statusRef.current) {
      charts.current.push(
        new Chart(statusRef.current.getContext("2d"), {
          type: "doughnut",
          data: {
            labels: Object.keys(byStatus),
            datasets: [{ data: Object.values(byStatus) }],
          },
          options: {
            plugins: { legend: { position: "bottom" } },
          },
        })
      );
    }

    // Bookings per Month (bar)
    if (monthRef.current) {
      const keys = Object.keys(byMonth).sort(); // YYYY-MM
      const labels = keys.map(monthLabel);
      charts.current.push(
        new Chart(monthRef.current.getContext("2d"), {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Bookings per Month",
                data: keys.map((k) => byMonth[k]),
              },
            ],
          },
          options: {
            scales: {
              x: { grid: { display: false } },
              y: { beginAtZero: true, ticks: { precision: 0 } },
            },
            plugins: {
              legend: { display: false },
              tooltip: { mode: "index", intersect: false },
            },
          },
        })
      );
    }

    // Revenue by Motorcycle (bar) — lister only
    if (user?.role === "lister" && revenueRef.current) {
      const labels = Object.keys(revenueByBike);
      charts.current.push(
        new Chart(revenueRef.current.getContext("2d"), {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "Revenue (₹)",
                data: labels.map((k) => revenueByBike[k]),
              },
            ],
          },
          options: {
            scales: {
              x: { grid: { display: false } },
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (v) => INR(v),
                },
              },
            },
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${INR(ctx.parsed.y)}`,
                },
              },
            },
          },
        })
      );
    }
  }, [byStatus, byMonth, revenueByBike, user]);

  /* ---------- CSV Export helpers ---------- */
  const csvEscape = (v) => {
    const s = v === null || v === undefined ? "" : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };

  const exportCSV = () => {
    const rows = (filtered || []).map((b) => {
      const mc = b.motorcycle || {};
      const userName = b.user?.name || "";
      const userEmail = b.user?.email || "";
      const bike = [mc.make, mc.model].filter(Boolean).join(" ").trim();
      return {
        Customer: userName,
        Email: userEmail,
        Motorcycle: bike || (mc._id ? `#${String(mc._id).slice(-4)}` : ""),
        StartDate: b.startDate ? new Date(b.startDate).toISOString().slice(0, 10) : "",
        EndDate: b.endDate ? new Date(b.endDate).toISOString().slice(0, 10) : "",
        Status: b.status || "",
        TotalPrice: b.totalPrice ?? "",
        OrderId: b.orderId || "",
        PaymentId: b.paymentId || "",
      };
    });

    const headers = rows.length
      ? Object.keys(rows[0])
      : ["Customer", "Email", "Motorcycle", "StartDate", "EndDate", "Status", "TotalPrice", "OrderId", "PaymentId"];

    const lines = [
      headers.map(csvEscape).join(","),
      ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(",")),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bookings.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      <h2>Analytics</h2>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-end",
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <label>
          From
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            style={{ display: "block", marginTop: 6 }}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={to}
            min={from || undefined}
            max={todayStr}
            onChange={(e) => setTo(e.target.value)}
            style={{ display: "block", marginTop: 6 }}
          />
        </label>

        {(from || to) && (
          <button
            type="button"
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            style={{
              height: 34,
              border: "1px solid #ccc",
              background: "transparent",
              cursor: "pointer",
              padding: "6px 10px",
            }}
          >
            Clear
          </button>
        )}

        {/* Export CSV */}
        <button
          type="button"
          onClick={exportCSV}
          style={{
            height: 34,
            border: "1px solid #ccc",
            background: "transparent",
            cursor: "pointer",
            padding: "6px 10px",
          }}
        >
          Export CSV
        </button>
      </div>

      {loading && <p>Loading…</p>}

      {!loading && (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ minHeight: 320, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
              <h4 style={{ marginBottom: 10 }}>Bookings by Status</h4>
              <canvas ref={statusRef} />
            </div>

            <div style={{ minHeight: 320, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
              <h4 style={{ marginBottom: 10 }}>Bookings per Month</h4>
              <canvas ref={monthRef} />
            </div>
          </section>

          {user?.role === "lister" && (
            <section style={{ marginTop: 20 }}>
              <div style={{ minHeight: 360, padding: 12, border: "1px solid #eee", borderRadius: 8 }}>
                <h4 style={{ marginBottom: 10 }}>Revenue by Motorcycle (₹)</h4>
                <canvas ref={revenueRef} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
