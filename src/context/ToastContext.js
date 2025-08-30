import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const push = useCallback((opts) => {
    const id = idRef.current++;
    const t = { id, type: opts.type || "info", message: String(opts.message || ""), ttl: opts.ttl || 3000 };
    setToasts((arr) => [...arr, t]);
    // auto-dismiss
    setTimeout(() => {
      setToasts((arr) => arr.filter((x) => x.id !== id));
    }, t.ttl);
  }, []);

  const remove = useCallback((id) => {
    setToasts((arr) => arr.filter((x) => x.id !== id));
  }, []);

  // lightweight CSS injection once
  useEffect(() => {
    if (document.getElementById("toast-styles")) return;
    const s = document.createElement("style");
    s.id = "toast-styles";
    s.innerHTML = `
      .toast-wrap {
        position: fixed; right: 16px; bottom: 16px; z-index: 9999;
        display: flex; flex-direction: column; gap: 10px;
      }
      .toast {
        min-width: 260px; max-width: 380px;
        color: #0f172a; background: #fff; border-radius: 10px;
        padding: 10px 12px; box-shadow: 0 10px 24px rgba(0,0,0,.15);
        border: 1px solid #eee; display: grid; grid-template-columns: 22px 1fr auto; gap: 10px; align-items: center;
      }
      .toast .icon { font-size: 16px; line-height: 1; }
      .toast.success { border-color: #bbf7d0; background: #f0fdf4; }
      .toast.error   { border-color: #fecaca; background: #fef2f2; }
      .toast.info    { border-color: #bfdbfe; background: #eff6ff; }
      .toast .close {
        background: transparent; border: none; cursor: pointer; color: #334155;
        padding: 4px; border-radius: 6px;
      }
      .toast .close:hover { background: rgba(0,0,0,.06); }
    `;
    document.head.appendChild(s);
  }, []);

  const icons = { success: "✅", error: "❌", info: "ℹ️" };

  return (
    <ToastContext.Provider value={{
      success: (m, ttl) => push({ type: "success", message: m, ttl }),
      error:   (m, ttl) => push({ type: "error",   message: m, ttl }),
      info:    (m, ttl) => push({ type: "info",    message: m, ttl }),
    }}>
      {children}
      <div className="toast-wrap" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`} role="status">
            <span className="icon">{icons[t.type] || "•"}</span>
            <div style={{ fontSize: 14 }}>{t.message}</div>
            <button className="close" aria-label="Close" onClick={() => remove(t.id)}>✖</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
