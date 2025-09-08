const BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

export function apiUrl(path = "") {
  if (!path) return BASE;
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/api") ? `${BASE}${p}` : `${BASE}/api${p}`;
}

export async function postJson(path, body, extra = {}) {
  const res = await fetch(apiUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(extra.headers || {}) },
    credentials: extra.credentials || "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json().catch(() => ({}));
}


export async function getJson(path, extra = {}) {
  const res = await fetch(apiUrl(path), {
    method: "GET",
    headers: { "Content-Type": "application/json", ...(extra.headers || {}) },
    credentials: extra.credentials || "include",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json().catch(() => ({}));
}
