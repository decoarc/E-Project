import { Outlet } from "react-router-dom";
import CheckoutProgress from "./checkoutProgress";
import "./checkoutLayout.css";

export default function CheckoutLayout() {
  return (
    <div className="container checkoutLayoutWrap">
      <CheckoutProgress />
      <Outlet />
    </div>
  );
}
