import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "e-project.currency";

const FRANKFURTER_URL =
  "https://api.frankfurter.dev/v1/latest?base=USD&symbols=CAD,BRL";

const CurrencyContext = createContext(null);

function localeForCurrency(code) {
  if (code === "BRL") return "pt-BR";
  if (code === "CAD") return "en-CA";
  return "en-US";
}

function formatAmount(amount, currency) {
  return new Intl.NumberFormat(localeForCurrency(currency), {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "USD" || stored === "CAD" || stored === "BRL") {
        return stored;
      }
    } catch {
      /* ignore */
    }
    return "USD";
  });

  const [rates, setRates] = useState(null);
  const [ratesStatus, setRatesStatus] = useState("idle");

  useEffect(() => {
    let cancelled = false;
    setRatesStatus("loading");
    (async () => {
      try {
        const res = await fetch(FRANKFURTER_URL);
        if (!res.ok) throw new Error("Frankfurter request failed");
        const data = await res.json();
        if (cancelled) return;
        const next = data?.rates;
        if (
          next &&
          typeof next.CAD === "number" &&
          typeof next.BRL === "number"
        ) {
          setRates({ CAD: next.CAD, BRL: next.BRL });
          setRatesStatus("success");
        } else {
          throw new Error("Invalid rates payload");
        }
      } catch {
        if (!cancelled) {
          setRates(null);
          setRatesStatus("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((next) => {
    if (next !== "USD" && next !== "CAD" && next !== "BRL") return;
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const formatPriceUsd = useCallback(
    (amountUsd) => {
      if (amountUsd == null || Number.isNaN(amountUsd)) return "—";
      if (currency === "USD") {
        return formatAmount(amountUsd, "USD");
      }
      if (ratesStatus === "loading") {
        return "…";
      }
      const rate = rates?.[currency];
      if (ratesStatus === "error" || rate == null) {
        return formatAmount(amountUsd, "USD");
      }
      return formatAmount(amountUsd * rate, currency);
    },
    [currency, rates, ratesStatus],
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      rates,
      ratesStatus,
      formatPriceUsd,
    }),
    [currency, setCurrency, rates, ratesStatus, formatPriceUsd],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
