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

// small icon helpers (SVG)
function IconMoney() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="me-2">
      <path d="M12 1v22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 7H3v10h18V7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
function IconBooking() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="me-2">
      <path d="M3 7h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// compact sparkline (takes array of numbers, renders small svg)
function Sparkline({ data = [], stroke = "#0d6efd" }) {
  if (!data || !data.length) return null;
  const w = 120;
  const h = 36;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({ title, value, sub, children, bg = "bg-white" }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between">
          <div>
            <div className="text-muted small">{title}</div>
            <div className="h4 mt-2 mb-1" style={{ fontWeight: 700 }}>{value}</div>
            {sub && <div className="text-muted small">{sub}</div>}
          </div>
          <div className="text-muted">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [listerBookings, setListerBookings] = useState([]);
  const [myBikes, setMyBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  // taker metrics
  const takerMetrics = useMemo(() => {
    const today = new Date();
    const confirmed = myBookings.filter((b) => b.status === "confirmed");
    const upcoming = confirmed.filter((b) => new Date(b.startDate) >= today);
    const pending = myBookings.filter((b) => b.status === "pending");
    const cancelled = myBookings.filter((b) => b.status === "cancelled");
    const totalSpent = confirmed.reduce((s, b) => s + Number(b.totalPrice || 0), 0);
    const nextBk = upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
    return {
      totalSpent,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      nextDate: nextBk ? new Date(nextBk.startDate).toLocaleDateString() : "—",
      revenueSeries: confirmed.slice(-10).map(b => Number(b.totalPrice || 0)),
    };
  }, [myBookings]);

  // lister metrics
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
      revenueSeries: confirmed.slice(-10).map(b => Number(b.totalPrice || 0)),
    };
  }, [listerBookings, myBikes]);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="mb-0">Welcome, {user?.name || "User"} 🎉</h2>
          <div className="text-muted">Role: <strong>{user?.role}</strong></div>
        </div>
        <div>
          <Link to="/book" className="btn btn-primary me-2">Book a Motorcycle</Link>
          <Link to={user?.role === "lister" ? "/lister/motorcycles" : "/my-bookings"} className="btn btn-outline-secondary">View {user?.role === "lister" ? "Motorcycles" : "Bookings"}</Link>
        </div>
      </div>

      {loading && <div className="text-center py-5">Loading…</div>}

      {!loading && user?.role === "taker" && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Total Spent" value={INR(takerMetrics.totalSpent)} sub="Confirmed bookings">
                <IconMoney />
              </StatCard>
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Confirmed" value={takerMetrics.confirmedCount}>
                <IconBooking />
              </StatCard>
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Pending" value={takerMetrics.pendingCount} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Next Booking" value={takerMetrics.nextDate} />
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-1">Recent Spend</h6>
                <div className="text-muted small">Last {takerMetrics.revenueSeries.length} bookings</div>
              </div>
              <div style={{ width: 140 }}>
                <Sparkline data={takerMetrics.revenueSeries} stroke="#0d6efd" />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Your Bookings</h5>
                  {myBookings.length === 0 ? (
                    <p className="text-muted mb-0">No bookings found. Try booking a motorcycle.</p>
                  ) : (
                    <div className="list-group">
                      {myBookings.slice(0, 6).map((b) => (
                        <div key={b._id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <div style={{ fontWeight: 600 }}>{b.motorcycle?.make} {b.motorcycle?.model}</div>
                            <div className="text-muted small">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</div>
                          </div>
                          <div className="text-end">
                            <div>{INR(b.totalPrice)}</div>
                            <div className={`badge ${b.status === "confirmed" ? "bg-success" : b.status === "pending" ? "bg-warning text-dark" : "bg-secondary"}`}>{b.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && user?.role === "lister" && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Revenue" value={INR(listerMetrics.revenue)} sub="Confirmed bookings">
                <IconMoney />
              </StatCard>
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Confirmed" value={listerMetrics.confirmedCount}>
                <IconBooking />
              </StatCard>
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="Total Bookings" value={listerMetrics.totalBookings} />
            </div>
            <div className="col-sm-6 col-lg-3">
              <StatCard title="My Motorcycles" value={listerMetrics.bikesCount} />
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="mb-1">Revenue trend</h6>
                <div className="text-muted small">Last {listerMetrics.revenueSeries.length} confirmed bookings</div>
              </div>
              <div style={{ width: 140 }}>
                <Sparkline data={listerMetrics.revenueSeries} stroke="#198754" />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Recent Bookings</h5>
                  {listerBookings.length === 0 ? (
                    <p className="text-muted mb-0">No bookings yet.</p>
                  ) : (
                    <ul className="list-group">
                      {listerBookings.slice(0, 6).map((b) => (
                        <li key={b._id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <div style={{ fontWeight: 600 }}>{b.motorcycle?.make} {b.motorcycle?.model}</div>
                            <div className="text-muted small">{new Date(b.startDate).toLocaleDateString()}</div>
                          </div>
                          <div className="text-end">
                            <div>{INR(b.totalPrice)}</div>
                            <div className={`badge ${b.status === "confirmed" ? "bg-success" : b.status === "pending" ? "bg-warning text-dark" : "bg-secondary"}`}>{b.status}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">Your Motorcycles</h5>
                  {myBikes.length === 0 ? (
                    <p className="text-muted mb-0">No motorcycles listed.</p>
                  ) : (
                    <div className="list-group">
                      {myBikes.map((m) => (
                        <div key={m._id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <div style={{ fontWeight: 600 }}>{m.make} {m.model}</div>
                            <div className="text-muted small">{m.year || ""}</div>
                          </div>
                          <div>
                            <div className="small text-muted">₹{m.pricePerDay}/day</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}