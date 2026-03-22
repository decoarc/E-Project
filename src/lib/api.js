/** Base URL da API. Definir `REACT_APP_API_URL` em `.env.development.local`. */
export function getApiBase() {
  const base = process.env.REACT_APP_API_URL || "http://localhost:3001";
  return base.replace(/\/$/, "");
}

function errorFromResponse(res, body) {
  const message = body?.error || `Request failed (${res.status})`;
  const error = new Error(message);
  error.status = res.status;
  return error;
}

export async function fetchSet(setId) {
  const res = await fetch(`${getApiBase()}/api/sets/${encodeURIComponent(setId)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw errorFromResponse(res, err);
  }
  return res.json();
}

/**
 * Último set publicado: `GET /api/sets/latest` (mesmo corpo que `GET /api/sets/:id`),
 * ou `{ id }` / `{ setId }` para hidratar com `fetchSet`.
 * Se `latest` não existir (404), tenta `GET /api/sets` e usa o último item (ids ou objetos com `id`).
 */
export async function fetchLatestSet() {
  const base = getApiBase();

  const resolvePayload = async (data) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    if (Array.isArray(data.products)) return data;
    const sid = data.id ?? data.setId;
    if (sid) return fetchSet(sid);
    return null;
  };

  const fetchListFallback = async () => {
    const res = await fetch(`${base}/api/sets`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw errorFromResponse(res, err);
    }
    const listJson = await res.json();
    const items = Array.isArray(listJson)
      ? listJson
      : listJson?.sets ?? listJson?.items ?? [];
    if (items.length === 0) {
      const e = new Error("No sets available");
      e.status = 404;
      throw e;
    }
    const last = items[items.length - 1];
    if (typeof last === "string") return fetchSet(last);
    if (last && typeof last === "object") {
      if (Array.isArray(last.products)) return last;
      const sid = last.id ?? last.setId;
      if (sid) return fetchSet(sid);
    }
    const e = new Error("Could not resolve latest set");
    e.status = 404;
    throw e;
  };

  const res = await fetch(`${base}/api/sets/latest`);
  if (res.ok) {
    const data = await res.json();
    const resolved = await resolvePayload(data);
    if (resolved) return resolved;
  } else if (res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw errorFromResponse(res, err);
  }

  return fetchListFallback();
}
