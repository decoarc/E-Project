import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchSet } from "../../lib/api";
import "./category.css";

/** Preços fictícios (USD) para o conjunto a1 na categoria Women's (type-2). */
const TYPE2_A1_PRICES_USD = {
  a1_bottom: 89,
  a1_up: 79,
};

function formatUsd(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function Type2WomensSet() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = await fetchSet("a1");
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load products");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="categoryPage">
      <header className="categoryPageHeader">
        <span className="categoryPageKicker">Women&apos;s · type-2</span>
        <h1 className="categoryPageTitle">Women&apos;s</h1>
        <p className="categoryPageIntro">
          Harness and archive pieces curated for the season.
        </p>
      </header>

      <section className="categorySet" aria-labelledby="set-a1-heading">
        <div className="categorySetHead">
          <h2 id="set-a1-heading" className="categorySetTitle">
            {loading ? "Loading…" : data?.name ?? "Set"}
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
            <code className="categoryPageCode">REACT_APP_API_URL</code> is correct.
          </p>
        )}

        {loading && (
          <div className="categoryGrid categoryGridSkeleton" aria-hidden="true">
            <div className="categoryCardSkeleton" />
            <div className="categoryCardSkeleton" />
          </div>
        )}

        {!loading && !error && data?.products?.length > 0 && (
          <ul className="categoryGrid">
            {data.products.map((product) => {
              const priceUsd = TYPE2_A1_PRICES_USD[product.id];
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

  if (slug === "type-2") {
    return (
      <div className="container categoryPageWrap">
        <Type2WomensSet />
      </div>
    );
  }

  return (
    <div className="container categoryPageWrap">
      <GenericCategory slug={slug} />
    </div>
  );
}
