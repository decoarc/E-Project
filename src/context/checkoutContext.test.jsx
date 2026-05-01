import { renderHook, act } from "@testing-library/react";
import { CheckoutProvider, useCheckout } from "./checkoutContext";

const wrapper = ({ children }) => <CheckoutProvider>{children}</CheckoutProvider>;

test("initial state is empty", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  expect(result.current.shippingData).toBeNull();
  expect(result.current.paymentSubmitted).toBe(false);
  expect(result.current.orderNumber).toBeNull();
});

test("setShipping stores data", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  const data = { fullName: "Jane Doe", email: "jane@test.com" };
  act(() => result.current.setShipping(data));
  expect(result.current.shippingData).toEqual(data);
});

test("submitPayment sets flag and generates order number", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  act(() => result.current.submitPayment());
  expect(result.current.paymentSubmitted).toBe(true);
  expect(result.current.orderNumber).toMatch(/^ORD-[0-9A-F]+$/);
});

test("resetCheckout clears all state", () => {
  const { result } = renderHook(() => useCheckout(), { wrapper });
  act(() => result.current.setShipping({ fullName: "Test" }));
  act(() => result.current.submitPayment());
  act(() => result.current.resetCheckout());
  expect(result.current.shippingData).toBeNull();
  expect(result.current.paymentSubmitted).toBe(false);
  expect(result.current.orderNumber).toBeNull();
});
