import { Routes, Route } from "react-router-dom";
import RootLayout from "./rootLayout";
import Home from "../pages/home/home";
import Category from "../pages/category/category";
import Product from "../pages/product/product";
import Stories from "../pages/stories/stories";
import NotFound from "../pages/notFound";

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
