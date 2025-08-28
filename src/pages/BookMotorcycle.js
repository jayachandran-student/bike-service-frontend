import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext"; // ⭐ add

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function BookMotorcycle() {
  const toast = useToast(); // ⭐
  const [searchParams] = useSearchParams();

  const [list, setList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [loadingList, setLoadingList] = useState(true);

  const [form, setForm] = useState({
    motorcycleId: "",
    startDate: "",
    endDate: "",
    totalPrice: 0,
  });

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Load motorcycles
  useEffect(() => {
    (async () => {
      setLoadingList(true);
      try {
        const { data } = await api.get("/motorcycles");
        setList(Array.isArray(data) ? data : []);
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  // Preselect from query if present
  useEffect(() => {
    if (loadingList || !list.length) return;
    const mid = searchParams.get("motorcycleId");
    if (mid && list.some((m) => m._id === mid)) {
      setForm((f) => ({ ...f, motorcycleId: mid }));
    }
  }, [loadingList, list, searchParams]);

  // Recalculate total when dates / selection change
  useEffect(() => {
    const mc = list.find((x) => x._id === form.motorcycleId);
    if (!mc || !form.startDate || !form.endDate) return;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDays = Math.ceil((end - start) / msPerDay);
    const days = Math.max(1, rawDays);
    setForm((f) => ({ ...f, totalPrice: days * Number(mc.pricePerDay || 0) }));
  }, [form.startDate, form.endDate, form.motorcycleId, list]);

  // Load reviews + summary
  useEffect(() => {
    if (!form.motorcycleId) {
      setReviews([]);
      setSummary({ avg: 0, count: 0 });
      return;
    }
    (async () => {
      try {
        const [{ data: revs }, { data: sum }] = await Promise.all([
          api.get(`/reviews?motorcycleId=${form.motorcycleId}`),
          api.get(`/reviews/summary?motorcycleId=${form.motorcycleId}`),
        ]);
        setReviews(Array.isArray(revs) ? revs : []);
        setSummary(sum || { avg: 0, count: 0 });
      } catch {
        setReviews([]);
        setSummary({ avg: 0, count: 0 });
      }
    })();
  }, [form.motorcycleId]);

  const onStartChange = (start) => {
    if (start < todayStr) start = todayStr;
    setForm((f) => ({
      ...f,
      startDate: start,
      endDate: f.endDate && f.endDate < start ? start : f.endDate,
    }));
  };

  const onEndChange = (end) => {
    if (!form.startDate) {
      toast.info("Please choose a start date first."); // ⭐
      return;
    }
    if (end < form.startDate) {
      toast.error("End date cannot be before start date."); // ⭐
      return;
    }
    setForm((f) => ({ ...f, endDate: end }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!form.motorcycleId || !form.startDate || !form.endDate) {
        toast.info("Please complete the form."); // ⭐
        return;
      }
      if (!form.totalPrice || form.totalPrice <= 0) {
        toast.error("Please choose valid dates."); // ⭐
        return;
      }

      const { data: order } = await api.post("/payments/order", {
        amountInPaise: Math.round(form.totalPrice * 100),
        receipt: "rcpt_" + Date.now(),
      });

      const { data: booking } = await api.post("/bookings", {
        ...form,
        orderId: order.id,
      });

      toast.success("Booking created. Redirecting to payment…", 1800); // ⭐
      setTimeout(() => {
        window.location.href = `/checkout?orderId=${order.id}&bookingId=${booking._id}`;
      }, 900);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(msg); // ⭐
    }
  };

  const picked = list.find((m) => m._id === form.motorcycleId);

  return (
    <div style={{ maxWidth: 560, margin: "20px auto" }}>
      <h2>Book a Motorcycle</h2>

      {loadingList && <p>Loading motorcycles…</p>}

      {!loadingList && (
        <form onSubmit={submit}>
          <label style={{ display: "block", marginBottom: 8 }}>
            Motorcycle
            <select
              value={form.motorcycleId}
              onChange={(e) => setForm({ ...form, motorcycleId: e.target.value })}
              required
              style={{ display: "block", marginTop: 6, width: "100%" }}
            >
              <option value="">Select motorcycle</option>
              {list.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.make} {m.model} — {INR(m.pricePerDay)}/day
                </option>
              ))}
            </select>
          </label>

          {form.motorcycleId && (
            <div
              style={{
                margin: "12px 0",
                padding: 10,
                border: "1px solid #eee",
                borderRadius: 8,
                background: "#fafafa",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Recent reviews</strong>
                <span style={{ color: "#555", fontSize: 14 }}>
                  {summary.count > 0 ? `⭐ ${summary.avg} (${summary.count})` : "No ratings yet"}
                </span>
              </div>

              {reviews.length === 0 ? (
                <div style={{ color: "#666" }}>No reviews yet — be the first after booking!</div>
              ) : (
                <ul style={{ margin: 8, paddingLeft: 18 }}>
                  {reviews.slice(0, 3).map((rv) => (
                    <li key={rv._id} style={{ marginBottom: 6 }}>
                      ⭐ {rv.rating}/5 — {rv.comment}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
            <label>
              Start date
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => onStartChange(e.target.value)}
                required
                min={todayStr}
                style={{ display: "block", marginTop: 6, width: "100%" }}
              />
            </label>

            <label>
              End date
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => onEndChange(e.target.value)}
                required
                min={form.startDate || todayStr}
                style={{ display: "block", marginTop: 6, width: "100%" }}
              />
            </label>
          </div>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <strong>Total:</strong> {INR(form.totalPrice)}
            {picked && form.startDate && form.endDate && (
              <span style={{ color: "#666", marginLeft: 8 }}>
                ({INR(picked.pricePerDay)}/day)
              </span>
            )}
          </div>

          <button disabled={!form.motorcycleId || !form.startDate || !form.endDate}>
            Proceed to Pay
          </button>
        </form>
      )}
    </div>
  );
}
