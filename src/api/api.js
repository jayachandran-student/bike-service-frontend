import axios from "axios";

// ✅ Detect if we are in production (Netlify) or local
const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://your-backend.onrender.com/api/auth" // ⬅ Replace with your Render backend URL
      : "http://localhost:5000/api/auth",
});

// Attach token automatically if it exists
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Export API functions
export const registerUser = (data) => API.post("/register", data);
export const loginUser = (data) => API.post("/login", data);
export const getProfile = () => API.get("/profile");
