import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "taker",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Redirect already-authenticated users to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const result = await register(formData);

      // If API returned token & user, save and go to dashboard
      const token = result?.token || result?.data?.token;
      const userObj = result?.user || result?.data?.user;

      if (token) {
        localStorage.setItem("token", token);
      }
      if (userObj) {
        localStorage.setItem("user", JSON.stringify(userObj));
      }

      if (token && userObj) {
        // immediate login UX
        navigate("/dashboard");
        return;
      }

      if (result.success) {
        setMessage("Registered successfully ✅ Redirecting to login...");
        setTimeout(() => navigate("/login"), 1400);
      } else {
        setMessage(result.message || "Registration failed ❌");
      }
    } catch (err) {
      console.error("Register error:", err);
      const resp = err?.response?.data;
      setMessage(resp?.message || err?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "75vh" }}>
      <div className="card shadow-sm p-4" style={{ maxWidth: 480, width: "100%" }}>
        <h3 className="mb-3 text-center">Create an account</h3>

        {message && (
          <div className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full name</label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Your full name"
              value={formData.name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Choose a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
              <option value="taker">Taker (Customer)</option>
              <option value="lister">Lister (Owner)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success w-100">
            Register
          </button>

          <div className="mt-3 text-center">
            <small>
              Already have an account? <Link to="/login">Login</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
