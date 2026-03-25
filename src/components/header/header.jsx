import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./header.css";
import { useCart } from "../../context/cartContext";
import { useCurrency } from "../../context/currencyContext";
import { useLanguage } from "../../i18n/useLanguage";
import { useNavItems } from "../../i18n/useNavItems";

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
  const { t } = useTranslation("common");
  const { currency, setCurrency } = useCurrency();
  const { totalQuantity } = useCart();
  const { language, setLanguage, languageOptions } = useLanguage();
  const nav = useNavItems();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState(null);
  const location = useLocation();
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMega(null);
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

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

  return (
    <div className="headerWrapper">
      <div className="announcement" role="status" aria-live="polite">
        <div className="container announcementRow">
          <div className="announcementLeft">
            <strong>{t("announcement.line1")}</strong>
            <span className="dot" aria-hidden="true" />
            <span>{t("announcement.line2")}</span>
          </div>
          <div className="announcementRight">
            {t("announcement.line3")}
          </div>
        </div>
      </div>

      <header className="siteHeader">
        <div className="container headerTop">
          <button
            className="iconBtn headerHamburger"
            onClick={() => setMobileOpen(true)}
            aria-label={t("openMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobileNav"
            type="button"
          >
            <Icon name="menu" />
          </button>

          <div className="headerControls" aria-label={t("preferences")}>
            <label className="pillSelect">
              <span className="pillLabel">{t("currency")}</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                aria-label={t("currency")}
              >
                <option value="USD">USD $</option>
                <option value="CAD">CAD $</option>
                <option value="BRL">BRL $</option>
              </select>
            </label>

            <label className="pillSelect">
              <span className="pillLabel">{t("language")}</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label={t("language")}
              >
                {languageOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <Link className="brand" to="/" aria-label={t("brandAria")}>
            E-Project
          </Link>

          <div className="headerActions" aria-label={t("actions")}>
            <button className="iconBtn" type="button" aria-label={t("search")}>
              <Icon name="search" />
            </button>
            <button className="iconBtn" type="button" aria-label={t("account")}>
              <Icon name="user" />
            </button>
            <Link
              className="iconBtn headerCartBtn"
              to="/cart"
              aria-label={
                totalQuantity > 0
                  ? t("cartWithCount", { count: totalQuantity })
                  : t("cart")
              }
            >
              <Icon name="bag" />
              {totalQuantity > 0 ? (
                <span className="headerCartBadge">{totalQuantity > 99 ? "99+" : totalQuantity}</span>
              ) : null}
            </Link>
          </div>
        </div>

        <div className="container navRow">
          <nav className="nav" aria-label={t("mainNav")}>
            {nav.map((item) => (
              <div
                key={item.label}
                className="navItem"
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) {
                    clearTimeout(closeTimeoutRef.current);
                    closeTimeoutRef.current = null;
                  }
                  setOpenMega(item.label);
                }}
                onMouseLeave={() => {
                  closeTimeoutRef.current = setTimeout(() => {
                    setOpenMega(null);
                  }, 150);
                }}
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
                  aria-label={t("megaMenu", { label: item.label })}
                  onMouseEnter={() => {
                    if (closeTimeoutRef.current) {
                      clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = null;
                    }
                    setOpenMega(item.label);
                  }}
                  onMouseLeave={() => {
                    closeTimeoutRef.current = setTimeout(() => {
                      setOpenMega(null);
                    }, 150);
                  }}
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
                          {t("discover", { label: item.label })}
                        </div>
                        <Link className="btn" to={item.to}>
                          {t("shop", { label: item.label })}
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
              {t("stories")}
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
            aria-label={t("close")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="mobilePanel" role="dialog" aria-label={t("mobileMenu")}>
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
                aria-label={t("closeMenu")}
              >
                ✕
              </button>
            </div>

            <div className="mobileBody">
              <Link
                className="mobileCartLink"
                to="/cart"
                onClick={() => setMobileOpen(false)}
              >
                {t("cart")}
                {totalQuantity > 0 ? (
                  <span className="mobileCartBadge">{totalQuantity > 99 ? "99+" : totalQuantity}</span>
                ) : null}
              </Link>
              <div className="mobilePrefs">
                <div className="mobilePrefRow">
                  <span className="mobilePrefLabel">{t("currency")}</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    aria-label={t("currency")}
                  >
                    <option value="USD">USD $</option>
                    <option value="CAD">CAD $</option>
                    <option value="BRL">BRL $</option>
                  </select>
                </div>
                <div className="mobilePrefRow">
                  <span className="mobilePrefLabel">{t("language")}</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    aria-label={t("language")}
                  >
                    {languageOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
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
                      {t("shop", { label: item.label })}
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
                {t("stories")}
              </Link>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
