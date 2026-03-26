import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, useLocation } from "react-router-dom";
import "./header.css";
import { useCart } from "../../context/cartContext";
import { useNewArrivals } from "../../context/newArrivalsContext";
import { useCurrency } from "../../context/currencyContext";
import { formatDropRemainingMs } from "../../lib/dropTimerFormat";
import { useLanguage } from "../../i18n/useLanguage";
import { useNavItems } from "../../i18n/useNavItems";
import { fetchAllSearchableProducts } from "../../lib/searchProducts";

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
  const { expired, remainingMs, dropHeadline } = useNewArrivals();
  const { language, setLanguage, languageOptions } = useLanguage();
  const nav = useNavItems();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMega, setOpenMega] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const location = useLocation();
  const closeTimeoutRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];
    return searchProducts
      .filter((product) =>
        `${product.label ?? ""} ${product.id ?? ""}`.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [searchProducts, searchTerm]);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMega(null);
    setSearchOpen(false);
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
        setSearchOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || searchLoaded) return;
    let cancelled = false;
    setSearchLoading(true);
    (async () => {
      try {
        const products = await fetchAllSearchableProducts();
        if (!cancelled) {
          setSearchProducts(products);
          setSearchError(null);
          setSearchLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          setSearchError(e instanceof Error ? e.message : "Could not load products");
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchLoaded, searchOpen]);

  useEffect(() => {
    function onPointerDown(event) {
      if (!searchOpen) return;
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [searchOpen]);

  return (
    <div className="headerWrapper">
      <div
        className={`announcement${expired ? " announcement--dropEnded" : ""}`}
      >
        <div className="container announcementRow announcementRowDrop">
          <div className="announcementLeft">
            <span className="announcementDropLabel">
              {t("announcement.dropTimerLabel")}
            </span>
            <span className="announcementDropTime">
              {expired
                ? t("announcement.dropEnded")
                : formatDropRemainingMs(remainingMs)}
            </span>
          </div>
          <div className="announcementRight">
            <Link
              className="announcementDropProducts"
              to="/category/new-arrivals"
            >
              {dropHeadline ?? t("announcement.dropFallback")}
            </Link>
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
            <div className="headerSearch" ref={searchRef}>
              <button
                className="iconBtn"
                type="button"
                aria-label={t("search")}
                aria-expanded={searchOpen}
                aria-controls="header-search-panel"
                onClick={() => setSearchOpen((current) => !current)}
              >
                <Icon name="search" />
              </button>
              {searchOpen && (
                <div
                  className="headerSearchPanel"
                  id="header-search-panel"
                  role="dialog"
                  aria-label={t("search")}
                >
                  <input
                    ref={searchInputRef}
                    className="headerSearchInput"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("search")}
                    aria-label={t("search")}
                  />
                  {searchLoading ? (
                    <p className="headerSearchMeta">{t("searchLoadingProducts")}</p>
                  ) : null}
                  {!searchLoading && searchError ? (
                    <p className="headerSearchMeta" role="alert">
                      {searchError}
                    </p>
                  ) : null}
                  {!searchLoading && !searchError && searchTerm.trim().length === 0 ? (
                    <p className="headerSearchMeta">{t("searchTypeHint")}</p>
                  ) : null}
                  {!searchLoading &&
                  !searchError &&
                  searchTerm.trim().length > 0 &&
                  searchResults.length === 0 ? (
                    <p className="headerSearchMeta">{t("searchNoResults")}</p>
                  ) : null}
                  {!searchLoading && !searchError && searchResults.length > 0 ? (
                    <ul className="headerSearchList" aria-label={t("searchResultsAria")}>
                      {searchResults.map((product) => (
                        <li key={product.id}>
                          <Link
                            className="headerSearchItem"
                            to={`/product/${encodeURIComponent(product.id)}`}
                            onClick={() => setSearchOpen(false)}
                          >
                            <span className="headerSearchItemLabel">{product.label}</span>
                            <span className="headerSearchItemId">{product.id}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
            </div>
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
