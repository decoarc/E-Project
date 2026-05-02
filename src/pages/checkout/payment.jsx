import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCheckout } from "../../context/checkoutContext";
import FormField from "../../components/checkout/formField";
import "./payment.css";

export function validatePayment(values) {
  const errors = {};
  if (!values.cardholderName.trim()) errors.cardholderName = "required";
  const digits = values.cardNumber.replace(/\s/g, "");
  if (!digits) errors.cardNumber = "required";
  else if (!/^\d{16}$/.test(digits)) errors.cardNumber = "cardNumber";
  if (!values.expiry.trim()) errors.expiry = "required";
  else if (!/^\d{2}\/\d{2}$/.test(values.expiry)) errors.expiry = "expiry";
  if (!values.cvv.trim()) errors.cvv = "required";
  else if (!/^\d{3}$/.test(values.cvv)) errors.cvv = "cvv";
  return errors;
}

function formatCardNumber(raw) {
  return raw.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length <= 2 ? digits : digits.slice(0, 2) + "/" + digits.slice(2);
}

const EMPTY = { cardholderName: "", cardNumber: "", expiry: "", cvv: "" };

export default function Payment() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { submitPayment } = useCheckout();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  function set(field, val) {
    setValues((prev) => ({ ...prev, [field]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validatePayment(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    submitPayment();
    navigate("/checkout/confirmation");
  }

  function errorMsg(key) {
    if (!errors[key]) return undefined;
    return t(`payment.errors.${errors[key]}`);
  }

  return (
    <section className="checkoutSection">
      <h1 className="checkoutSectionTitle">{t("payment.title")}</h1>
      <p className="paymentMockNote">{t("payment.mockNote")}</p>
      <form className="paymentForm" onSubmit={handleSubmit} noValidate>
        <div className="paymentGrid">
          <FormField
            id="cardholderName"
            label={t("payment.cardholderName")}
            error={errorMsg("cardholderName")}
            className="paymentFullRow"
          >
            <input
              id="cardholderName"
              type="text"
              value={values.cardholderName}
              onChange={(e) => set("cardholderName", e.target.value)}
              autoComplete="cc-name"
            />
          </FormField>

          <FormField
            id="cardNumber"
            label={t("payment.cardNumber")}
            error={errorMsg("cardNumber")}
            className="paymentFullRow"
          >
            <input
              id="cardNumber"
              type="text"
              inputMode="numeric"
              value={values.cardNumber}
              onChange={(e) => set("cardNumber", formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              autoComplete="cc-number"
              maxLength={19}
            />
          </FormField>

          <FormField id="expiry" label={t("payment.expiry")} error={errorMsg("expiry")}>
            <input
              id="expiry"
              type="text"
              inputMode="numeric"
              value={values.expiry}
              onChange={(e) => set("expiry", formatExpiry(e.target.value))}
              placeholder="MM/YY"
              autoComplete="cc-exp"
              maxLength={5}
            />
          </FormField>

          <FormField id="cvv" label={t("payment.cvv")} error={errorMsg("cvv")}>
            <input
              id="cvv"
              type="text"
              inputMode="numeric"
              value={values.cvv}
              onChange={(e) => set("cvv", e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="123"
              autoComplete="cc-csc"
              maxLength={3}
            />
          </FormField>
        </div>

        <footer className="checkoutSummary">
          <button type="submit" className="checkoutBtn">
            {t("payment.proceed")}
          </button>
        </footer>
      </form>
    </section>
  );
}
