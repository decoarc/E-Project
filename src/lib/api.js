/** Base URL da API. Definir `REACT_APP_API_URL` em `.env.development.local`. */
export function getApiBase() {
  const base = process.env.REACT_APP_API_URL || "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export async function fetchSet(setId) {
  const res = await fetch(`${getApiBase()}/api/sets/${encodeURIComponent(setId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}
