import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSet } from "../../lib/api";
import "./category.css";

/** Preços fictícios (USD) para o conjunto a1 na categoria Women's (type-2). */
const TYPE2_A1_PRICES_USD = {
  a1_bottom: 89,
  a1_up: 79,
};

/** Rotas que carregam `/api/sets/:setId` e partilham o mesmo layout de cards. */
const CATEGORY_SET_ROUTES = {
  "type-1": {
    setId: "b1",
    kicker: "Men's · type-1",
    title: "Men's",
    intro: "Core silhouettes and seasonal picks built to last.",
    priceMap: {},
  },
  "type-2": {
    setId: "a1",
    kicker: "Women's · type-2",
    title: "Women's",
    intro: "Harness and archive pieces curated for the season.",
    priceMap: TYPE2_A1_PRICES_USD,
  },
  "type-3": {
    setId: "c1",
    kicker: "Accessories · type-3",
    title: "Accessories",
    intro: "Finishing touches that complete the look.",
    priceMap: {},
  },
};

function formatUsd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CategorySetView({ setId, kicker, title, intro, priceMap = {} }) {
  const headingId = `set-${setId}-heading`;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await fetchSet(setId);
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          const status = typeof e?.status === "number" ? e.status : undefined;
          const msg = e instanceof Error ? e.message : "Could not load products";
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
  }, [setId]);

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
            {loading ? "Loading…" : (data?.name ?? "Set")}
          </h2>
          {!loading && data?.products?.length > 0 && (
            <p className="categorySetSub">
              {data.products.length} pieces · sold as a curated pair
            </p>
          )}
        </div>

        {error && (
          <p className="categoryPageError" role="alert">
            {error}. Check that the API is running and{" "}
            <code className="categoryPageCode">REACT_APP_API_URL</code> is
            correct.
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
              aria-label="No products in this category"
            >
              <li>
                <article className="categoryCard categoryCardEmpty">
                  <div className="categoryCardEmptyCanvas">
                    <div className="categoryCardEmptyFill" aria-hidden="true" />
                    <h3 className="categoryCardComingSoonDiagonal">Coming soon</h3>
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
                priceUsd != null ? formatUsd(priceUsd) : "—";
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
                      <Link className="categoryCardCta" to={href}>
                        View details
                      </Link>
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
  return (
    <div className="categoryPage">
      <header className="categoryPageHeader">
        <h1 className="categoryPageTitle">Category</h1>
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
          kicker={setConfig.kicker}
          title={setConfig.title}
          intro={setConfig.intro}
          priceMap={setConfig.priceMap}
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
