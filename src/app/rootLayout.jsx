import { Outlet } from "react-router-dom";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import { CurrencyProvider } from "../context/currencyContext";

export default function RootLayout() {
  return (
    <CurrencyProvider>
      <div className="page">
        <Header />
        <main id="main">
          <Outlet />
        </main>
        <Footer />
      </div>
    </CurrencyProvider>
  );
}
