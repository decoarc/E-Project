import { validate } from "./shipping";

const valid = {
  fullName: "Jane Doe",
  email: "jane@test.com",
  phone: "555-0100",
  street: "123 Main St",
  city: "Springfield",
  zip: "12345",
  country: "US",
  sameAsBilling: true,
  billingStreet: "",
  billingCity: "",
  billingZip: "",
  billingCountry: "",
  deliveryNotes: "",
};

test("returns no errors for valid data", () => {
  expect(validate(valid)).toEqual({});
});

test("requires fullName", () => {
  expect(validate({ ...valid, fullName: "" })).toHaveProperty("fullName");
});

test("requires email", () => {
  expect(validate({ ...valid, email: "" })).toHaveProperty("email");
});

test("rejects malformed email", () => {
  expect(validate({ ...valid, email: "notanemail" })).toHaveProperty("email");
});

test("requires all address fields", () => {
  expect(validate({ ...valid, street: "" })).toHaveProperty("street");
  expect(validate({ ...valid, city: "" })).toHaveProperty("city");
  expect(validate({ ...valid, zip: "" })).toHaveProperty("zip");
  expect(validate({ ...valid, country: "" })).toHaveProperty("country");
});

test("requires billing fields when sameAsBilling is false", () => {
  const errors = validate({
    ...valid,
    sameAsBilling: false,
    billingStreet: "",
    billingCity: "",
    billingZip: "",
    billingCountry: "",
  });
  expect(errors).toHaveProperty("billingStreet");
  expect(errors).toHaveProperty("billingCity");
  expect(errors).toHaveProperty("billingZip");
  expect(errors).toHaveProperty("billingCountry");
});

test("no billing errors when sameAsBilling is true", () => {
  const errors = validate({ ...valid, sameAsBilling: true });
  expect(errors).not.toHaveProperty("billingStreet");
});
