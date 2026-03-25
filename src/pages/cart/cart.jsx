import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { useCurrency } from "../../context/currencyContext";
import "./cart.css";

export default function Cart() {
  const { t } = useTranslation("cart");
  const { items, setLineQuantity, removeLine, subtotalUsd, totalQuantity } =
    useCart();
  const { formatPriceUsd } = useCurrency();

  return (
    <div className="container cartPageWrap">
      <header className="cartHeader">
        <h1 className="cartTitle">{t("title")}</h1>
        {!items.length ? null : (
          <p className="cartSub">
            {t("lineCount", { count: totalQuantity })}
          </p>
        )}
      </header>

      {items.length === 0 ? (
        <div className="cartEmpty">
          <p className="cartEmptyText">{t("empty")}</p>
          <Link className="cartEmptyCta" to="/category/type-2">
            {t("continueShopping")}
          </Link>
        </div>
      ) : (
        <>
          <ul className="cartList" aria-label={t("listAria")}>
            {items.map((line) => {
              const lineTotal = line.priceUsd * line.quantity;
              return (
                <li key={line.productId}>
                  <article className="cartLine">
                    <Link
                      className="cartLineMedia"
                      to={`/product/${encodeURIComponent(line.productId)}`}
                    >
                      {line.imageUrl ? (
                        <img
                          className="cartLineImg"
                          src={line.imageUrl}
                          alt=""
                        />
                      ) : (
                        <div className="cartLinePlaceholder" aria-hidden="true" />
                      )}
                    </Link>
                    <div className="cartLineBody">
                      <h2 className="cartLineTitle">
                        <Link to={`/product/${encodeURIComponent(line.productId)}`}>
                          {line.label}
                        </Link>
                      </h2>
                      <p className="cartLineUnit">
                        {formatPriceUsd(line.priceUsd)}{" "}
                        <span className="cartLineEach">{t("each")}</span>
                      </p>
                      <div className="cartLineControls">
                        <label className="cartQtyLabel">
                          <span className="cartQtyLabelText">{t("quantity")}</span>
                          <input
                            className="cartQtyInput"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={line.quantity}
                            onChange={(e) => {
                              const v = parseInt(e.target.value, 10);
                              setLineQuantity(line.productId, Number.isNaN(v) ? 1 : v);
                            }}
                            aria-label={t("quantityFor", { name: line.label })}
                          />
                        </label>
                        <button
                          type="button"
                          className="cartRemoveBtn"
                          onClick={() => removeLine(line.productId)}
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                    <div className="cartLineTotal">
                      {formatPriceUsd(lineTotal)}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <footer className="cartSummary">
            <div className="cartSummaryRow">
              <span>{t("subtotal")}</span>
              <span className="cartSummaryAmount">
                {formatPriceUsd(subtotalUsd)}
              </span>
            </div>
            <p className="cartSummaryNote">{t("checkoutNote")}</p>
            <Link className="cartContinueLink" to="/category/type-2">
              {t("continueShopping")}
            </Link>
          </footer>
        </>
      )}
    </div>
  );
}
