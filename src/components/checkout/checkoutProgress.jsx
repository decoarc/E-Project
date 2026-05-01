import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PATH_TO_INDEX = {
  "/checkout/cart": 0,
  "/checkout/shipping": 1,
  "/checkout/payment": 2,
  "/checkout/confirmation": 3,
};

export default function CheckoutProgress() {
  const { pathname } = useLocation();
  const { t } = useTranslation("checkout");
  const currentIndex = PATH_TO_INDEX[pathname] ?? 0;

  const steps = [
    t("progress.cart"),
    t("progress.shipping"),
    t("progress.payment"),
    t("progress.confirmation"),
  ];

  return (
    <nav className="checkoutProgress" aria-label="Checkout steps">
      <ol className="checkoutProgressList">
        {steps.map((label, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <li
              key={label}
              className={[
                "checkoutProgressStep",
                isDone ? "checkoutProgressStep--done" : "",
                isCurrent ? "checkoutProgressStep--current" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isCurrent ? "step" : undefined}
            >
              <span className="checkoutProgressDot" aria-hidden="true">
                {isDone ? "✓" : i + 1}
              </span>
              <span className="checkoutProgressLabel">{label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
