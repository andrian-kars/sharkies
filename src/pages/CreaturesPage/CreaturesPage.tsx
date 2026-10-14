import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layers, Mountain, Waves } from "lucide-react";
import { Pagination } from "@mui/material";
import { Card } from "@/components/Card/Card";
import { CardSkeleton } from "@/components/Card/CardSkeleton";
import { CreatureFilter, creatureFilms, filmKey } from "@/data/catalog";
import { useCreatureFeed } from "@/hooks/useCreatureFeed";
import { paginationLabel } from "@/i18n";
import { SITE_NAME } from "@/constants";

const filters: { value: CreatureFilter; label: string; icon: typeof Layers }[] =
  [
    { value: "all", label: "creatures.all", icon: Layers },
    { value: "sharks", label: "creatures.sharks", icon: Waves },
    { value: "titans", label: "creatures.titans", icon: Mountain },
  ];

export const CreatureFilters = ({
  value,
  onChange,
}: {
  value: CreatureFilter;
  onChange: (value: CreatureFilter) => void;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className="filter-group"
      role="group"
      aria-label={t("creatures.filterLabel")}
    >
      {filters.map(({ value: option, label, icon: Icon }) => (
        <button
          key={option}
          className={`filter-button ${value === option ? "active" : ""}`}
          aria-pressed={value === option}
          onClick={() => onChange(option)}
        >
          <Icon size={15} />
          {t(label)}
        </button>
      ))}
    </div>
  );
};

type CreatureFeed = ReturnType<typeof useCreatureFeed>;

const FeedGrid = ({
  filter,
  feed,
}: {
  filter: CreatureFilter;
  feed: CreatureFeed;
}) => {
  const { t } = useTranslation();
  if (feed.loading)
    return (
      <div
        className="film-grid"
        aria-label={t("common.loadingMovies")}
        aria-busy="true"
      >
        {Array.from({ length: 20 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  const films = feed.failed
    ? creatureFilms.filter(
        (film) => filter === "all" || film.collection === filter,
      )
    : feed.films;
  return (
    <>
      {feed.failed && (
        <p className="inline-notice" role="status">
          {t("creatures.feedUnavailable")}{" "}
          <button className="text-button" onClick={feed.retry}>
            {t("common.retry")}
          </button>
        </p>
      )}
      <div className="film-grid">
        {films.map((film) => (
          <Card key={filmKey(film)} {...film} />
        ))}
      </div>
    </>
  );
};

export const CreaturesPage = () => {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const kind = params.get("kind");
  const filter: CreatureFilter =
    kind === "sharks" || kind === "titans" ? kind : "all";
  const page = Math.max(1, Math.min(500, Number(params.get("page")) || 1));
  const feed = useCreatureFeed(filter, page, true);
  // Totals are the same on every page, so keep them while the next page loads.
  const [totals, setTotals] = useState<
    Partial<Record<CreatureFilter, { total: number; pages: number }>>
  >({});
  const known = totals[filter];

  useEffect(() => {
    if (!feed.loading && !feed.failed)
      setTotals((current) => ({
        ...current,
        [filter]: { total: feed.total, pages: feed.pages },
      }));
  }, [feed.loading, feed.failed, feed.total, feed.pages, filter]);

  useEffect(() => {
    document.title = `${t("nav.creatures")} | ${SITE_NAME}`;
  }, [t]);

  return (
    <div className="page-container collection-page">
      <section
        className="catalog-section creature-section full-collection"
        aria-labelledby="creature-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              <span className="live-dot" />
              {t("nav.creatures")}
            </p>
            <h1 id="creature-title">{t("creatures.title")}</h1>
            <p className="section-description">{t("creatures.description")}</p>
          </div>
          {known && !feed.failed ? (
            <span className="collection-count">
              {t("creatures.count", { count: known.total })}
            </span>
          ) : (
            feed.loading && (
              <span
                className="collection-count text-skeleton"
                aria-hidden="true"
              />
            )
          )}
        </div>
        <div className="collection-toolbar">
          <CreatureFilters
            value={filter}
            onChange={(value) =>
              setParams(value === "all" ? {} : { kind: value }, {
                preventScrollReset: true,
              })
            }
          />
        </div>
        <FeedGrid filter={filter} feed={feed} />
        {known && !feed.failed && known.pages > 1 && (
          <Pagination
            className="catalog-pagination"
            aria-label={t("pagination.label")}
            getItemAriaLabel={paginationLabel}
            disabled={feed.loading}
            count={known.pages}
            page={Math.min(page, known.pages)}
            onChange={(_event, nextPage) => {
              setParams(
                filter === "all"
                  ? { page: String(nextPage) }
                  : { kind: filter, page: String(nextPage) },
              );
              window.scrollTo({
                top: 0,
                behavior: "instant" as ScrollBehavior,
              });
            }}
          />
        )}
      </section>
    </div>
  );
};
