import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'July 28', bookings: 2 },
  { date: 'July 29', bookings: 3 },
  { date: 'July 30', bookings: 4 },
  { date: 'July 31', bookings: 1 },
];

const BookingChart = () => {
  return (
    <div>
      <h3>Bookings Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 30, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="bookings" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BookingChart;
