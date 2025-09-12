const BASE =
  process.env.REACT_APP_API_BASE ||
  "https://motorcycle-service-booking-backend-5.onrender.com"; 

export function apiUrl(path = "") {
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
