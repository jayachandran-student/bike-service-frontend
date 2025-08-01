import React from 'react';

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', marginTop: '2rem' }}>
      <p>&copy; {new Date().getFullYear()} Motorcycle Service Booking</p>
    </footer>
  );
};

export default Footer;
