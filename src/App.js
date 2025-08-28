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
import { ToastProvider } from "./context/ToastContext"; // ⭐ add

function App() {
  return (
    <AuthProvider>
      <ToastProvider>{/* ⭐ enable toasts app-wide */}
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* public */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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

            {/* fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
