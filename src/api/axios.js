import axios from "axios";


const viteBase = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE : undefined;
const craBase  = typeof process !== "undefined" ? process.env?.REACT_APP_API_BASE : undefined;


const API_BASE = (viteBase || craBase || "http://localhost:5000").replace(/\/+$/, "");


const api = axios.create({
  baseURL: `${API_BASE}/api`
});


api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
