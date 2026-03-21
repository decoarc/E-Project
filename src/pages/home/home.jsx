import { Link } from "react-router-dom";
import { NAV } from "../../data/nav";
import "./home.css";

function Hero() {
  return (
    <section className="homeHero" aria-label="Hero">
      <div className="homeHeroBg" aria-hidden="true" />
      <div className="homeHeroContent">
        <span className="homeHeroKicker">New season</span>
        <h1 className="homeHeroTitle">Street meets craft</h1>
        <p className="homeHeroSub">
          Exclusive pieces. Limited runs. Built for those who move differently.
        </p>
        <Link className="homeHeroCta" to="/category/new-arrivals">
          Shop the drop
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
  return (
    <Link
      className="homeCollectionCard"
      to={item.to}
      style={{ "--card-bg": CARD_GRADIENTS[index % 3] }}
    >
      <div className="homeCollectionCardBg" aria-hidden="true" />
      <div className="homeCollectionCardContent">
        <span className="homeCollectionCardLabel">{item.label}</span>
        <span className="homeCollectionCardCta">Explore</span>
      </div>
    </Link>
  );
}

function FeaturedBlock() {
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
          <span className="homeFeaturedKicker">Exclusively at E-Project</span>
          <h2 id="featured-heading" className="homeFeaturedTitle">
            Objects with intention
          </h2>
          <p className="homeFeaturedDesc">
            Curated drops that blur the line between street and archive. Each
            piece is selected for its craft and character.
          </p>
          <Link className="homeFeaturedLink" to="/category/exclusive">
            Discover exclusives
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const items = [
    { label: "Free shipping", sub: "On orders over $200" },
    { label: "Easy returns", sub: "30 days, no questions" },
    { label: "Secure checkout", sub: "Protected & encrypted" },
  ];
  return (
    <section className="homeTrust" aria-label="Services">
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
  return (
    <div className="home">
      <Hero />
      <section className="homeCollections" aria-labelledby="collections-heading">
        <div className="container">
          <h2 id="collections-heading" className="homeSectionTitle">
            Shop by collection
          </h2>
          <div className="homeCollectionGrid">
            {NAV.slice(0, 3).map((item, i) => (
              <CollectionCard key={item.label} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>
      <FeaturedBlock />
      <TrustBar />
    </div>
  );
}
