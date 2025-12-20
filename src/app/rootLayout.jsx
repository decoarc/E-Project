import { Outlet } from "react-router-dom";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

export default function RootLayout() {
  return (
    <div className="page">
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
