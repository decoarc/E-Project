import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchLatestSet } from "../lib/api";
import {
  ensureSessionStart,
  getRemainingMs,
  isBlockedNewArrivalProduct,
  isNewArrivalProduct,
  isSessionExpired,
  setNewArrivalProductIds,
} from "../lib/newArrivalsGate";

const NewArrivalsContext = createContext(null);

export function NewArrivalsProvider({ children }) {
  const [tick, setTick] = useState(0);
  const [dropMeta, setDropMeta] = useState({
    setName: null,
    productLabels: [],
  });

  useEffect(() => {
    ensureSessionStart();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchLatestSet();
        const ids = (data?.products ?? []).map((p) => p.id).filter(Boolean);
        const labels = (data?.products ?? [])
          .map((p) => p.label)
          .filter((x) => typeof x === "string" && x.trim());
        const setName =
          typeof data?.name === "string" && data.name.trim()
            ? data.name.trim()
            : null;
        if (!cancelled) {
          setNewArrivalProductIds(ids);
          setDropMeta({ setName, productLabels: labels });
        }
      } catch {
        if (!cancelled) {
          setNewArrivalProductIds([]);
          setDropMeta({ setName: null, productLabels: [] });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const expired = useMemo(() => {
    void tick;
    return isSessionExpired();
  }, [tick]);
  const remainingMs = useMemo(() => {
    void tick;
    return getRemainingMs();
  }, [tick]);

  const dropHeadline = useMemo(() => {
    if (dropMeta.setName) return dropMeta.setName;
    if (dropMeta.productLabels.length > 0) {
      return dropMeta.productLabels.join(" · ");
    }
    return null;
  }, [dropMeta]);

  const value = useMemo(
    () => ({
      expired,
      remainingMs,
      dropHeadline,
      isBlocked: isBlockedNewArrivalProduct,
      isNewArrivalProduct,
    }),
    [expired, remainingMs, dropHeadline]
  );

  return (
    <NewArrivalsContext.Provider value={value}>
      {children}
    </NewArrivalsContext.Provider>
  );
}

export function useNewArrivals() {
  const ctx = useContext(NewArrivalsContext);
  if (!ctx) {
    throw new Error("useNewArrivals must be used within NewArrivalsProvider");
  }
  return ctx;
}
