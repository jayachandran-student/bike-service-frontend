import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function VehicleDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setMsg("Loading...");
        const { data } = await api.get(`/vehicles/${id}`);
        if (mounted) {
          setVehicle(data);
          setMsg("");
        }
      } catch (err) {
        if (mounted) setMsg(err?.response?.data?.message || "Failed to load");
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleBook = async () => {
    setMsg("");
    if (!localStorage.getItem("token")) return setMsg("Please login to book.");
    if (!startDate || !endDate) return setMsg("Please select start and end date.");
    try {
      // no need to assign the response to a variable if we don't use it
      await api.post("/bookings", { motorcycleId: id, startDate, endDate });
      setMsg("Booking created successfully.");
      nav("/my-bookings"); // optional — adjust to your bookings page
    } catch (err) {
      setMsg(err?.response?.data?.message || "Booking failed");
    }
  };

  if (msg && !vehicle) return <div style={{ padding: 20 }}>{msg}</div>;
  if (!vehicle) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>{vehicle.title}</h2>
      <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
        <div style={{ flex: 1 }}>
          <img
            src={vehicle.images?.[0] || "/placeholder.png"}
            alt=""
            style={{ width: "100%", height: 420, objectFit: "cover", borderRadius: 8 }}
          />
        </div>
        <div style={{ width: 360 }}>
          <p style={{ color: "#333" }}>{vehicle.description}</p>
          <p><strong>₹{vehicle.rentPerDay}/day</strong></p>

          <div style={{ marginTop: 12 }}>
            <label>Start date<br />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <br />
            <label>End date<br />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
            <br />
            <button onClick={handleBook} style={{ marginTop: 10, padding: "8px 12px", borderRadius: 6 }}>Book</button>
          </div>

          {msg && <div style={{ marginTop: 12, color: msg.toLowerCase().includes("success") ? "green" : "red" }}>{msg}</div>}
        </div>
      </div>
    </div>
  );
}
