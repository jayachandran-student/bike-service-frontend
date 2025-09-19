import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

function PlaceholderImg() {
  return (
    <div
      style={{
        width: "100%",
        height: 160,
        background: "linear-gradient(90deg,#f0f2f5,#fff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#9aa4b2",
        fontWeight: 600,
      }}
    >
      No image
    </div>
  );
}

export default function VehiclesGrid() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/vehicles");
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Vehicles load error:", err);
      toast.error("Failed to load vehicles.");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // refresh when other parts notify change
    const onChange = () => load();
    window.addEventListener("vehicles:changed", onChange);
    return () => window.removeEventListener("vehicles:changed", onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBook = (id) => {
    // navigate to booking page and preselect
    navigate(`/book?vehicleId=${id}`);
  };

  const isOwner = (v) => {
    if (!user) return false;
    const ownerId = v.owner?._id || v.owner || v.ownerId;
    const me = user?._id || user?.id;
    return ownerId && me && String(ownerId) === String(me);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await api.delete(`/vehicles/${id}`);
      toast.success("Deleted listing");
      // notify other components & refresh
      window.dispatchEvent(new Event("vehicles:changed"));
      setVehicles((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err?.response?.data?.message || "Failed to delete listing");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h2 className="mb-0">Motorcycles & Services</h2>
        {user?.role === "lister" && (
          <Link to="/lister/motorcycles" className="btn btn-outline-secondary">
            Manage my listings
          </Link>
        )}
      </div>

      {loading && <div className="text-center py-5">Loading…</div>}

      {!loading && vehicles.length === 0 && <div className="alert alert-info">No motorcycles available right now.</div>}

      <div className="row g-3">
        {vehicles.map((v) => (
          <div key={v._id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card h-100 shadow-sm">
              {v.images && v.images.length ? (
                <img src={v.images[0]} alt={v.title} className="card-img-top" style={{ height: 160, objectFit: "cover" }} />
              ) : (
                <PlaceholderImg />
              )}
              <div className="card-body d-flex flex-column">
                <h5 style={{ fontWeight: 700 }}>{v.title || v.make || "Untitled"}</h5>
                <div className="text-muted small mb-2">{v.brand || v.model}</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{`₹${v.rentPerDay || v.pricePerDay || v.price}/day`}</div>
                <p className="text-muted small mt-2" style={{ flex: 1 }}>
                  {v.description ? (v.description.length > 110 ? v.description.slice(0, 110) + "…" : v.description) : "No description"}
                </p>

                <div className="d-flex align-items-center justify-content-between mt-3">
                  <div className="small text-muted">{v.owner?.name ? `By ${v.owner.name}` : ""}</div>
                  <div>
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate(`/vehicle/${v._id}`)}>
                      View
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => onBook(v._id)}>
                      Book
                    </button>
                  </div>
                </div>

                {isOwner(v) && (
                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <Link to={`/lister/motorcycles`} className="small text-decoration-none">
                      Manage listing
                    </Link>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v._id)}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
