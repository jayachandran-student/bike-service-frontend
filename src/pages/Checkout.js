import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext"; 

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const toast = useToast();
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = params.get("orderId");
  const bookingId = params.get("bookingId");

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!orderId || !bookingId) {
          setMsg("Missing order/booking information. Please start again.");
          setBusy(false);
          return;
        }

        await loadRazorpay();

        const key = process.env.REACT_APP_RAZORPAY_KEY_ID;
        if (!key) {
          const m = "Razorpay Key ID not found. Set REACT_APP_RAZORPAY_KEY_ID in .env/Netlify env.";
          setMsg(m);
          toast.error(m);
          setBusy(false);
          return;
        }

        // fetch the specific booking to get price
        const { data: booking } = await api.get(`/bookings/${bookingId}`);

        
        if (!booking) {
          setMsg("Booking not found. Please try again.");
          setBusy(false);
          return;
        }

        const amountInPaise = Math.round(Number(booking.totalPrice || 0) * 100);

        const rzp = new window.Razorpay({
          key,
          order_id: orderId,
          amount: amountInPaise,
          currency: "INR",
          name: "Motorcycle Service Booking",
          description: `${booking.motorcycle?.make || ""} ${booking.motorcycle?.model || ""}`,
          prefill: {
            name: booking.user?.name || "",
            email: booking.user?.email || "",
          },
          notes: { bookingId },
          handler: async (response) => {
            try {
              await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              });
              toast.success("Payment successful! Booking confirmed ✅");
              navigate("/my-bookings", { replace: true });
            } catch (err) {
              const m = err?.response?.data?.message || "Verification failed — please check My Bookings.";
              toast.error(m);
              navigate("/my-bookings", { replace: true });
            }
          },
          modal: {
            ondismiss: () => navigate("/my-bookings", { replace: true }),
          },
          theme: { color: "#007bff" },
        });

        rzp.open();
      } catch (e) {
        const m = e?.response?.data?.message || e?.message || "Could not start payment. Please try again.";
        setMsg(m);
        toast.error(m);
      } finally {
        setBusy(false);
      }
    })();
  }, [orderId, bookingId, navigate, toast]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Checkout</h2>
      {busy && <p>Preparing payment…</p>}
      {!busy && msg && <p style={{ color: "crimson" }}>{msg}</p>}
      <p>If the Razorpay window didn’t open, refresh this page.</p>
    </div>
  );
}
