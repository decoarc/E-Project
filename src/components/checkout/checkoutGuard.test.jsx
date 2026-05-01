import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CheckoutGuard from "./checkoutGuard";

jest.mock("../../context/cartContext", () => ({
  useCart: jest.fn(),
}));
jest.mock("../../context/checkoutContext", () => ({
  useCheckout: jest.fn(),
}));

const { useCart } = require("../../context/cartContext");
const { useCheckout } = require("../../context/checkoutContext");

function renderGuard(step, cartItems, shippingData, paymentSubmitted) {
  useCart.mockReturnValue({ items: cartItems });
  useCheckout.mockReturnValue({ shippingData, paymentSubmitted });
  return render(
    <MemoryRouter>
      <CheckoutGuard step={step}>
        <span>child</span>
      </CheckoutGuard>
    </MemoryRouter>
  );
}

test("cart step with empty cart renders Navigate (not children)", () => {
  renderGuard("cart", [], null, false);
  expect(screen.queryByText("child")).not.toBeInTheDocument();
});

test("cart step with items renders children", () => {
  renderGuard("cart", [{ productId: "1" }], null, false);
  expect(screen.getByText("child")).toBeInTheDocument();
});

test("shipping step with empty cart renders Navigate", () => {
  renderGuard("shipping", [], null, false);
  expect(screen.queryByText("child")).not.toBeInTheDocument();
});

test("payment step without shippingData renders Navigate", () => {
  renderGuard("payment", [{ productId: "1" }], null, false);
  expect(screen.queryByText("child")).not.toBeInTheDocument();
});

test("payment step with shippingData renders children", () => {
  renderGuard("payment", [{ productId: "1" }], { fullName: "Jane" }, false);
  expect(screen.getByText("child")).toBeInTheDocument();
});

test("confirmation step without paymentSubmitted renders Navigate", () => {
  renderGuard("confirmation", [{ productId: "1" }], { fullName: "Jane" }, false);
  expect(screen.queryByText("child")).not.toBeInTheDocument();
});

test("confirmation step with paymentSubmitted renders children", () => {
  renderGuard("confirmation", [{ productId: "1" }], { fullName: "Jane" }, true);
  expect(screen.getByText("child")).toBeInTheDocument();
});

test("cart step with paymentSubmitted redirects (not children)", () => {
  renderGuard("cart", [{ productId: "1" }], { fullName: "Jane" }, true);
  expect(screen.queryByText("child")).not.toBeInTheDocument();
});

test("shipping step with paymentSubmitted redirects (not children)", () => {
  renderGuard("shipping", [{ productId: "1" }], { fullName: "Jane" }, true);
  expect(screen.queryByText("child")).not.toBeInTheDocument();
});
