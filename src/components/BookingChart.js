import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';

export default function ChartsDashboard() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    axios.get('/reports/bookings-per-day').then(res => {
      const labels = res.data.map(d => d._id);
      const data = res.data.map(d => d.count);
      setChartData({
        labels,
        datasets: [{ label: 'Bookings per day', data, backgroundColor: 'rgba(75,192,192,0.6)' }]
      });
    });
  }, []);

  if (!chartData) return <p>Loading chart...</p>;

  return <Bar data={chartData} />;
}
