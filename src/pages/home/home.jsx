import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useNavItems } from "../../i18n/useNavItems";
import "./home.css";

function Hero() {
  const { t } = useTranslation("home");
  return (
    <section className="homeHero" aria-label={t("hero.aria")}>
      <div className="homeHeroBg" aria-hidden="true" />
      <div className="homeHeroContent">
        <span className="homeHeroKicker">{t("hero.kicker")}</span>
        <h1 className="homeHeroTitle">{t("hero.title")}</h1>
        <p className="homeHeroSub">{t("hero.sub")}</p>
        <Link className="homeHeroCta" to="/category/new-arrivals">
          {t("hero.cta")}
        </Link>
      </div>
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
  return (
    <div className="home">
      <Hero />
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
