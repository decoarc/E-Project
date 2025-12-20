import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./header.css";
import { NAV } from "../../data/nav";

function Icon({ name }) {
  return (
    <span className="hIcon" aria-hidden="true">
      {name === "search"
        ? "⌕"
        : name === "user"
        ? "⟡"
        : name === "bag"
        ? "▢"
        : "≡"}
    </span>
  );
}

export default function Header() {
  const [currency, setCurrency] = useState("USD");
  const [lang, setLang] = useState("EN");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setOpenMega(null);
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenMega(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const nav = useMemo(() => NAV, []);

  return (
    <>
      <div className="announcement" role="status" aria-live="polite">
        <div className="container announcementRow">
          <div className="announcementLeft">
            <strong>You are $175.00 away from free shipping</strong>
            <span className="dot" aria-hidden="true" />
            <span>US & Canada: Duties and customs are on us</span>
          </div>
          <div className="announcementRight">
            Order by Dec 10 (US) / Dec 4 (Canada) for on-time Holiday delivery
          </div>
        </div>
      </div>

      <header className="siteHeader">
        <div className="container headerTop">
          <button
            className="iconBtn headerHamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={mobileOpen}
            aria-controls="mobileNav"
            type="button"
          >
            <Icon name="menu" />
          </button>

          <div className="headerControls" aria-label="Preferências">
            <label className="pillSelect">
              <span className="pillLabel">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label="Currency"
              >
                <option value="USD">USD $</option>
                <option value="CAD">CAD $</option>
                <option value="BRL">BRL $</option>
              </select>
            </label>

            <label className="pillSelect">
              <span className="pillLabel">Language</span>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                aria-label="Language"
              >
                <option value="EN">EN</option>
                <option value="FR">FR</option>
                <option value="PT-BR">PT-BR</option>
              </select>
            </label>
          </div>

          <Link className="brand" to="/" aria-label="E-Project (mick)">
            E-Project
          </Link>

          <div className="headerActions" aria-label="Ações">
            <button className="iconBtn" type="button" aria-label="Search">
              <Icon name="search" />
            </button>
            <button className="iconBtn" type="button" aria-label="Account">
              <Icon name="user" />
            </button>
            <button className="iconBtn" type="button" aria-label="Cart">
              <Icon name="bag" />
            </button>
          </div>
        </div>

        <div className="container navRow">
          <nav className="nav" aria-label="Navegação principal">
            {nav.map((item) => (
              <div
                key={item.label}
                className="navItem"
                onMouseEnter={() => setOpenMega(item.label)}
                onMouseLeave={() =>
                  setOpenMega((v) => (v === item.label ? null : v))
                }
              >
                <NavLink
                  className={({ isActive }) =>
                    `navLink ${isActive ? "navLinkActive" : ""}`
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>

                <div
                  className={`mega ${
                    openMega === item.label ? "megaOpen" : ""
                  }`}
                  role="dialog"
                  aria-label={`${item.label} menu`}
                >
                  <div className="megaInner">
                    <div className="megaCols">
                      {item.columns?.map((col) => (
                        <div className="megaCol" key={col.title}>
                          <div className="megaTitle">{col.title}</div>
                          <ul className="megaList">
                            {col.links?.map((l) => (
                              <li key={l.to}>
                                <Link className="megaLink" to={l.to}>
                                  {l.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {item.promo ? (
                      <div className="megaPromo">
                        <div className="megaPromoKicker">
                          {item.promo.kicker}
                        </div>
                        <div className="megaPromoTitle">{item.promo.title}</div>
                        <Link className="btn" to={item.promo.to}>
                          {item.promo.cta}
                        </Link>
                      </div>
                    ) : (
                      <div className="megaPromo megaPromoMuted">
                        <div className="megaPromoTitle">
                          Discover {item.label}
                        </div>
                        <Link className="btn" to={item.to}>
                          Shop {item.label}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <NavLink
              className={({ isActive }) =>
                `navLink ${isActive ? "navLinkActive" : ""}`
              }
              to="/stories"
            >
              Stories
            </NavLink>
          </nav>
        </div>

        <div
          className={`mobileNav ${mobileOpen ? "mobileNavOpen" : ""}`}
          id="mobileNav"
          aria-hidden={!mobileOpen}
        >
          <button
            className="mobileBackdrop"
            type="button"
            aria-label="Fechar"
            onClick={() => setMobileOpen(false)}
          />
          <div className="mobilePanel" role="dialog" aria-label="Menu">
            <div className="mobileHead">
              <Link
                className="brand brandMobile"
                to="/"
                onClick={() => setMobileOpen(false)}
              >
                E-Project
              </Link>
              <button
                className="iconBtn"
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
              >
                ✕
              </button>
            </div>

            <div className="mobileBody">
              <div className="mobilePrefs">
                <div className="mobilePrefRow">
                  <span className="mobilePrefLabel">Currency</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    aria-label="Currency"
                  >
                    <option value="USD">USD $</option>
                    <option value="CAD">CAD $</option>
                    <option value="BRL">BRL $</option>
                  </select>
                </div>
                <div className="mobilePrefRow">
                  <span className="mobilePrefLabel">Language</span>
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    aria-label="Language"
                  >
                    <option value="EN">EN</option>
                    <option value="FR">FR</option>
                    <option value="PT-BR">PT-BR</option>
                  </select>
                </div>
              </div>

              {nav.map((item) => (
                <details className="mobileGroup" key={item.label}>
                  <summary className="mobileSummary">{item.label}</summary>

                  <div className="mobileLinks">
                    <Link
                      className="mobileLink"
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                    >
                      Shop {item.label}
                    </Link>

                    {item.columns
                      ?.flatMap((c) => c.links || [])
                      .map((l) => (
                        <Link
                          key={l.to}
                          className="mobileLink"
                          to={l.to}
                          onClick={() => setMobileOpen(false)}
                        >
                          {l.label}
                        </Link>
                      ))}
                  </div>
                </details>
              ))}

              <Link
                className="mobileLink mobileLinkStandalone"
                to="/stories"
                onClick={() => setMobileOpen(false)}
              >
                Stories
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
