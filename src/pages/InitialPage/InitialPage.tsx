import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Search,
  Star,
} from "lucide-react";
import { Pagination } from "@mui/material";
import { ListCardsGeneralData, moviesApi } from "@/api/config";
import { Card, MovieDialog } from "@/components/Card/Card";
import { CardSkeleton } from "@/components/Card/CardSkeleton";
import { SITE_NAME } from "@/constants";
import {
  ApiFilm,
  CreatureFilter,
  creatureFilms,
  editorPicks,
  featuredFilms,
  filmKey,
  imageUrl,
} from "@/data/catalog";
import { useFilmFeed } from "@/hooks/useFilmFeed";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useTranslation } from "react-i18next";
import { getApiLanguage, getLanguage, paginationLabel } from "@/i18n";
import { localizeFilm } from "@/i18n/catalog";
import { CreatureFilters } from "../CreaturesPage/CreaturesPage";
import { useCreatureFeed } from "@/hooks/useCreatureFeed";

type FeedData = ListCardsGeneralData & { results: ApiFilm[] };

export const InitialPage = () => {
  const { t } = useTranslation();
  const language = getLanguage();
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const query = params.get("q")?.trim() || "";
  const page = Math.max(1, Math.min(500, Number(params.get("page")) || 1));
  const isWatchlist = pathname === "/watchlist";
  const isSearch = pathname === "/search";
  const isHome = !isWatchlist && !isSearch;
  const [homeFilter, setHomeFilter] = useState<CreatureFilter>("all");
  const [sort, setSort] = useState("recent");
  const { films: savedFilms, persistent } = useWatchlist();
  const sharkFeed = useCreatureFeed(
    "sharks",
    1,
    isHome && homeFilter !== "titans",
  );
  const titanFeed = useCreatureFeed(
    "titans",
    1,
    isHome && homeFilter !== "sharks",
  );
  const creatureFeeds =
    homeFilter === "sharks"
      ? [sharkFeed]
      : homeFilter === "titans"
        ? [titanFeed]
        : [sharkFeed, titanFeed];
  const creaturesLoading = creatureFeeds.some((feed) => feed.loading);
  const creaturesFailed = creatureFeeds.some((feed) => feed.failed);
  const creaturePreview = creaturesFailed
    ? creatureFilms.filter(
        (film) => homeFilter === "all" || film.collection === homeFilter,
      )
    : creatureFeeds
        .flatMap((feed) => feed.films)
        .filter(
          (film, index, films) =>
            films.findIndex((other) => filmKey(other) === filmKey(film)) ===
            index,
        )
        .sort((first, second) => second.date.localeCompare(first.date));
  const trending = useFilmFeed(isHome ? "trending" : null, (signal) =>
    moviesApi.get<FeedData>("trending/movie/week", {
      params: { language: getApiLanguage() },
      signal,
      timeout: 12000,
    }),
  );
  const search = useFilmFeed(
    isSearch && query ? `search:${page}:${query}` : null,
    (signal) =>
      moviesApi.get<FeedData>("search/multi", {
        params: {
          query,
          page,
          include_adult: false,
          language: getApiLanguage(),
        },
        signal,
        timeout: 12000,
      }),
    { keepPrevious: true },
  );

  useEffect(() => {
    document.title = `${isWatchlist ? t("nav.myWatchlist") : isSearch ? `${t("search.title")}${query ? `: ${query}` : ""}` : t("home.tagline")} | ${SITE_NAME}`;
  }, [isWatchlist, isSearch, query, t]);

  const creatureSection = (
    <section
      className="catalog-section creature-section"
      aria-labelledby="creature-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">
            <span className="live-dot" />
            {t("nav.creatures")}
          </p>
          <h2 id="creature-title">{t("creatures.title")}</h2>
          <p className="section-description">{t("creatures.description")}</p>
        </div>
        <Link
          className="section-link"
          to={
            homeFilter === "all"
              ? "/creatures"
              : `/creatures?kind=${homeFilter}`
          }
        >
          {t("creatures.explore")} <ArrowRight size={17} />
        </Link>
      </div>
      <div className="collection-toolbar">
        <CreatureFilters value={homeFilter} onChange={setHomeFilter} />
      </div>
      {creaturesLoading ? (
        <LoadingGrid />
      ) : (
        <div className="film-grid">
          {creaturePreview.slice(0, 6).map((film) => (
            <Card key={filmKey(film)} {...film} />
          ))}
        </div>
      )}
    </section>
  );

  if (isWatchlist) {
    const sortedFilms = [...savedFilms]
      .map((film) => localizeFilm(film, language))
      .reverse()
      .sort((first, second) =>
        sort === "rating"
          ? second.vote - first.vote
          : sort === "title"
            ? first.title.localeCompare(second.title, language)
            : 0,
      );
    return (
      <div className="page-container browse-page">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("watchlist.eyebrow")}</p>
            <h1>
              {t("nav.myWatchlist")}{" "}
              <span className="title-count">{savedFilms.length}</span>
            </h1>
            <p className="section-description">{t("watchlist.description")}</p>
          </div>
          {savedFilms.length > 0 && (
            <label className="sort-control">
              {t("watchlist.sort")}
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="recent">{t("watchlist.recent")}</option>
                <option value="rating">{t("watchlist.rating")}</option>
                <option value="title">{t("watchlist.alphabetical")}</option>
              </select>
            </label>
          )}
        </div>
        {!persistent && (
          <p className="inline-notice" role="status">
            {t("watchlist.sessionOnly")}
          </p>
        )}
        {savedFilms.length ? (
          <div className="film-grid">
            {sortedFilms.map((film) => (
              <Card key={filmKey(film)} {...film} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bookmark"
            title={t("watchlist.emptyTitle")}
            description={t("watchlist.emptyDescription")}
          />
        )}
      </div>
    );
  }

  if (isSearch)
    return (
      <div className="page-container browse-page">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t("search.eyebrow")}</p>
            <h1>
              {query ? (
                <>
                  {t("search.results")}{" "}
                  <span className="search-term">"{query}"</span>
                </>
              ) : (
                t("search.prompt")
              )}
            </h1>
          </div>
        </div>
        {!query ? (
          <EmptyState
            icon="search"
            title={t("search.emptyTitle")}
            description={t("search.emptyDescription")}
          />
        ) : search.loading && search.stale ? (
          <div
            className="film-grid is-refreshing"
            aria-busy="true"
            aria-label={t("common.loadingMovies")}
          >
            {search.stale.map((film) => (
              <Card key={filmKey(film)} {...film} />
            ))}
          </div>
        ) : search.loading ? (
          <LoadingGrid />
        ) : search.failed ? (
          <div className="empty-state" role="status">
            <Search size={32} />
            <h2>{t("search.errorTitle")}</h2>
            <p>{t("search.errorDescription")}</p>
            <button className="button button-primary" onClick={search.retry}>
              {t("common.tryAgain")}
            </button>
          </div>
        ) : search.films.length ? (
          <>
            <div className="film-grid">
              {search.films.map((film) => (
                <Card key={filmKey(film)} {...film} />
              ))}
            </div>
            {search.pages > 1 && (
              <Pagination
                className="catalog-pagination"
                aria-label={t("pagination.label")}
                getItemAriaLabel={paginationLabel}
                count={search.pages}
                page={Math.min(page, search.pages)}
                onChange={(_event, nextPage) => {
                  setParams({ q: query, page: String(nextPage) });
                  window.scrollTo({
                    top: 0,
                    behavior: "instant" as ScrollBehavior,
                  });
                }}
              />
            )}
          </>
        ) : (
          <EmptyState
            icon="search"
            title={t("search.noMatches")}
            description={t("search.noMatchesDescription", { query })}
          />
        )}
        <p className="sr-only" role="status">
          {query && !search.loading && !search.failed
            ? t("search.status", { count: search.films.length, query })
            : ""}
        </p>
      </div>
    );

  return (
    <>
      <Spotlight />
      <div className="discovery-strip page-container">
        <span>
          <Clapperboard size={17} />
          {t("home.tagline")}.
        </span>
        <Link to="/movies/top-rated">
          {t("home.movieNight")} <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="page-container">
        {creatureSection}
        <section
          className="catalog-section trending-section"
          aria-labelledby="trending-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t("home.trendingEyebrow")}</p>
              <h2 id="trending-title">
                {t(trending.failed ? "home.editorPicks" : "home.trending")}
              </h2>
            </div>
            <Link className="section-link" to="/movies/popular">
              {t("home.allMovies")} <ArrowRight size={17} />
            </Link>
          </div>
          {trending.failed && (
            <p className="inline-notice" role="status">
              {t("home.feedUnavailable")}{" "}
              <button className="text-button" onClick={trending.retry}>
                {t("common.retry")}
              </button>
            </p>
          )}
          {trending.loading ? (
            <LoadingGrid />
          ) : (
            <div className="film-grid">
              {(trending.failed ? editorPicks : trending.films.slice(0, 6)).map(
                (film) => (
                  <Card key={filmKey(film)} {...film} />
                ),
              )}
            </div>
          )}
        </section>
        <section className="deep-sea-feature" aria-labelledby="deep-sea-title">
          <img
            src={imageUrl(creatureFilms[3].backdrop!, "w1280")}
            alt={t("deep.alt")}
            loading="lazy"
          />
          <div>
            <p className="eyebrow">{t("deep.eyebrow")}</p>
            <h2 id="deep-sea-title">
              {t("deep.title")}
              <br />
              {t("deep.subtitle")}
            </h2>
            <Link className="button button-primary" to="/creatures?kind=sharks">
              {t("deep.explore")} <ArrowRight size={17} />
            </Link>
          </div>
          <span className="feature-credit">
            {localizeFilm(creatureFilms[3], language).title.toLocaleUpperCase(
              language,
            )}{" "}
            / 2018
          </span>
        </section>
      </div>
    </>
  );
};

const LoadingGrid = () => {
  const { t } = useTranslation();
  return (
    <div
      className="film-grid"
      aria-label={t("common.loadingMovies")}
      aria-busy="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
};

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: "bookmark" | "search";
  title: string;
  description: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className="empty-state">
      {icon === "bookmark" ? <Bookmark size={36} /> : <Search size={36} />}
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="button button-primary" to="/">
        {t("common.discoverMovies")} <ArrowRight size={17} />
      </Link>
    </div>
  );
};

