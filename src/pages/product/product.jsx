import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { fetchSet } from "../../lib/api";
import { useCurrency } from "../../context/currencyContext";
import "./product.css";

const SET_ID = "a1";
const CATEGORY_HREF = "/category/type-2";

const TYPE2_A1_PRICES_USD = {
  a1_bottom: 89,
  a1_up: 79,
};

/** Ordered list: front first (primary), then side when present. */
function imageViewsFromUrls(imageUrls, t) {
  if (!imageUrls) return [];
  const out = [];
  if (imageUrls.front) {
    out.push({
      key: "front",
      src: imageUrls.front,
      label: t("views.front"),
    });
  }
  if (imageUrls.side) {
    out.push({
      key: "side",
      src: imageUrls.side,
      label: t("views.side"),
    });
  }
  return out;
}

export default function Product() {
  const { t } = useTranslation("product");
  const { formatPriceUsd } = useCurrency();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setData, setSetData] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const json = await fetchSet(SET_ID);
        if (!cancelled) {
          setSetData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : t("loadError")
          );
          setSetData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally omit `t`: fetch once on mount; `t` only used for a static fallback string.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
  }, []);

  const product = useMemo(() => {
    if (!setData?.products?.length || !id) return null;
    return setData.products.find((p) => p.id === id) ?? null;
  }, [setData, id]);

  const views = useMemo(
    () => (product ? imageViewsFromUrls(product.imageUrls, t) : []),
    [product, t]
  );

  const activeView = views[activeIndex] ?? views[0];
  const priceUsd = product ? TYPE2_A1_PRICES_USD[product.id] : undefined;
  const priceLabel = priceUsd != null ? formatPriceUsd(priceUsd) : "—";

  return (
    <div className="container productPageWrap">
      <nav className="productBreadcrumb" aria-label={t("breadcrumb")}>
        <Link to={CATEGORY_HREF} className="productBreadcrumbLink">
          {t("womenType2")}
        </Link>
        <span className="productBreadcrumbSep" aria-hidden="true">
          /
        </span>
        <span className="productBreadcrumbCurrent">
          {loading ? "…" : product?.label ?? t("productFallback")}
        </span>
      </nav>

      {error && (
        <p className="productPageError" role="alert">
          {error}. {t("apiHintBefore")}{" "}
          <code className="productPageCode">REACT_APP_API_URL</code>{" "}
          {t("apiHintAfter")}
        </p>
      )}

      {loading && (
        <div className="productLayout productLayoutSkeleton" aria-hidden="true">
          <div className="productGallerySkeleton" />
          <div className="productAsideSkeleton">
            <div className="productAsideLine productAsideLineShort" />
            <div className="productAsideLine" />
            <div className="productAsideLine productAsideLineMid" />
          </div>
        </div>
      )}

      {!loading && !error && !product && (
        <div className="productNotFound">
          <h1 className="productNotFoundTitle">{t("notFoundTitle")}</h1>
          <p className="productNotFoundText">{t("notFoundText")}</p>
          <Link className="productNotFoundCta" to={CATEGORY_HREF}>
            {t("backToWomens")}
          </Link>
        </div>
      )}

      {!loading && !error && product && (
        <div className="productLayout">
          <div className="productGallery">
            <div className="productHero">
              {activeView ? (
                <img
                  className="productHeroImg"
                  src={activeView.src}
                  alt={t("heroAlt", {
                    product: product.label,
                    view: activeView.label,
                  })}
                />
              ) : (
                <div className="productHeroPlaceholder" />
              )}
            </div>
            {views.length > 1 && (
              <div
                className="productThumbs"
                role="group"
                aria-label={t("viewsGroup")}
              >
                {views.map((v, i) => (
                  <button
                    key={v.key}
                    type="button"
                    className={`productThumb${i === activeIndex ? " productThumbActive" : ""}`}
                    onClick={() => setActiveIndex(i)}
                    aria-pressed={i === activeIndex}
                    aria-label={t("showView", { label: v.label })}
                  >
                    <img
                      className="productThumbImg"
                      src={v.src}
                      alt=""
                      loading="lazy"
                    />
                    <span className="productThumbLabel">{v.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="productAside">
            <p className="productKicker">{t("womenType2")}</p>
            <h1 className="productTitle">{product.label}</h1>
            {setData?.name && (
              <p className="productSetName">
                {t("partOfSet", { name: setData.name })}
              </p>
            )}
            <p className="productPrice">{priceLabel}</p>
            <p className="productNote">{t("pairNote")}</p>
            <Link className="productBackLink" to={CATEGORY_HREF}>
              {t("viewAllInSet")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
