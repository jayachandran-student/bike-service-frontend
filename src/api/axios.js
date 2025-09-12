import axios from "axios";


const envVite = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE : undefined;
const envCRA = typeof process !== "undefined" ? process.env.REACT_APP_API_BASE : undefined;


const FALLBACK_API = "https://motorcycle-service-booking-backend-5.onrender.com";

const rawBase = envVite || envCRA || FALLBACK_API;
const API_BASE = rawBase.replace(/\/+$/, ""); // remove trailing slash

const api = axios.create({
  baseURL: API_BASE + "/api", 
  withCredentials: true,      
  timeout: 15000,
});

export default api;