const Spotlight = () => {
  const { t } = useTranslation();
  const language = getLanguage();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const film = localizeFilm(featuredFilms[active], language);
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(film);
  const changeFilm = (direction: number) =>
    setActive(
      (current) =>
        (current + direction + featuredFilms.length) % featuredFilms.length,
    );

  return (
    <section className="spotlight" aria-label={t("spotlight.label")}>
      <img
        key={film.id}
        className="spotlight-image"
        src={imageUrl(film.backdrop!, "w1280")}
        alt={t("spotlight.scene", { title: film.title })}
      />
      <div className="spotlight-shade" />
      <div className="spotlight-content page-container" aria-live="polite">
        <p className="eyebrow spotlight-eyebrow">
          <span />
          {t("spotlight.eyebrow")}
        </p>
        <h1 className={`spotlight-title spotlight-title-${active}`}>
          {active === 0 ? (
            <>
              {t("spotlight.godzilla")} <span className="title-cross">x</span>{" "}
              {t("spotlight.kong")}{" "}
              <span className="spotlight-subtitle">
                {t("spotlight.empire")}
              </span>
            </>
          ) : active === 1 ? (
            <>
              {t("spotlight.meg")}{" "}
              <span className="spotlight-subtitle">
                {t("spotlight.trench")}
              </span>
            </>
          ) : (
            <>
              {t("spotlight.pacific")}{" "}
              <span className="spotlight-subtitle">
                {t("spotlight.extinct")}
              </span>
            </>
          )}
        </h1>
        <div className="detail-meta">
          <span className="rating">
            <Star size={14} fill="currentColor" />
            {film.vote.toLocaleString(language, {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
          <span>{film.date.slice(0, 4)}</span>
          <span>
            {t("spotlight.duration", {
              hours: active === 2 ? 2 : 1,
              minutes: active === 0 ? 55 : active === 1 ? 56 : 11,
            })}
          </span>
          <span>{film.genres?.join(" / ")}</span>
        </div>
        <p className="spotlight-description">{film.overview}</p>
        <div className="spotlight-actions">
          <button
            className="button button-primary"
            onClick={() => setOpen(true)}
          >
            {t("spotlight.explore")} <ArrowRight size={18} />
          </button>
          <button
            className="button button-glass"
            onClick={() => toggle(film)}
            aria-pressed={saved}
          >
            {saved ? <Check size={17} /> : <Bookmark size={17} />}
            {t(saved ? "spotlight.saved" : "nav.watchlist")}
          </button>
        </div>
      </div>
      <div className="spotlight-bottom page-container">
        <Link to="/creatures" className="spotlight-collection">
          <span className="live-dot" />
          {t("spotlight.collection")} <ArrowRight size={15} />
        </Link>
        <div className="spotlight-controls">
          <span className="slide-number">
            0{active + 1}
            <span> / 03</span>
          </span>
          <button
            className="icon-button"
            onClick={() => changeFilm(-1)}
            aria-label={t("spotlight.previous")}
            title={t("spotlight.previous")}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="icon-button"
            onClick={() => changeFilm(1)}
            aria-label={t("spotlight.next")}
            title={t("spotlight.next")}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="spotlight-progress">
        {featuredFilms.map((item, index) => (
          <button
            key={item.id}
            className={index === active ? "active" : ""}
            aria-label={t("spotlight.feature", {
              title: localizeFilm(item, language).title,
            })}
            aria-current={index === active ? "true" : undefined}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
      {open && (
        <MovieDialog key={film.id} film={film} onClose={() => setOpen(false)} />
      )}
    </section>
  );
};
