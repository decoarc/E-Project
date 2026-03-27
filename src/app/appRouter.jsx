import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "./rootLayout";
import Home from "../pages/home/home";
import Category from "../pages/category/category";
import Product from "../pages/product/product";
import Cart from "../pages/cart/cart";
import Stories from "../pages/stories/stories";
import NotFound from "../pages/notFound";

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
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
