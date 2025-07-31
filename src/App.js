import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NavigationBar from './components/Navbar';

function App() {
  return (
    <Router>
      <NavigationBar  />
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;