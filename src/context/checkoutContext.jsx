import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const CheckoutContext = createContext(null);

function generateOrderNumber() {
  return "ORD-" + Math.random().toString(16).slice(2, 8).toUpperCase();
}

export function CheckoutProvider({ children }) {
  const [shippingData, setShippingData] = useState(null);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);

  const setShipping = useCallback((data) => {
    setShippingData(data);
  }, []);

  const submitPayment = useCallback(() => {
    setOrderNumber(generateOrderNumber());
    setPaymentSubmitted(true);
  }, []);

  const resetCheckout = useCallback(() => {
    setShippingData(null);
    setPaymentSubmitted(false);
    setOrderNumber(null);
  }, []);

  const value = useMemo(
    () => ({
      shippingData,
      paymentSubmitted,
      orderNumber,
      setShipping,
      submitPayment,
      resetCheckout,
    }),
    [shippingData, paymentSubmitted, orderNumber, setShipping, submitPayment, resetCheckout]
  );

  return (
    <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error("useCheckout must be used within CheckoutProvider");
  return ctx;
}
