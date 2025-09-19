import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BookMotorcycle from "./pages/BookMotorcycle";
import MyBookings from "./pages/MyBookings";
import Checkout from "./pages/Checkout";
import Motorcycles from "./pages/Motorcycles";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./context/ToastContext";

// new pages we added
import VehicleDetails from "./pages/VehicleDetails";
import VehiclesGrid from "./pages/VehiclesGrid";   // <-- NEW
import MyVehicle from "./pages/MyVehicle";
import AddVehicle from "./pages/AddVehicle";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>{/* ⭐ enable toasts app-wide */}
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* public */}
            {/* Landing to vehicles listing so reviewers/users see listings immediately */}
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* public vehicles listing + details */}
            <Route path="/vehicles" element={<VehiclesGrid />} />        {/* <-- listing page */}
            <Route path="/vehicle/:id" element={<VehicleDetails />} />

            {/* protected – common */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />

            {/* protected – taker */}
            <Route
              path="/book"
              element={
                <ProtectedRoute role="taker">
                  <BookMotorcycle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute role="taker">
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute role="taker">
                  <Checkout />
                </ProtectedRoute>
              }
            />

            {/* protected – lister */}
            <Route
              path="/lister/motorcycles"
              element={
                <ProtectedRoute role="lister">
                  <Motorcycles />
                </ProtectedRoute>
              }
            />

            {/* new lister routes (note: using MyVehicle filename) */}
            <Route
              path="/my-vehicles"
              element={
                <ProtectedRoute role="lister">
                  <MyVehicle />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-vehicle"
              element={
                <ProtectedRoute role="lister">
                  <AddVehicle />
                </ProtectedRoute>
              }
            />

            {/* fallback */}
            <Route path="*" element={<Navigate to="/vehicles" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
