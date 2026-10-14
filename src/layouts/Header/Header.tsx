import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Bookmark, Search, X } from "lucide-react";
import { Brand } from "@/components/Brand/Brand";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useTranslation } from "react-i18next";

const LIVE_SEARCH_DELAY = 350;
const MIN_LIVE_QUERY = 2;

const onSearchPage = () => window.location.pathname.endsWith("/search");
const currentQuery = () => new URLSearchParams(window.location.search).get("q") || "";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const pending = useRef<number>();
  // Query of the URL this header navigated to; its echo must not overwrite newer typing.
  const ownQuery = useRef<string | null>(null);
  const { films } = useWatchlist();

  useEffect(() => {
    const query =
      location.pathname === "/search"
        ? new URLSearchParams(location.search).get("q") || ""
        : "";
    if (query && query === ownQuery.current) return;
    ownQuery.current = null;
    setSearch(query);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (location.pathname !== "/search") window.clearTimeout(pending.current);
  }, [location.pathname]);

  useEffect(() => () => window.clearTimeout(pending.current), []);

  const runSearch = (value: string) => {
    window.clearTimeout(pending.current);
    const query = value.trim();
    if (onSearchPage() && query === currentQuery()) return;
    ownQuery.current = query;
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search", {
      replace: onSearchPage(),
    });
  };

  const handleChange = (value: string) => {
    setSearch(value);
    window.clearTimeout(pending.current);
    const query = value.trim();
    if (query.length >= MIN_LIVE_QUERY || (!query && onSearchPage()))
      pending.current = window.setTimeout(() => runSearch(value), LIVE_SEARCH_DELAY);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (search.trim()) {
      runSearch(search);
      setSearchOpen(false);
    }
  };

  return (
    <header className="site-header">
      <a className="skip-link" href="#main-content">
        {t("nav.skip")}
      </a>
      <div className="header-inner page-container">
        <Link to="/" className="brand" aria-label={t("nav.home")}>
          <Brand />
        </Link>
        <nav className="primary-nav" aria-label={t("nav.main")}>
          <NavLink to="/" end>
            {t("nav.discover")}
          </NavLink>
          <NavLink
            to="/creatures"
            className={({ isActive }) => `creature-nav ${isActive ? "active" : ""}`}
          >
            {t("nav.creatures")}
            <span className="nav-dot" />
          </NavLink>
          <Link
            to="/movies/popular"
            className={location.pathname.startsWith("/movies/") ? "active" : ""}
            aria-current={location.pathname.startsWith("/movies/") ? "page" : undefined}
          >
            {t("nav.movies")}
          </Link>
          <Link
            to="/tv/popular"
            className={location.pathname.startsWith("/tv/") ? "active" : ""}
            aria-current={location.pathname.startsWith("/tv/") ? "page" : undefined}
          >
            {t("nav.series")}
          </Link>
        </nav>
        <div className="header-actions">
          <form
            className={`header-search ${searchOpen ? "is-open" : ""}`}
            role="search"
            onSubmit={submit}
          >
            <Search size={16} aria-hidden="true" />
            <input
              id="movie-search"
              type="search"
              aria-label={t("search.label")}
              placeholder={t("search.placeholder")}
              value={search}
              onChange={(event) => handleChange(event.target.value)}
            />
            <button
              className="icon-button search-submit"
              type="submit"
              aria-label={t("search.submit")}
              title={t("search.title")}
            >
              <Search size={16} />
            </button>
            <button
              className="icon-button search-close"
              type="button"
              aria-label={t("search.close")}
              onClick={() => setSearchOpen(false)}
            >
              <X size={18} />
            </button>
          </form>
          <button
            className="icon-button mobile-search-toggle"
            aria-label={t("search.open")}
            aria-expanded={searchOpen}
            aria-controls="movie-search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              if (!searchOpen)
                requestAnimationFrame(() =>
                  document.getElementById("movie-search")?.focus(),
                );
            }}
            title={t("search.title")}
          >
            <Search size={21} />
          </button>
          <NavLink
            to="/watchlist"
            className="watchlist-link"
            aria-label={t("nav.savedCount", { count: films.length })}
            title={t("nav.myWatchlist")}
          >
            <Bookmark size={19} />
            <span className="watchlist-label">{t("nav.watchlist")}</span>
            {films.length > 0 && <span className="watchlist-count">{films.length}</span>}
          </NavLink>
          <div className="language-switch" role="group" aria-label={t("language.label")}>
            <button
              type="button"
              lang="en"
              aria-label="EN (English)"
              aria-pressed={i18n.resolvedLanguage === "en"}
              onClick={() => void i18n.changeLanguage("en")}
            >
              EN
            </button>
            <button
              type="button"
              lang="uk"
              aria-label="УК (Українська)"
              aria-pressed={i18n.resolvedLanguage === "uk"}
              onClick={() => void i18n.changeLanguage("uk")}
            >
              УК
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
