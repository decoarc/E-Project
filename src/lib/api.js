/** Base URL da API. Definir `REACT_APP_API_URL` em `.env.development.local`. */
export function getApiBase() {
  const base = process.env.REACT_APP_API_URL || "http://localhost:3001";
  return base.replace(/\/$/, "");
}

export async function fetchSet(setId) {
  const res = await fetch(`${getApiBase()}/api/sets/${encodeURIComponent(setId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.error || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res.json();
}
