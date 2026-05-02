import { validatePayment } from "./payment";

const valid = {
  cardholderName: "Jane Doe",
  cardNumber: "4111 1111 1111 1111",
  expiry: "12/27",
  cvv: "123",
};

test("returns no errors for valid data", () => {
  expect(validatePayment(valid)).toEqual({});
});

test("requires cardholderName", () => {
  expect(validatePayment({ ...valid, cardholderName: "" })).toHaveProperty("cardholderName");
});

test("rejects card number shorter than 16 digits", () => {
  expect(validatePayment({ ...valid, cardNumber: "1234 5678" })).toHaveProperty("cardNumber");
});

test("accepts 16-digit card number with spaces", () => {
  expect(validatePayment({ ...valid, cardNumber: "4111 1111 1111 1111" })).not.toHaveProperty("cardNumber");
});

test("rejects non-MM/YY expiry format", () => {
  expect(validatePayment({ ...valid, expiry: "1227" })).toHaveProperty("expiry");
  expect(validatePayment({ ...valid, expiry: "12/2027" })).toHaveProperty("expiry");
});

test("accepts valid MM/YY expiry", () => {
  expect(validatePayment({ ...valid, expiry: "01/29" })).not.toHaveProperty("expiry");
});

test("rejects CVV shorter than 3 digits", () => {
  expect(validatePayment({ ...valid, cvv: "12" })).toHaveProperty("cvv");
});

test("accepts 4-digit CVV", () => {
  expect(validatePayment({ ...valid, cvv: "1234" })).not.toHaveProperty("cvv");
});
