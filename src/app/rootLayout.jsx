import { Outlet } from "react-router-dom";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import { CartProvider } from "../context/cartContext";
import { CurrencyProvider } from "../context/currencyContext";
import { NewArrivalsProvider } from "../context/newArrivalsContext";
import { CheckoutProvider } from "../context/checkoutContext";
import DocumentLang from "../i18n/DocumentLang";

export default function RootLayout() {
  return (
    <CurrencyProvider>
      <NewArrivalsProvider>
        <CartProvider>
          <CheckoutProvider>
            <DocumentLang />
            <div className="page">
              <Header />
              <main id="main">
                <Outlet />
              </main>
              <Footer />
            </div>
          </CheckoutProvider>
        </CartProvider>
      </NewArrivalsProvider>
    </CurrencyProvider>
  );
}
