import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/checkoutContext";
import FormField from "../../components/checkout/formField";
import "./shipping.css";

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "BR", name: "Brazil" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
];

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  zip: "",
  country: "",
  sameAsBilling: true,
  billingStreet: "",
  billingCity: "",
  billingZip: "",
  billingCountry: "",
  deliveryNotes: "",
};

export function validate(values) {
  const errors = {};
  if (!values.fullName.trim()) errors.fullName = "required";
  if (!values.email.trim()) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
    errors.email = "invalidEmail";
  if (!values.phone.trim()) errors.phone = "required";
  if (!values.street.trim()) errors.street = "required";
  if (!values.city.trim()) errors.city = "required";
  if (!values.zip.trim()) errors.zip = "required";
  if (!values.country.trim()) errors.country = "required";
  if (!values.sameAsBilling) {
    if (!values.billingStreet.trim()) errors.billingStreet = "required";
    if (!values.billingCity.trim()) errors.billingCity = "required";
    if (!values.billingZip.trim()) errors.billingZip = "required";
    if (!values.billingCountry.trim()) errors.billingCountry = "required";
  }
  return errors;
}

export default function Shipping() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { shippingData, setShipping } = useCheckout();
  const [values, setValues] = useState(shippingData ?? EMPTY);
  const [errors, setErrors] = useState({});

  function set(field, val) {
    setValues((prev) => ({ ...prev, [field]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setShipping(values);
    navigate("/checkout/payment");
  }

  function errorMsg(key) {
    if (!errors[key]) return undefined;
    return t(`shipping.errors.${errors[key]}`);
  }

  return (
    <section className="checkoutSection">
      <h1 className="checkoutSectionTitle">{t("shipping.title")}</h1>
      <form className="shippingForm" onSubmit={handleSubmit} noValidate>
        <div className="shippingGrid">
          <FormField id="fullName" label={t("shipping.fullName")} error={errorMsg("fullName")} className="shippingFullRow">
            <input
              id="fullName"
              type="text"
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              autoComplete="name"
            />
          </FormField>

          <FormField id="email" label={t("shipping.email")} error={errorMsg("email")}>
            <input
              id="email"
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
            />
          </FormField>

          <FormField id="phone" label={t("shipping.phone")} error={errorMsg("phone")}>
            <input
              id="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              autoComplete="tel"
            />
          </FormField>

          <FormField id="street" label={t("shipping.street")} error={errorMsg("street")} className="shippingFullRow">
            <input
              id="street"
              type="text"
              value={values.street}
              onChange={(e) => set("street", e.target.value)}
              autoComplete="street-address"
            />
          </FormField>

          <FormField id="city" label={t("shipping.city")} error={errorMsg("city")}>
            <input
              id="city"
              type="text"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              autoComplete="address-level2"
            />
          </FormField>

          <FormField id="zip" label={t("shipping.zip")} error={errorMsg("zip")}>
            <input
              id="zip"
              type="text"
              value={values.zip}
              onChange={(e) => set("zip", e.target.value)}
              autoComplete="postal-code"
            />
          </FormField>

          <FormField id="country" label={t("shipping.country")} error={errorMsg("country")}>
            <select
              id="country"
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
              autoComplete="country"
            >
              <option value="" />
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="deliveryNotes" label={t("shipping.deliveryNotes")} className="shippingFullRow">
            <textarea
              id="deliveryNotes"
              value={values.deliveryNotes}
              onChange={(e) => set("deliveryNotes", e.target.value)}
            />
          </FormField>
        </div>

        <label className="shippingBillingToggle">
          <input
            type="checkbox"
            checked={!values.sameAsBilling}
            onChange={(e) => set("sameAsBilling", !e.target.checked)}
          />
          {t("shipping.differentBilling")}
        </label>

        {!values.sameAsBilling && (
          <div className="shippingBillingBlock">
            <h2 className="shippingBillingTitle">{t("shipping.billingTitle")}</h2>
            <div className="shippingGrid">
              <FormField id="billingStreet" label={t("shipping.street")} error={errorMsg("billingStreet")} className="shippingFullRow">
                <input
                  id="billingStreet"
                  type="text"
                  value={values.billingStreet}
                  onChange={(e) => set("billingStreet", e.target.value)}
                  autoComplete="billing street-address"
                />
              </FormField>

              <FormField id="billingCity" label={t("shipping.city")} error={errorMsg("billingCity")}>
                <input
                  id="billingCity"
                  type="text"
                  value={values.billingCity}
                  onChange={(e) => set("billingCity", e.target.value)}
                />
              </FormField>

              <FormField id="billingZip" label={t("shipping.zip")} error={errorMsg("billingZip")}>
                <input
                  id="billingZip"
                  type="text"
                  value={values.billingZip}
                  onChange={(e) => set("billingZip", e.target.value)}
                />
              </FormField>

              <FormField id="billingCountry" label={t("shipping.country")} error={errorMsg("billingCountry")}>
                <select
                  id="billingCountry"
                  value={values.billingCountry}
                  onChange={(e) => set("billingCountry", e.target.value)}
                >
                  <option value="" />
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </div>
        )}

        <footer className="checkoutSummary">
          <button type="submit" className="checkoutBtn">
            {t("shipping.proceed")}
          </button>
        </footer>
      </form>
    </section>
  );
}
