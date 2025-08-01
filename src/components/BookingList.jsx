import React, { useEffect, useState } from 'react';
import { Container, Card } from 'react-bootstrap';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/bookings') // Adjust if your backend runs on a different port
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error('Error fetching bookings:', err));
  }, []);

  return (
    <Container className="mt-4">
      <h3>Recent Bookings</h3>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <Card key={booking._id} className="mb-3">
            <Card.Body>
              <Card.Title>{booking.customerName}</Card.Title>
              <Card.Text>
                <strong>Bike Model:</strong> {booking.bikeModel} <br />
                <strong>Service Type:</strong> {booking.serviceType} <br />
                <strong>Date:</strong>{' '}
                {new Date(booking.appointmentDate).toLocaleDateString()}
              </Card.Text>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default BookingList;
