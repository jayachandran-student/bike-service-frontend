import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Redirect already-authenticated users to dashboard
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const result = await login(email, password);

      // Save token and user (defensive)
      if (result?.token) localStorage.setItem("token", result.token);
      if (result?.user) localStorage.setItem("user", JSON.stringify(result.user));
      if (!result?.token && result?.data?.token) localStorage.setItem("token", result.data.token);
      if (!result?.user && result?.data?.user) localStorage.setItem("user", JSON.stringify(result.data.user));

      if (result.success) {
        navigate("/dashboard");
      } else {
        setMessage(result.message || "Login failed ❌");
      }
    } catch (err) {
      console.error("Login error:", err);
      const resp = err?.response?.data;
      if (resp?.token) localStorage.setItem("token", resp.token);
      if (resp?.user) localStorage.setItem("user", JSON.stringify(resp.user));
      setMessage(resp?.message || err?.message || "Login failed ❌");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "75vh" }}>
      <div className="card shadow-sm p-4" style={{ maxWidth: 420, width: "100%" }}>
        <h3 className="mb-3 text-center">Login</h3>

        {message && <div className="alert alert-danger">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>

          <div className="mt-3 text-center">
            <small>
              Don't have an account? <Link to="/register">Register</Link>
            </small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
