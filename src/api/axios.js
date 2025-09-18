import axios from "axios";

const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  "https://motorcycle-service-booking-backend-5.onrender.com";

const api = axios.create({
  baseURL: API_BASE.replace(/\/$/, "") + "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
