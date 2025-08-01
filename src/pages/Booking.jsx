import React, { useState } from 'react';

const Booking = () => {
  const [form, setForm] = useState({
    name: '',
    bikeModel: '',
    serviceDate: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    alert("Booking submitted!");
    
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
      <h2>Book a Service</h2>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        required
      /><br /><br />
      <input
        type="text"
        name="bikeModel"
        placeholder="Bike Model"
        value={form.bikeModel}
        onChange={handleChange}
        required
      /><br /><br />
      <input
        type="date"
        name="serviceDate"
        value={form.serviceDate}
        onChange={handleChange}
        required
      /><br /><br />
      <button type="submit">Submit</button>
    </form>
  );
};

export default Booking;
