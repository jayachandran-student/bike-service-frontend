import React, { useEffect, useState } from "react";
import api from "../api/axios";
import VehicleCard from "../components/VehicleCard";
import { Link } from "react-router-dom";

export default function MyVehicle() {
  const [vehicles, setVehicles] = useState([]);
  const [me, setMe] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // fetch current profile
        const profile = await api.get("/auth/me").then(r => r.data).catch(() => null);
        setMe(profile);

        // fetch my vehicles (server should return only my vehicles, but we filter defensively)
        const list = await api.get("/vehicles/mine").then(r => r.data || []);
        if (profile && profile.id) {
          const safe = list.filter(v => {
            const ownerId = v.owner?._id || v.owner || v.ownerId;
            return ownerId && ownerId.toString() === profile.id.toString();
          });
          setVehicles(safe);
        } else {
          setVehicles(list || []);
        }
      } catch (e) {
        setErr(e?.response?.data?.message || "Failed to load");
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      setVehicles(prev => prev.filter(v => v._id !== id));
    } catch (e) {
      alert(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>My Vehicles</h2>
        <Link to="/add-vehicle" style={{ padding: "6px 10px", border: "1px solid #28a745", borderRadius: 6, textDecoration: "none", color: "#28a745" }}>Add Vehicle</Link>
      </div>

      {err && <div style={{ color: "red" }}>{err}</div>}

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 12 }}>
        {vehicles.length === 0 && <div>No vehicles yet. Add one to list it.</div>}
        {vehicles.map(v => <VehicleCard key={v._id} vehicle={v} showManage onDelete={handleDelete} />)}
      </div>
    </div>
  );
}
