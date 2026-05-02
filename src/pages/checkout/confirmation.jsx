import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useCheckout } from "../../context/checkoutContext";
import { useCurrency } from "../../context/currencyContext";
import "./confirmation.css";

export default function Confirmation() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { items, subtotalUsd, clearCart } = useCart();
  const { orderNumber, shippingData, resetCheckout } = useCheckout();
  const { formatPriceUsd } = useCurrency();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(orderNumber).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleContinue() {
    clearCart();
    resetCheckout();
    navigate("/");
  }

  return (
    <section className="checkoutSection confirmationSection">
      <h1 className="confirmationTitle">{t("confirmation.title")}</h1>

      <div className="confirmationOrderBox">
        <span className="confirmationOrderLabel">{t("confirmation.orderNumber")}</span>
        <div className="confirmationOrderRow">
          <span className="confirmationOrderNumber">{orderNumber}</span>
          <button type="button" className="confirmationCopyBtn" onClick={handleCopy}>
            {copied ? t("confirmation.copied") : t("confirmation.copy")}
          </button>
        </div>
      </div>

      {shippingData && (
        <div className="confirmationBlock">
          <h2 className="confirmationBlockTitle">{t("confirmation.shippingTo")}</h2>
          <address className="confirmationAddress">
            <span>{shippingData.fullName}</span>
            <span>{shippingData.street}</span>
            <span>
              {shippingData.city}, {shippingData.zip}
            </span>
            <span>{shippingData.country}</span>
          </address>
        </div>
      )}

      <div className="confirmationBlock">
        <h2 className="confirmationBlockTitle">{t("confirmation.items")}</h2>
        <ul className="confirmationItemList" aria-label={t("confirmation.items")}>
          {items.map((line) => (
            <li key={line.productId} className="confirmationItem">
              <span className="confirmationItemLabel">
                {line.label} × {line.quantity}
              </span>
              <span className="confirmationItemPrice">
                {formatPriceUsd(line.priceUsd * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="confirmationTotal">
          <span>{t("confirmation.total")}</span>
          <span className="confirmationTotalAmount">{formatPriceUsd(subtotalUsd)}</span>
        </div>
      </div>

      <button type="button" className="checkoutBtn" onClick={handleContinue}>
        {t("confirmation.continueShopping")}
      </button>
    </section>
  );
}
