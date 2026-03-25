import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "e-project.cart";

const CartContext = createContext(null);

function normalizeLines(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (line) =>
      line &&
      typeof line.productId === "string" &&
      typeof line.label === "string" &&
      typeof line.priceUsd === "number" &&
      !Number.isNaN(line.priceUsd) &&
      typeof line.quantity === "number" &&
      Number.isFinite(line.quantity) &&
      line.quantity > 0
  );
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeLines(parsed);
  } catch {
    return [];
  }
}

function persist(lines) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() =>
    typeof window === "undefined" ? [] : loadFromStorage()
  );

  useEffect(() => {
    persist(items);
  }, [items]);

  const addItem = useCallback((payload) => {
    const {
      productId,
      label,
      priceUsd,
      quantity = 1,
      imageUrl,
    } = payload;
    if (!productId || typeof label !== "string" || priceUsd == null || Number.isNaN(priceUsd)) {
      return;
    }
    const q = Math.max(1, Math.floor(Number(quantity)) || 1);
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.productId === productId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: next[idx].quantity + q,
          label,
          priceUsd,
          ...(imageUrl ? { imageUrl } : {}),
        };
        return next;
      }
      return [
        ...prev,
        {
          productId,
          label,
          priceUsd,
          quantity: q,
          ...(imageUrl ? { imageUrl } : {}),
        },
      ];
    });
  }, []);

  const setLineQuantity = useCallback((productId, nextQty) => {
    const q = Math.floor(Number(nextQty));
    if (!productId || q < 1) {
      setItems((prev) => prev.filter((x) => x.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((line) =>
        line.productId === productId ? { ...line, quantity: q } : line
      )
    );
  }, []);

  const removeLine = useCallback((productId) => {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((acc, line) => acc + line.quantity, 0),
    [items]
  );

  const subtotalUsd = useMemo(
    () =>
      items.reduce((acc, line) => acc + line.priceUsd * line.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addItem,
      setLineQuantity,
      removeLine,
      clearCart,
      totalQuantity,
      subtotalUsd,
    }),
    [
      items,
      addItem,
      setLineQuantity,
      removeLine,
      clearCart,
      totalQuantity,
      subtotalUsd,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
