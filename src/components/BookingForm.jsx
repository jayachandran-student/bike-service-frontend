import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

export default function BookingForm() {
  const { user } = useContext(AuthContext);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    axios.get('/users/profile').then(res => setVehicles(res.data.vehicles || []));
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('/bookings', {
      vehicle: vehicles[selectedVehicle],
      serviceType,
      date
    }).then(() => alert('Booking created'));
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border rounded">
      <h5>Create Booking</h5>
      <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)} className="form-select mb-2">
        {vehicles.map((v, idx) => (
          <option key={idx} value={idx}>{v.make} {v.model} ({v.plate})</option>
        ))}
      </select>
      <input type="text" className="form-control mb-2" placeholder="Service Type" value={serviceType} onChange={e => setServiceType(e.target.value)} />
      <input type="date" className="form-control mb-2" value={date} onChange={e => setDate(e.target.value)} />
      <button className="btn btn-primary">Book</button>
    </form>
  );
}
