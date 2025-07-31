import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';

function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleModel: '',
    serviceDate: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just show the form data in console
    console.log('Booking submitted:', formData);
    alert('Booking Submitted!');
    // Later we'll send this to the backend using axios
  };

  return (
    <Container className="mt-4">
      <h2>Book Your Motorcycle Service</h2>
      <Form onSubmit={handleSubmit}>

        <Form.Group controlId="formName" className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter your full name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formPhone" className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="tel"
            placeholder="Enter phone number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formModel" className="mb-3">
          <Form.Label>Vehicle Model</Form.Label>
          <Form.Control
            type="text"
            placeholder="Eg: Honda Shine, Bajaj Pulsar"
            name="vehicleModel"
            value={formData.vehicleModel}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDate" className="mb-3">
          <Form.Label>Preferred Service Date</Form.Label>
          <Form.Control
            type="date"
            name="serviceDate"
            value={formData.serviceDate}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="formNotes" className="mb-3">
          <Form.Label>Additional Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Anything specific to mention?"
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit Booking
        </Button>
      </Form>
    </Container>
  );
}

export default Booking;

