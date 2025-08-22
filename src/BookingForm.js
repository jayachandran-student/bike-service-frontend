import { useState } from "react";
import axios from "axios";

function BookingForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    service: "",
    date: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    try {
      // Replace with your actual backend Render URL
      await axios.post("https://your-backend.onrender.com/api/bookings", formData);

      setStatus("✅ Booking Successful!");
      setFormData({ name: "", email: "", service: "", date: "" });
    } catch (error) {
      console.error(error);
      setStatus("❌ Booking failed. Try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Motorcycle Service Booking</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          required
        />
        <select
          name="service"
          value={formData.service}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          required
        >
          <option value="">Select Service</option>
          <option value="General Service">General Service</option>
          <option value="Oil Change">Oil Change</option>
          <option value="Brake Check">Brake Check</option>
        </select>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Book Now
        </button>
      </form>
      {status && <p className="mt-4 text-center font-medium">{status}</p>}
    </div>
  );
}

export default BookingForm;
