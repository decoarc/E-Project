import { Navigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useCheckout } from "../../context/checkoutContext";

export default function CheckoutGuard({ step, children }) {
  const { items } = useCart();
  const { shippingData, paymentSubmitted } = useCheckout();

  if (step !== "confirmation" && paymentSubmitted) {
    return <Navigate to="/checkout/confirmation" replace />;
  }
  if ((step === "cart" || step === "shipping") && items.length === 0) {
    return <Navigate to="/" replace />;
  }
  if (step === "payment" && !shippingData) {
    return <Navigate to="/checkout/shipping" replace />;
  }
  if (step === "confirmation" && !paymentSubmitted) {
    return <Navigate to="/checkout/payment" replace />;
  }
  return children;
}
