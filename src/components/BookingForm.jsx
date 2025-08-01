import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

const BookingForm = () => {
  const [formData, setFormData] = useState({
  customerName: '',
  serviceType: '',
  bikeModel: '',
  appointmentDate: '',
});


  const handleChange = (e) => {
    setFormData({ 
      ...formData,
      [e.target.name]: e.target.value 
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: formData.name,
        serviceType: 'Standard Service', // Optional or add a dropdown for this
        bikeModel: formData.bikeModel,
        appointmentDate: formData.serviceDate,
      }),
    });

    if (!response.ok) throw new Error('Failed to book service');

    alert('Booking submitted successfully!');
    setFormData({
      name: '',
      bikeModel: '',
      serviceDate: '',
      contact: '',
    });

  } catch (error) {
    console.error('Booking error:', error);
    alert('Server error. Try again later.');
  }
};


  return (
    <Container className="mt-4">
      <h3>Book Your Service</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formName" className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formModel" className="mb-3">
          <Form.Label>Bike Model</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter bike model"
            name="bikeModel"
            value={formData.bikeModel}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDate" className="mb-3">
          <Form.Label>Service Date</Form.Label>
          <Form.Control
            type="date"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formContact" className="mb-3">
          <Form.Label>Contact Number</Form.Label>
          <Form.Control
            type="tel"
            placeholder="Enter contact number"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Book Now
        </Button>
      </Form>
    </Container>
  );
};

export default BookingForm;
