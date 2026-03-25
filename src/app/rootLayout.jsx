import { Outlet } from "react-router-dom";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import { CartProvider } from "../context/cartContext";
import { CurrencyProvider } from "../context/currencyContext";
import DocumentLang from "../i18n/DocumentLang";

export default function RootLayout() {
  return (
    <CurrencyProvider>
      <CartProvider>
        <DocumentLang />
        <div className="page">
          <Header />
          <main id="main">
            <Outlet />
          </main>
          <Footer />
        </div>
      </CartProvider>
    </CurrencyProvider>
  );
}
