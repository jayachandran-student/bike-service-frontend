// src/pages/MyBookings.js
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext"; // ⭐ add

function StatusBadge({ status }) {
  const styles = {
    pending:  { background: "#fff3cd", color: "#664d03" },
    confirmed:{ background: "#d1e7dd", color: "#0f5132" },
    failed:   { background: "#f8d7da", color: "#842029" },
    cancelled:{ background: "#e2e3e5", color: "#41464b" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span style={{ padding:"2px 8px", borderRadius:12, fontSize:12, ...s }}>
      {status}
    </span>
  );
}

export default function MyBookings() {
  const toast = useToast(); // ⭐
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // review modal state
  const [openReview, setOpenReview] = useState(false);
  const [reviewFor, setReviewFor] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/bookings/mine");
      setRows((Array.isArray(data) ? data : []).slice().reverse()); // newest first
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Booking cancelled."); // ⭐
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not cancel booking"); // ⭐
    }
  };

  const openReviewModal = (b) => {
    setReviewFor(b);
    setRating(5);
    setComment("");
    setOpenReview(true);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const motorcycleId = reviewFor.motorcycle?._id || reviewFor.motorcycle;
      await api.post("/reviews", {
        motorcycleId,
        bookingId: reviewFor._id,
        rating: Number(rating),
        comment,
      });
      setOpenReview(false);
      toast.success("Thanks! Review submitted."); // ⭐
      await load();

      // go to Book page so the updated reviews are visible immediately
      window.location.href = `/book?motorcycleId=${motorcycleId}`;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not submit review"); // ⭐
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Bookings</h2>

      {loading && <p>Loading…</p>}

      {!loading && rows.length === 0 && <p>No bookings yet.</p>}

      {!loading && rows.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
                <th style={{ padding: 10 }}>Motorcycle</th>
                <th style={{ padding: 10 }}>Dates</th>
                <th style={{ padding: 10 }}>Total</th>
                <th style={{ padding: 10 }}>Status</th>
                <th style={{ padding: 10 }}>Payment</th>
                <th style={{ padding: 10 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b._id} style={{ borderBottom: "1px solid #f2f2f2" }}>
                  <td style={{ padding: 10 }}>
                    <div style={{ fontWeight: 600 }}>
                      {b.motorcycle?.make} {b.motorcycle?.model}
                    </div>
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Reg: {b.motorcycle?.regNumber || "—"}
                    </div>
                  </td>
                  <td style={{ padding: 10, whiteSpace: "nowrap" }}>
                    {new Date(b.startDate).toLocaleDateString()} →{" "}
                    {new Date(b.endDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 10 }}>₹{b.totalPrice}</td>
                  <td style={{ padding: 10 }}>
                    <StatusBadge status={b.status} />
                  </td>
                  <td style={{ padding: 10, fontSize: 12 }}>
                    <div><strong>Order:</strong> {b.orderId || "—"}</div>
                    <div><strong>Payment:</strong> {b.paymentId || "—"}</div>
                  </td>
                  <td style={{ padding: 10 }}>
                    {b.status === "pending" && (
                      <button
                        onClick={() => cancel(b._id)}
                        style={{
                          border: "1px solid #dc3545",
                          color: "#dc3545",
                          background: "transparent",
                          padding: "6px 10px",
                          marginRight: 8,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    )}

                    {b.status === "confirmed" && (
                      <button
                        onClick={() => openReviewModal(b)}
                        style={{
                          border: "1px solid #0d6efd",
                          color: "#0d6efd",
                          background: "transparent",
                          padding: "6px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Leave Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* review modal */}
      {openReview && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setOpenReview(false)}
        >
          <div
            style={{ background: "#fff", padding: 20, borderRadius: 8, width: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>Review</h3>
            <p style={{ marginTop: 0 }}>
              {reviewFor?.motorcycle?.make} {reviewFor?.motorcycle?.model}
            </p>
            <form onSubmit={submitReview}>
              <label style={{ display: "block", marginBottom: 8 }}>
                Rating:
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{ marginLeft: 8 }}
                >
                  {[5,4,3,2,1].map((n)=>(<option key={n} value={n}>{n}</option>))}
                </select>
              </label>
              <textarea
                rows={4}
                placeholder="Your comments…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: "100%", marginBottom: 12 }}
                required
              />
              <div style={{ textAlign: "right" }}>
                <button
                  type="button"
                  onClick={() => setOpenReview(false)}
                  style={{ marginRight: 8 }}
                >
                  Close
                </button>
                <button
                  type="submit"
                  style={{
                    background: "#0d6efd", color: "#fff",
                    border: "none", padding: "8px 12px", cursor: "pointer",
                  }}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
