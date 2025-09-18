import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AddVehicle() {
  const [form, setForm] = useState({
    title: "", brand: "", model: "", year: "", rentPerDay: "", description: "", images: ""
  });
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.title) return setMsg("Title is required");
    try {
      const payload = {
        title: form.title,
        brand: form.brand,
        model: form.model,
        year: form.year ? Number(form.year) : undefined,
        rentPerDay: form.rentPerDay ? Number(form.rentPerDay) : 0,
        description: form.description,
        images: form.images ? form.images.split(",").map(s => s.trim()) : []
      };
      await api.post("/vehicles", payload);
      setMsg("Created");
      nav("/my-vehicles");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to create");
    }
  };

  return (
    <div style={{ padding: 18, maxWidth: 720 }}>
      <h2>Add Vehicle</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 8 }}>
        <input name="title" placeholder="Title" value={form.title} onChange={onChange} required />
        <input name="brand" placeholder="Brand" value={form.brand} onChange={onChange} />
        <input name="model" placeholder="Model" value={form.model} onChange={onChange} />
        <input name="year" placeholder="Year" value={form.year} onChange={onChange} />
        <input name="rentPerDay" placeholder="Rent per day" value={form.rentPerDay} onChange={onChange} />
        <textarea name="description" placeholder="Description" value={form.description} onChange={onChange} />
        <input name="images" placeholder="Image URLs (comma separated)" value={form.images} onChange={onChange} />
        <div>
          <button type="submit" style={{ padding: "8px 12px", borderRadius: 6 }}>Create</button>
        </div>
      </form>
      {msg && <div style={{ marginTop: 10, color: msg === "Created" ? "green" : "red" }}>{msg}</div>}
    </div>
  );
}
