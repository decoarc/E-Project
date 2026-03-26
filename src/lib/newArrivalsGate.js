/** Session window for purchasing “latest drop” products (new arrivals). */

const SESSION_KEY = "e-project.newArrivals.sessionStart";
export const NEW_ARRIVALS_WINDOW_MS = 10 * 60 * 1000;

/** @type {Set<string> | null} */
let cachedLatestProductIds = null;

export function ensureSessionStart() {
  if (typeof window === "undefined") return Date.now();
  let raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    raw = String(Date.now());
    sessionStorage.setItem(SESSION_KEY, raw);
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : Date.now();
}

export function setNewArrivalProductIds(ids) {
  cachedLatestProductIds = new Set(Array.isArray(ids) ? ids.filter(Boolean) : []);
}

export function isNewArrivalProduct(productId) {
  if (!productId || !cachedLatestProductIds) return false;
  return cachedLatestProductIds.has(productId);
}

export function isSessionExpired() {
  return Date.now() - ensureSessionStart() >= NEW_ARRIVALS_WINDOW_MS;
}

export function getRemainingMs() {
  const elapsed = Date.now() - ensureSessionStart();
  return Math.max(0, NEW_ARRIVALS_WINDOW_MS - elapsed);
}

export function isBlockedNewArrivalProduct(productId) {
  return isSessionExpired() && isNewArrivalProduct(productId);
}
