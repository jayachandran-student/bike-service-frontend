import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://motorcycle-service-booking-backend-5.onrender.com";

const api = axios.create({
  baseURL: API_BASE + "/api",
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers) {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
