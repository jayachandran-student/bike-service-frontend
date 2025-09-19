import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export default function VehicleDetails() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: v }, { data: revs }] = await Promise.all([
        api.get(`/vehicles/${id}`),
        api.get(`/reviews?motorcycleId=${id}`).catch(() => ({ data: [] })),
      ]);
      setVehicle(v);
      setReviews(Array.isArray(revs) ? revs : []);
    } catch (err) {
      console.error("Vehicle details error:", err);
      toast.error("Could not load vehicle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="container py-4">Loading…</div>;
  if (!vehicle) return <div className="container py-4">Vehicle not found.</div>;

  const ownerId = vehicle.owner?._id || vehicle.owner || vehicle.ownerId;
  const amOwner = user && (String(user._id || user.id) === String(ownerId));

  const onBook = () => {
    navigate(`/book?vehicleId=${vehicle._id}`);
  };

  const onDelete = async () => {
    if (!window.confirm("Delete this vehicle?")) return;
    try {
      await api.delete(`/vehicles/${vehicle._id}`);
      toast.success("Deleted");
      window.dispatchEvent(new Event("vehicles:changed"));
      navigate("/lister/motorcycles");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-3">
        <div className="col-md-6">
          <div className="card">
            {vehicle.images && vehicle.images.length ? (
              <img src={vehicle.images[0]} alt={vehicle.title} style={{ width: "100%", height: 320, objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: 320, background: "#f6f7fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="text-muted">No image</div>
              </div>
            )}
            <div className="card-body">
              <h3 style={{ fontWeight: 700 }}>{vehicle.title}</h3>
              <div className="text-muted small mb-2">{vehicle.brand || vehicle.model}</div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>
                {INR(vehicle.rentPerDay ?? vehicle.pricePerDay ?? vehicle.price)}/day
              </div>
              <p className="mt-3">{vehicle.description || "No description"}</p>

              <div className="d-flex align-items-center justify-content-between mt-3">
                <div>
                  <div className="small text-muted">Owner</div>
                  <div style={{ fontWeight: 600 }}>{vehicle.owner?.name || "Unknown"}</div>
                  <div className="small text-muted">{vehicle.owner?.email}</div>
                </div>
                <div>
                  <button className="btn btn-primary me-2" onClick={onBook}>
                    Book
                  </button>
                  {amOwner && (
                    <>
                      <Link className="btn btn-outline-secondary me-2" to={`/lister/motorcycles`}>
                        Edit
                      </Link>
                      <button className="btn btn-danger" onClick={onDelete}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card p-3 mb-3">
            <h5 className="mb-2">Reviews</h5>
            {reviews.length === 0 ? (
              <div className="text-muted">No reviews yet.</div>
            ) : (
              <ul className="list-unstyled mb-0">
                {reviews.map((r) => (
                  <li key={r._id} className="mb-2">
                    <div style={{ fontWeight: 700 }}>{r.user?.name || r.name || "Anon"}</div>
                    <div className="small text-muted">⭐ {r.rating}/5</div>
                    <div>{r.comment}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-3">
            <h5 className="mb-2">Details</h5>
            <div className="small text-muted">Availability</div>
            <div style={{ fontWeight: 700 }}>{vehicle.available ? "Available" : "Unavailable"}</div>
            <div className="mt-3 small text-muted">Created</div>
            <div>{new Date(vehicle.createdAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
