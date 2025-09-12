import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://motorcycle-service-booking-backend-5.onrender.com";

const api = axios.create({
  baseURL: API_BASE + "/api", 
  withCredentials: true,      
});

export default api;
