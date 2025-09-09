// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const decodeJwt = (t) => {
  try {
    if (!t) return null;
    const payload = t.split?.(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try { return JSON.parse(raw); } catch { return decodeJwt(localStorage.getItem("token")); }
    }
    return decodeJwt(localStorage.getItem("token"));
  });
  const [loading, setLoading] = useState(true);

  // run once on mount: set axios header and try to refresh user
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    (async () => {
      try {
        const t = localStorage.getItem("token");
        if (t) {
          // set axios header for future requests
          try { api.defaults.headers.common["Authorization"] = `Bearer ${t}`; } catch {}
        }
        // if user isn't loaded and we have token, attempt to fetch /auth/me
        if (!user && t) {
          try {
            const { data } = await api.get("/auth/me");
            if (data?.user) {
              setUser(data.user);
              localStorage.setItem("user", JSON.stringify(data.user));
            }
          } catch (e) {
            // ignore: may be expired token
            console.warn("Could not fetch /auth/me:", e?.message || e);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]); // run once

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res?.data || {};
      const t = data.token || data.accessToken || null;
      const u = data.user || data.userData || null;

      if (!t) {
        return { success: false, message: "Authentication token not provided by server" };
      }

      // persist
      localStorage.setItem("token", t);
      if (u) localStorage.setItem("user", JSON.stringify(u));

      // set axios header
      try { api.defaults.headers.common["Authorization"] = `Bearer ${t}`; } catch (e) {}

      setToken(t);
      setUser(u || decodeJwt(t));
      return { success: true, user: u || decodeJwt(t) };
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Login failed";
      return { success: false, message };
    }
  };

  // register
  const register = async (formData) => {
    try {
      const res = await api.post("/auth/register", formData);
      return { success: true, data: res.data };
    } catch (err) {
      const message = err?.response?.data?.message || err.message || "Registration failed";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      // optional: call backend logout endpoint if you have one
      // await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    try { localStorage.removeItem("token"); } catch {}
    try { localStorage.removeItem("user"); } catch {}
    try { delete api.defaults.headers.common["Authorization"]; } catch {}
    setToken(null);
    setUser(null);
    return true;
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
