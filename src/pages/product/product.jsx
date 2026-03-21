import { useEffect, useMemo, useState } from "react";
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
function imageViewsFromUrls(imageUrls) {
  if (!imageUrls) return [];
  const out = [];
  if (imageUrls.front) {
    out.push({ key: "front", src: imageUrls.front, label: "Front" });
  }
  if (imageUrls.side) {
    out.push({ key: "side", src: imageUrls.side, label: "Side" });
  }
  return out;
}

export default function Product() {
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
          setError(e instanceof Error ? e.message : "Could not load product");
          setSetData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const product = useMemo(() => {
    if (!setData?.products?.length || !id) return null;
    return setData.products.find((p) => p.id === id) ?? null;
  }, [setData, id]);

  const views = useMemo(
    () => (product ? imageViewsFromUrls(product.imageUrls) : []),
    [product]
  );

  const activeView = views[activeIndex] ?? views[0];
  const priceUsd = product ? TYPE2_A1_PRICES_USD[product.id] : undefined;
  const priceLabel = priceUsd != null ? formatPriceUsd(priceUsd) : "—";

  return (
    <div className="container productPageWrap">
      <nav className="productBreadcrumb" aria-label="Breadcrumb">
        <Link to={CATEGORY_HREF} className="productBreadcrumbLink">
          Women&apos;s · type-2
        </Link>
        <span className="productBreadcrumbSep" aria-hidden="true">
          /
        </span>
        <span className="productBreadcrumbCurrent">
          {loading ? "…" : product?.label ?? "Product"}
        </span>
      </nav>

      {error && (
        <p className="productPageError" role="alert">
          {error}. Check that the API is running and{" "}
          <code className="productPageCode">REACT_APP_API_URL</code> is correct.
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
          <h1 className="productNotFoundTitle">Product not found</h1>
          <p className="productNotFoundText">
            This item is not in the current catalog.
          </p>
          <Link className="productNotFoundCta" to={CATEGORY_HREF}>
            Back to Women&apos;s
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
                  alt={`${product.label} — ${activeView.label} view`}
                />
              ) : (
                <div className="productHeroPlaceholder" />
              )}
            </div>
            {views.length > 1 && (
              <div
                className="productThumbs"
                role="group"
                aria-label="Product views"
              >
                {views.map((v, i) => (
                  <button
                    key={v.key}
                    type="button"
                    className={`productThumb${i === activeIndex ? " productThumbActive" : ""}`}
                    onClick={() => setActiveIndex(i)}
                    aria-pressed={i === activeIndex}
                    aria-label={`Show ${v.label} view`}
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
            <p className="productKicker">Women&apos;s · type-2</p>
            <h1 className="productTitle">{product.label}</h1>
            {setData?.name && (
              <p className="productSetName">Part of {setData.name}</p>
            )}
            <p className="productPrice">{priceLabel}</p>
            <p className="productNote">
              Sold as a curated pair with the matching piece from this set.
            </p>
            <Link className="productBackLink" to={CATEGORY_HREF}>
              ← View all in set
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
