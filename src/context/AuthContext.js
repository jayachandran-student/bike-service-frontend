import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
export const AuthContext = createContext(null);
export const useAuth = ()=> useContext(AuthContext);

const decode = (t)=>{ try{ return t ? JSON.parse(atob(t.split(".")[1])) : null }catch{ return null } };

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(token ? decode(token) : null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async ()=>{
    if (!token) { setUser(null); setLoading(false); return; }
    setUser(u => u ?? decode(token));
    try { const { data } = await api.get("/auth/me"); if (data?.user) setUser(data.user); }
    finally { setLoading(false); }
  })(); }, [token]);

  const login = async (email,password)=>{
    try{ const { data } = await api.post("/auth/login",{ email,password });
      localStorage.setItem("token", data.token); setToken(data.token); setUser(data.user || decode(data.token));
      return { success:true };
    }catch(e){ return { success:false, message: e.response?.data?.message || "Login failed" }; }
  };

  const register = async ({ name,email,password,role="taker" })=>{
    try{ await api.post("/auth/register",{ name,email,password,role }); return { success:true }; }
    catch(e){ return { success:false, message: e.response?.data?.message || "Registration failed" }; }
  };

  const logout = ()=>{ localStorage.removeItem("token"); setToken(null); setUser(null); };

  return <AuthContext.Provider value={{ token,user,loading,login,register,logout }}>{children}</AuthContext.Provider>;
};
