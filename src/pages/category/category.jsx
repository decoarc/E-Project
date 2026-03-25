import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../../context/cartContext";
import { CATEGORY_SET_ROUTES } from "../../data/categoryRoutes";
import { fetchLatestSet, fetchSet } from "../../lib/api";
import { useCurrency } from "../../context/currencyContext";
import "./category.css";

function CategorySetView({ setId, slug, priceMap = {}, useLatest = false }) {
  const { t } = useTranslation("category");
  const { formatPriceUsd } = useCurrency();
  const { addItem } = useCart();
  const kicker = t(`routes.${slug}.kicker`);
  const title = t(`routes.${slug}.title`);
  const intro = t(`routes.${slug}.intro`);

  const headingId = useLatest ? `set-${slug}-heading` : `set-${setId}-heading`;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = useLatest ? await fetchLatestSet() : await fetchSet(setId);
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          const status = typeof e?.status === "number" ? e.status : undefined;
          const msg =
            e instanceof Error ? e.message : t("loadError");
          const missingSet =
            status === 404 || /not found/i.test(msg);
          if (missingSet) {
            setData({ name: null, products: [] });
            setError(null);
          } else {
            setError(msg);
            setData(null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally omit `t`: refetch only when `setId` changes, not when locale changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, [setId, useLatest]);

  return (
    <div className="categoryPage">
      <header className="categoryPageHeader">
        <span className="categoryPageKicker">{kicker}</span>
        <h1 className="categoryPageTitle">{title}</h1>
        <p className="categoryPageIntro">{intro}</p>
      </header>

      <section className="categorySet" aria-labelledby={headingId}>
        <div className="categorySetHead">
          <h2 id={headingId} className="categorySetTitle">
            {loading ? t("loading") : (data?.name ?? t("setFallback"))}
          </h2>
          {!loading && data?.products?.length > 0 && (
            <p className="categorySetSub">
              {t("piecesLine", { count: data.products.length })}
            </p>
          )}
        </div>

        {error && (
          <p className="categoryPageError" role="alert">
            {error}. {t("apiHintBefore")}{" "}
            <code className="categoryPageCode">REACT_APP_API_URL</code>{" "}
            {t("apiHintAfter")}
          </p>
        )}

        {loading && (
          <div className="categoryGrid categoryGridSkeleton" aria-hidden="true">
            <div className="categoryCardSkeleton" />
            <div className="categoryCardSkeleton" />
          </div>
        )}

        {!loading &&
          !error &&
          (!data?.products || data.products.length === 0) && (
            <ul
              className="categoryGrid categoryGridComingSoon"
              aria-label={t("emptyCategoryAria")}
            >
              <li>
                <article className="categoryCard categoryCardEmpty">
                  <div className="categoryCardEmptyCanvas">
                    <div className="categoryCardEmptyFill" aria-hidden="true" />
                    <h3 className="categoryCardComingSoonDiagonal">
                      {t("comingSoon")}
                    </h3>
                  </div>
                </article>
              </li>
            </ul>
          )}

        {!loading && !error && data?.products?.length > 0 && (
          <ul className="categoryGrid">
            {data.products.map((product) => {
              const priceUsd = priceMap[product.id];
              const priceLabel =
                priceUsd != null ? formatPriceUsd(priceUsd) : "—";
              const href = `/product/${encodeURIComponent(product.id)}`;
              return (
                <li key={product.id}>
                  <article className="categoryCard">
                    <Link className="categoryCardMedia" to={href}>
                      {product.imageUrls?.front ? (
                        product.imageUrls?.side ? (
                          <div className="categoryCardMediaInner">
                            <img
                              src={product.imageUrls.front}
                              alt=""
                              className="categoryCardImg categoryCardImgFront"
                              loading="lazy"
                            />
                            <img
                              src={product.imageUrls.side}
                              alt=""
                              className="categoryCardImg categoryCardImgSide"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <img
                            src={product.imageUrls.front}
                            alt=""
                            className="categoryCardImg categoryCardImgSingle"
                            loading="lazy"
                          />
                        )
                      ) : (
                        <div className="categoryCardPlaceholder" />
                      )}
                    </Link>
                    <div className="categoryCardBody">
                      <h3 className="categoryCardTitle">
                        <Link to={href}>{product.label}</Link>
                      </h3>
                      <p className="categoryCardPrice">{priceLabel}</p>
                      <div className="categoryCardActions">
                        <Link className="categoryCardCta" to={href}>
                          {t("viewDetails")}
                        </Link>
                        {priceUsd != null && (
                          <button
                            type="button"
                            className="categoryCardAddBtn"
                            onClick={() =>
                              addItem({
                                productId: product.id,
                                label: product.label,
                                priceUsd,
                                imageUrl: product.imageUrls?.front,
                              })
                            }
                          >
                            {t("addToCart")}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function GenericCategory({ slug }) {
  const { t } = useTranslation("category");
  return (
    <div className="categoryPage">
      <header className="categoryPageHeader">
        <h1 className="categoryPageTitle">{t("genericTitle")}</h1>
        <p className="categoryPageIntro">{slug}</p>
      </header>
    </div>
  );
}

export default function Category() {
  const { slug } = useParams();
  const setConfig = CATEGORY_SET_ROUTES[slug];

  if (setConfig) {
    return (
      <div className="container categoryPageWrap">
        <CategorySetView
          setId={setConfig.setId}
          slug={slug}
          priceMap={setConfig.priceMap}
          useLatest={setConfig.useLatest === true}
        />
      </div>
    );
  }

  return (
    <div className="container categoryPageWrap">
      <GenericCategory slug={slug} />
    </div>
  );
}
