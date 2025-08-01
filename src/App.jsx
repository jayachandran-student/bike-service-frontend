import React from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList'; 

function App() {
  return (
    <div>
      <Navbar />
      <BookingForm />
      <BookingList /> {/* ✅ ADD THIS */}
    </div>
  );
}

export default App;
