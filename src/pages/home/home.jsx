import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavItems } from "../../i18n/useNavItems";
import { useNewArrivals } from "../../context/newArrivalsContext";
import { useCurrency } from "../../context/currencyContext";
import { PRODUCT_PRICES_USD } from "../../data/categoryRoutes";
import { formatDropRemainingMs } from "../../lib/dropTimerFormat";
import "./home.css";

function pickHeroImage(products) {
  for (const product of products) {
    const url = product?.imageUrls?.front ?? product?.imageUrls?.side;
    if (url) return url;
  }
  return null;
}

function Hero({ heroImageUrl, dropSetName }) {
  const { t } = useTranslation("home");
  const { expired, remainingMs } = useNewArrivals();
  const kicker = dropSetName ?? t("hero.kicker");

  return (
    <section
      className={`homeHero${heroImageUrl ? " homeHeroHasImage" : ""}`}
      aria-label={t("hero.aria")}
    >
      {heroImageUrl ? (
        <img
          className="homeHeroImg"
          src={heroImageUrl}
          alt=""
          fetchPriority="high"
        />
      ) : (
        <div className="homeHeroBg" aria-hidden="true" />
      )}
      <div className="homeHeroOverlay" aria-hidden="true" />
      <div className="homeHeroContent">
        <span className="homeHeroKicker">{kicker}</span>
        <h1 className="homeHeroTitle">{t("hero.title")}</h1>
        <p className="homeHeroSub">{t("hero.sub")}</p>
        <div className="homeHeroActions">
          <Link className="homeHeroCta" to="/category/new-arrivals">
            {t("hero.cta")}
          </Link>
          {!expired && (
            <p
              className="homeHeroTimer"
              role="timer"
              aria-live="polite"
              aria-label={t("hero.timerAria", {
                time: formatDropRemainingMs(remainingMs),
              })}
            >
              <span className="homeHeroTimerLabel">{t("hero.timerLabel")}</span>
              <span className="homeHeroTimerDigits" aria-hidden="true">
                {formatDropRemainingMs(remainingMs)}
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function DropRail({ products }) {
  const { t } = useTranslation("home");
  const { formatPriceUsd } = useCurrency();
  const { isBlocked } = useNewArrivals();

  if (!products.length) {
    return (
      <section className="homeDropRail" aria-labelledby="drop-rail-heading">
        <div className="container homeDropRailHead">
          <h2 id="drop-rail-heading" className="homeSectionTitle homeDropRailTitle">
            {t("dropRail.title")}
          </h2>
          <Link className="homeDropRailViewAll" to="/category/new-arrivals">
            {t("dropRail.viewAll")}
          </Link>
        </div>
        <div className="homeDropRailScroll" aria-hidden="true">
          <div className="homeDropRailCard homeDropRailCardSkeleton" />
          <div className="homeDropRailCard homeDropRailCardSkeleton" />
          <div className="homeDropRailCard homeDropRailCardSkeleton" />
        </div>
      </section>
    );
  }

  return (
    <section className="homeDropRail" aria-labelledby="drop-rail-heading">
      <div className="container homeDropRailHead">
        <h2 id="drop-rail-heading" className="homeSectionTitle homeDropRailTitle">
          {t("dropRail.title")}
        </h2>
        <Link className="homeDropRailViewAll" to="/category/new-arrivals">
          {t("dropRail.viewAll")}
        </Link>
      </div>
      <ul className="homeDropRailScroll" aria-label={t("dropRail.listAria")}>
        {products.map((product) => {
          const href = `/product/${encodeURIComponent(product.id)}`;
          const priceUsd = PRODUCT_PRICES_USD[product.id];
          const priceLabel = priceUsd != null ? formatPriceUsd(priceUsd) : null;
          const blocked = isBlocked(product.id);
          const imageUrl =
            product.imageUrls?.front ?? product.imageUrls?.side ?? null;

          return (
            <li key={product.id} className="homeDropRailItem">
              <Link
                className={`homeDropRailCard${blocked ? " homeDropRailCardBlocked" : ""}`}
                to={href}
              >
                <div className="homeDropRailMedia">
                  {imageUrl ? (
                    <img
                      className="homeDropRailImg"
                      src={imageUrl}
                      alt=""
                      loading="lazy"
                    />
                  ) : (
                    <div className="homeDropRailPlaceholder" />
                  )}
                </div>
                <div className="homeDropRailBody">
                  <span className="homeDropRailName">{product.label}</span>
                  {priceLabel ? (
                    <span className="homeDropRailPrice">{priceLabel}</span>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #1a1a1a 0%, #252520 100%)",
  "linear-gradient(135deg, #1c1a1e 0%, #2a2628 100%)",
  "linear-gradient(135deg, #181a1c 0%, #242628 100%)",
];

function CollectionCard({ item, index }) {
  const { t } = useTranslation("home");
  return (
    <Link
      className="homeCollectionCard"
      to={item.to}
      style={{ "--card-bg": CARD_GRADIENTS[index % 3] }}
    >
      <div className="homeCollectionCardBg" aria-hidden="true" />
      <div className="homeCollectionCardContent">
        <span className="homeCollectionCardLabel">{item.label}</span>
        <span className="homeCollectionCardCta">{t("collections.explore")}</span>
      </div>
    </Link>
  );
}

function FeaturedBlock() {
  const { t } = useTranslation("home");
  return (
    <section className="homeFeatured" aria-labelledby="featured-heading">
      <div className="homeFeaturedInner">
        <div className="homeFeaturedMedia" aria-hidden="true">
          <div
            className="homeFeaturedImg"
            style={{
              background:
                "linear-gradient(160deg, #0f0f0f 0%, #2a2520 50%, #1a1815 100%)",
            }}
          />
        </div>
        <div className="homeFeaturedText">
          <span className="homeFeaturedKicker">{t("featured.kicker")}</span>
          <h2 id="featured-heading" className="homeFeaturedTitle">
            {t("featured.title")}
          </h2>
          <p className="homeFeaturedDesc">{t("featured.desc")}</p>
          <Link className="homeFeaturedLink" to="/category/legacy">
            {t("featured.link")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const { t } = useTranslation("home");
  const items = [
    {
      label: t("trust.freeShipping"),
      sub: t("trust.freeShippingSub"),
    },
    { label: t("trust.returns"), sub: t("trust.returnsSub") },
    {
      label: t("trust.checkout"),
      sub: t("trust.checkoutSub"),
    },
  ];
  return (
    <section className="homeTrust" aria-label={t("trust.aria")}>
      <div className="container homeTrustInner">
        {items.map((item) => (
          <div key={item.label} className="homeTrustItem">
            <span className="homeTrustLabel">{item.label}</span>
            <span className="homeTrustSub">{item.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation("home");
  const nav = useNavItems();
  const { latestProducts, dropSetName } = useNewArrivals();
  const heroImageUrl = pickHeroImage(latestProducts);

  return (
    <div className="home">
      <Hero heroImageUrl={heroImageUrl} dropSetName={dropSetName} />
      <DropRail products={latestProducts} />
      <section className="homeCollections" aria-labelledby="collections-heading">
        <div className="container">
          <h2 id="collections-heading" className="homeSectionTitle">
            {t("collections.title")}
          </h2>
          <div className="homeCollectionGrid">
            {nav.slice(0, 3).map((item, i) => (
              <CollectionCard key={item.to} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>
      <FeaturedBlock />
      <TrustBar />
    </div>
  );
}
