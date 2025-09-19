import React from "react";
import { Link } from "react-router-dom";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function VehicleCard({ vehicle, showManage = false, onDelete }) {
  const img = vehicle.images && vehicle.images.length ? vehicle.images[0] : "/placeholder.png";
  const price = vehicle.rentPerDay ?? vehicle.pricePerDay ?? vehicle.price ?? 0;

  return (
    <div
      style={{
        width: 300,
        border: "1px solid #e8e8e8",
        borderRadius: 10,
        padding: 12,
        margin: 8,
        boxShadow: "0 4px 12px rgba(16,24,40,0.04)",
        background: "#fff",
      }}
    >
      <div style={{ height: 170, overflow: "hidden", borderRadius: 6 }}>
        <img src={img} alt={vehicle.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      <h3 style={{ marginTop: 10, marginBottom: 6 }}>{vehicle.title || vehicle.make || "Untitled"}</h3>
      <div style={{ color: "#555", fontSize: 13 }}>
        {vehicle.brand || ""} {vehicle.model ? `• ${vehicle.model}` : ""} {vehicle.year ? `• ${vehicle.year}` : ""}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <strong>{INR(price)}/day</strong>
        <Link
          to={`/vehicle/${vehicle._id}`}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #f0ad4e",
            background: "#fff",
            color: "#f78a02",
            textDecoration: "none",
          }}
        >
          View
        </Link>
      </div>

      {showManage && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <Link to={`/vehicle/${vehicle._id}`} style={{ fontSize: 13, textDecoration: "underline" }}>
            Details
          </Link>
          <button
            onClick={() => onDelete?.(vehicle._id)}
            disabled={!onDelete}
            style={{
              marginLeft: "auto",
              background: "#ffefef",
              border: "1px solid #f5c6cb",
              color: "#c53030",
              padding: "6px 8px",
              borderRadius: 6,
              cursor: onDelete ? "pointer" : "not-allowed",
            }}
            aria-disabled={!onDelete}
            title={onDelete ? "Delete" : "Delete (disabled)"}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
