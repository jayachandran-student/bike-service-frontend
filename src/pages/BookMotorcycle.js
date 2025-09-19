import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function BookMotorcycle() {
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [list, setList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    motorcycleId: "",
    startDate: "",
    endDate: "",
    totalPrice: 0,
  });

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // helper: per-day price
  const unitPrice = (m) => Number(m?.rentPerDay ?? m?.pricePerDay ?? m?.price ?? 0);

  // Load vehicles
  useEffect(() => {
    (async () => {
      setLoadingList(true);
      try {
        const { data } = await api.get("/vehicles");
        let items = Array.isArray(data) ? data : [];

        // filter only available vehicles
        items = items.filter((v) => (typeof v.available === "boolean" ? v.available : true));

        // normalize + dedupe
        const seen = new Set();
        items = items
          .map((v) => ({
            ...v,
            _price: Number(v.rentPerDay ?? v.pricePerDay ?? v.price ?? 0),
            _title: v.title || v.make || v.brand || v.model || "Untitled",
          }))
          .filter((v) => {
            if (!v._id) return false;
            if (seen.has(String(v._id))) return false;
            seen.add(String(v._id));
            return true;
          });

        // sort by price asc
        items.sort((a, b) => a._price - b._price);

        setList(items);

        // preselect if only one
        if (items.length === 1) {
          setForm((f) => ({ ...f, motorcycleId: items[0]._id }));
        }
      } catch (err) {
        console.error("Failed to load vehicles:", err);
        toast.error("Failed to load motorcycles list.");
        setList([]);
      } finally {
        setLoadingList(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Preselect from query
  useEffect(() => {
    if (loadingList || !list.length) return;
    const mid = searchParams.get("motorcycleId") || searchParams.get("vehicleId");
    if (mid && list.some((m) => m._id === mid)) {
      setForm((f) => ({ ...f, motorcycleId: mid }));
    }
  }, [loadingList, list, searchParams]);

  // Recalculate total
  useEffect(() => {
    const mc = list.find((x) => x._id === form.motorcycleId);
    if (!mc || !form.startDate || !form.endDate) {
      setForm((f) => ({ ...f, totalPrice: 0 }));
      return;
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDays = Math.ceil((end - start) / msPerDay);
    const days = Math.max(1, rawDays);

    const perDay = unitPrice(mc);
    setForm((f) => ({ ...f, totalPrice: days * perDay }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.info("Please choose a start date first.");
      return;
    }
    if (end < form.startDate) {
      toast.error("End date cannot be before start date.");
      return;
    }
    setForm((f) => ({ ...f, endDate: end }));
  };

  // submit
  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.motorcycleId || !form.startDate || !form.endDate) {
        toast.info("Please complete the form.");
        return;
      }
      if (!form.totalPrice || form.totalPrice <= 0) {
        toast.error("Please choose valid dates.");
        return;
      }

      // create payment order
      const { data: order } = await api.post("/payments/order", {
        amountInPaise: Math.round(form.totalPrice * 100),
        receipt: "rcpt_" + Date.now(),
      });

      // create booking
      const bookingPayload = {
        motorcycleId: form.motorcycleId,
        vehicleId: form.motorcycleId,
        startDate: form.startDate,
        endDate: form.endDate,
      };
      console.log("[BookMotorcycle] creating booking, payload:", bookingPayload);

      const { data: booking } = await api.post("/bookings", bookingPayload);
      console.log("[BookMotorcycle] booking response:", booking);

      toast.success("Booking created. Redirecting to payment…", 1800);
      setTimeout(() => {
        window.location.href = `/checkout?orderId=${order.id}&bookingId=${booking._id}`;
      }, 900);
    } catch (err) {
      console.error("Booking error:", err);
      console.error("Response data:", err?.response?.data);
      const msg = err?.response?.data?.message || err.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const picked = list.find((m) => m._id === form.motorcycleId);

  return (
    <div className="container d-flex justify-content-center">
      <div className="card shadow-lg p-4 mt-4" style={{ maxWidth: 600, width: "100%" }}>
        <h3 className="mb-3 text-center">Book a Motorcycle</h3>

        {loadingList && <p>Loading motorcycles…</p>}

        {!loadingList && (
          <form onSubmit={submit}>
            {/* Motorcycle select */}
            <div className="mb-3">
              <label className="form-label">Motorcycle</label>
              <select
                className="form-select"
                value={form.motorcycleId}
                onChange={(e) => setForm({ ...form, motorcycleId: e.target.value })}
                required
              >
                <option value="">Select motorcycle</option>
                {list.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m._title} — {INR(m._price)}/day
                  </option>
                ))}
              </select>
            </div>

            {/* Reviews */}
            {form.motorcycleId && (
              <div className="mb-3 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <strong>Recent reviews</strong>
                  <span className="text-muted small">
                    {summary.count > 0 ? `⭐ ${summary.avg} (${summary.count})` : "No ratings yet"}
                  </span>
                </div>
                {reviews.length === 0 ? (
                  <p className="text-muted small mb-0">No reviews yet — be the first after booking!</p>
                ) : (
                  <ul className="mb-0">
                    {reviews.slice(0, 3).map((rv) => (
                      <li key={rv._id} className="small">
                        ⭐ {rv.rating}/5 — {rv.comment}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Start date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.startDate}
                  onChange={(e) => onStartChange(e.target.value)}
                  required
                  min={todayStr}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">End date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.endDate}
                  onChange={(e) => onEndChange(e.target.value)}
                  required
                  min={form.startDate || todayStr}
                />
              </div>
            </div>

            {/* Total */}
            <div className="mb-3">
              <strong>Total:</strong> {INR(form.totalPrice)}
              {picked && form.startDate && form.endDate && (
                <span className="text-muted ms-2">({INR(unitPrice(picked))}/day)</span>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={submitting || !form.motorcycleId || !form.startDate || !form.endDate}
            >
              {submitting ? "Processing…" : "Proceed to Pay"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
