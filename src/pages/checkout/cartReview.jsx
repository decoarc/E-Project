import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useCurrency } from "../../context/currencyContext";
import "./cartReview.css";

export default function CartReview() {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const { items, subtotalUsd } = useCart();
  const { formatPriceUsd } = useCurrency();

  return (
    <section className="checkoutSection">
      <h1 className="checkoutSectionTitle">{t("cartReview.title")}</h1>
      <ul className="cartReviewList" aria-label={t("cartReview.listAria")}>
        {items.map((line) => (
          <li key={line.productId} className="cartReviewLine">
            {line.imageUrl ? (
              <img className="cartReviewImg" src={line.imageUrl} alt="" />
            ) : (
              <div className="cartReviewImgPlaceholder" aria-hidden="true" />
            )}
            <div className="cartReviewBody">
              <span className="cartReviewLabel">{line.label}</span>
              <span className="cartReviewQty">× {line.quantity}</span>
            </div>
            <span className="cartReviewPrice">
              {formatPriceUsd(line.priceUsd * line.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <footer className="checkoutSummary">
        <div className="checkoutSummaryRow">
          <span>{t("cartReview.subtotal")}</span>
          <span className="checkoutSummaryAmount">{formatPriceUsd(subtotalUsd)}</span>
        </div>
        <button
          type="button"
          className="checkoutBtn"
          onClick={() => navigate("/checkout/shipping")}
        >
          {t("cartReview.proceed")}
        </button>
      </footer>
    </section>
  );
}
