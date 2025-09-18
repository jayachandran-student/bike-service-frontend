// src/pages/Motorcycles.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

/**
 * My Motorcycles (Lister view)
 * Uses:
 *  - GET /auth/me
 *  - GET /vehicles/mine
 *  - POST /vehicles
 *  - DELETE /vehicles/:id
 */
export default function Motorcycles() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    make: "",
    model: "",
    regNumber: "",
    pricePerDay: "",
  });

  const canSubmit = useMemo(() => {
    const { make, model, regNumber, pricePerDay } = form;
    return (
      make.trim() &&
      model.trim() &&
      regNumber.trim() &&
      String(pricePerDay).trim() &&
      Number(pricePerDay) > 0
    );
  }, [form]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      // fetch current profile (defensive)
      const prof = await api.get("/auth/me").then((r) => r.data).catch(() => null);
      setMe(prof);

      // fetch vehicles for this lister
      const list = await api.get("/vehicles/mine").then((r) => (Array.isArray(r.data) ? r.data : []));

      // defensive filter: ensure only vehicles owned by this user are shown
      const safe = prof && prof.id
        ? list.filter((v) => {
            const ownerId = v.owner?._id || v.owner || v.ownerId;
            return ownerId && ownerId.toString() === prof.id.toString();
          })
        : list;

      // newest first
      setRows(safe.slice().reverse());
    } catch (e) {
      console.error("Load my vehicles error:", e);
      setErr(e?.response?.data?.message || "Failed to load motorcycles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);

    // optimistic row — map to Vehicle shape minimally
    const optimistic = {
      _id: "tmp-" + Date.now(),
      title: form.make, // using "make" as title/service name
      brand: form.model,
      model: form.model,
      regNumber: form.regNumber,
      rentPerDay: Number(form.pricePerDay),
      __optimistic: true,
    };
    setRows((r) => [optimistic, ...r]);

    try {
      const payload = {
        title: form.make.trim(),
        brand: form.model.trim(),
        model: form.model.trim(),
        // optional: include regNumber in description (or add a regNumber field server-side)
        description: `Reg: ${form.regNumber.trim()}`,
        rentPerDay: Number(form.pricePerDay),
        images: [], // optional
      };

      const { data } = await api.post("/vehicles", payload);

      // replace optimistic row with real one (if created)
      setRows((r) => [data, ...r.filter((x) => x._id !== optimistic._id)]);
      setForm({ make: "", model: "", regNumber: "", pricePerDay: "" });
      alert("Added ✅");
    } catch (e) {
      // rollback optimistic row
      setRows((r) => r.filter((x) => x._id !== optimistic._id));
      alert(e?.response?.data?.message || "Could not add motorcycle");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this motorcycle?")) return;

    // optimistic remove
    const snapshot = rows;
    setRows((r) => r.filter((x) => x._id !== id));

    try {
      await api.delete(`/vehicles/${id}`);
      alert("Deleted ✅");
    } catch (e) {
      // rollback
      setRows(snapshot);
      alert(e?.response?.data?.message || "Could not delete motorcycle");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Motorcycles</h2>

      {/* Add form */}
      <form
        onSubmit={onAdd}
        style={{
          margin: "12px 0 16px",
          padding: 12,
          border: "1px solid #eee",
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,.04)",
          display: "grid",
          gap: 10,
          gridTemplateColumns: "2fr 2fr 2fr 1fr auto",
          alignItems: "end",
        }}
      >
        <label style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Make / Service</div>
          <input
            value={form.make}
            onChange={(e) => setForm({ ...form, make: e.target.value })}
            placeholder="e.g., Full Service"
            required
            style={{ width: "100%" }}
          />
        </label>

        <label style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Model</div>
          <input
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            placeholder="e.g., Pulsar / KWID"
            required
            style={{ width: "100%" }}
          />
        </label>

        <label style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Reg Number</div>
          <input
            value={form.regNumber}
            onChange={(e) => setForm({ ...form, regNumber: e.target.value })}
            placeholder="TN11AA1234"
            required
            style={{ width: "100%" }}
          />
        </label>

        <label style={{ display: "block" }}>
          <div style={{ fontSize: 12, color: "#666" }}>₹ / day</div>
          <input
            type="number"
            min="1"
            value={form.pricePerDay}
            onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
            placeholder="1500"
            required
            style={{ width: "100%" }}
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || saving}
          style={{
            border: "1px solid #e1e1e1",
            padding: "8px 12px",
            borderRadius: 8,
            background: canSubmit && !saving ? "#0d6efd" : "#e9ecef",
            color: canSubmit && !saving ? "#fff" : "#777",
            cursor: canSubmit && !saving ? "pointer" : "not-allowed",
            whiteSpace: "nowrap",
          }}
        >
          {saving ? "Adding…" : "Add"}
        </button>
      </form>

      {/* List */}
      {loading && <p>Loading…</p>}

      {!loading && rows.length === 0 && (
        <div
          style={{
            padding: 20,
            border: "1px dashed #cbd5e1",
            borderRadius: 12,
            color: "#64748b",
            background: "#f8fafc",
          }}
        >
          You haven’t added any motorcycles yet. Use the form above to create one.
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #eee",
            borderRadius: 12,
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,.04)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #f2f2f2" }}>
                <th style={{ padding: 12 }}>Make</th>
                <th style={{ padding: 12 }}>Model</th>
                <th style={{ padding: 12 }}>Reg Number</th>
                <th style={{ padding: 12 }}>₹/day</th>
                <th style={{ padding: 12, width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m._id} style={{ borderBottom: "1px solid #f7f7f7" }}>
                  <td style={{ padding: 12 }}>{m.title || m.make}</td>
                  <td style={{ padding: 12 }}>{m.model || m.brand || "-"}</td>
                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>{m.regNumber || (m.description?.startsWith("Reg:") ? m.description.slice(4).trim() : "—")}</td>
                  <td style={{ padding: 12 }}>{INR(m.rentPerDay || m.pricePerDay)}</td>
                  <td style={{ padding: 12 }}>
                    <button
                      onClick={() => onDelete(m._id)}
                      disabled={m.__optimistic}
                      style={{
                        border: "1px solid #dc3545",
                        color: "#dc3545",
                        background: "transparent",
                        padding: "6px 10px",
                        borderRadius: 8,
                        cursor: m.__optimistic ? "not-allowed" : "pointer",
                      }}
                      title={m.__optimistic ? "Saving…" : "Delete"}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {err && <div style={{ color: "red", marginTop: 12 }}>{err}</div>}
    </div>
  );
}
