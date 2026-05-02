import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./rootLayout";
import Home from "../pages/home/home";
import Category from "../pages/category/category";
import Product from "../pages/product/product";
import Cart from "../pages/cart/cart";
import Stories from "../pages/stories/stories";
import NotFound from "../pages/notFound";
import CheckoutLayout from "../components/checkout/checkoutLayout";
import CheckoutGuard from "../components/checkout/checkoutGuard";
import CartReview from "../pages/checkout/cartReview";
import Shipping from "../pages/checkout/shipping";
import Payment from "../pages/checkout/payment";
import Confirmation from "../pages/checkout/confirmation";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/category/exclusive"
          element={<Navigate to="/category/legacy" replace />}
        />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/stories" element={<Stories />} />
        <Route element={<CheckoutLayout />}>
          <Route
            path="/checkout/cart"
            element={
              <CheckoutGuard step="cart">
                <CartReview />
              </CheckoutGuard>
            }
          />
          <Route
            path="/checkout/shipping"
            element={
              <CheckoutGuard step="shipping">
                <Shipping />
              </CheckoutGuard>
            }
          />
          <Route
            path="/checkout/payment"
            element={
              <CheckoutGuard step="payment">
                <Payment />
              </CheckoutGuard>
            }
          />
          <Route
            path="/checkout/confirmation"
            element={
              <CheckoutGuard step="confirmation">
                <Confirmation />
              </CheckoutGuard>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
