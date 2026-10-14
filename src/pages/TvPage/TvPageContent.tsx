import { TvData } from "@/api/tvService";
import { Card, CardSkeleton } from "@/components";
import { INITIAL_PAGE, SITE_NAME, TvPageType } from "@/constants";
import { Pagination } from "@mui/material";
import { FC, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getGenreNames } from "@/data/catalog";
import { useTranslation } from "react-i18next";
import { getLanguage, paginationLabel } from "@/i18n";

type TvPageContentProps = {
  currentPage: TvPageType;
  isLoading: boolean;
  content: null | TvData;
  getContent: (page: number) => void;
};

export const TvPageContent: FC<TvPageContentProps> = ({
  currentPage,
  isLoading,
  content,
  getContent,
}) => {
  const { t } = useTranslation();
  const pageTitle = t(`tv.${currentPage}`);

  useEffect(() => {
    !content && getContent(INITIAL_PAGE);
    document.title = `${pageTitle} | ${SITE_NAME}`;
  }, [content, currentPage, pageTitle]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    getContent(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="page-container browse-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("tv.eyebrow")}</p>
          <h1>{pageTitle}</h1>
        </div>
      </div>
      <nav className="category-nav" aria-label={t("tv.categories")}>
        <NavLink to="/tv/popular">{t("category.popular")}</NavLink>
        <NavLink to="/tv/airing-today">{t("category.airingToday")}</NavLink>
        <NavLink to="/tv/on_the_air">{t("category.onTv")}</NavLink>
        <NavLink to="/tv/top-rated">{t("category.topRated")}</NavLink>
      </nav>
      <div className="film-grid" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: 12 }, (_, index) => <CardSkeleton key={index} />)
          : content?.results.map(
              ({
                id,
                name,
                poster_path,
                backdrop_path,
                overview,
                genre_ids,
                first_air_date,
                vote_average,
              }) => (
                <Card
                  key={id}
                  id={id}
                  language={getLanguage()}
                  genres={getGenreNames(genre_ids)}
                  mediaType="tv"
                  backdrop={backdrop_path}
                  overview={overview}
                  poster={poster_path}
                  title={name}
                  date={first_air_date}
                  vote={vote_average}
                />
              ),
            )}
      </div>
      <Pagination
        aria-label={t("pagination.label")}
        getItemAriaLabel={paginationLabel}
        disabled={isLoading}
        className="catalog-pagination"
        count={content && content.total_pages > 500 ? 500 : content?.total_pages}
        page={content?.page || INITIAL_PAGE}
        onChange={handlePageChange}
      />
    </div>
  );
};
