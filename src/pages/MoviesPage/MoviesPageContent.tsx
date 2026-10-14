import { MoviesData } from "@/api/moviesService";
import { Card, CardSkeleton } from "@/components";
import { INITIAL_PAGE, MoviesPageType, SITE_NAME } from "@/constants";
import { Pagination } from "@mui/material";
import { FC, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { getGenreNames } from "@/data/catalog";
import { useTranslation } from "react-i18next";
import { getLanguage, paginationLabel } from "@/i18n";

type MoviesPageContentProps = {
  currentPage: MoviesPageType;
  isLoading: boolean;
  content: null | MoviesData;
  getContent: (page: number) => void;
};

export const MoviesPageContent: FC<MoviesPageContentProps> = ({
  currentPage,
  isLoading,
  content,
  getContent,
}) => {
  const { t } = useTranslation();
  const pageTitle = t(`movies.${currentPage}`);

  useEffect(() => {
    !content && getContent(INITIAL_PAGE);
    document.title = `${pageTitle} | ${SITE_NAME}`;
  }, [content, currentPage, pageTitle]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    getContent(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="page-container browse-page">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{t("footer.tagline")}</p>
          <h1>{pageTitle}</h1>
        </div>
      </div>
      <nav className="category-nav" aria-label={t("movies.categories")}>
        <NavLink to="/movies/popular">{t("category.popular")}</NavLink>
        <NavLink to="/movies/now-playing">{t("category.theaters")}</NavLink>
        <NavLink to="/movies/upcoming">{t("category.upcoming")}</NavLink>
        <NavLink to="/movies/top-rated">{t("category.topRated")}</NavLink>
      </nav>
      <div className="film-grid" aria-busy={isLoading}>
        {isLoading
          ? Array.from({ length: 12 }, (_, index) => (
              <CardSkeleton key={index} />
            ))
          : content?.results.map(
              ({
                id,
                title,
                poster_path,
                backdrop_path,
                overview,
                genre_ids,
                release_date,
                vote_average,
              }) => (
                <Card
                  key={id}
                  id={id}
                  language={getLanguage()}
                  genres={getGenreNames(genre_ids)}
                  backdrop={backdrop_path}
                  overview={overview}
                  poster={poster_path}
                  title={title}
                  date={release_date}
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
        count={
          content && content.total_pages > 500 ? 500 : content?.total_pages
        }
        page={content?.page || INITIAL_PAGE}
        onChange={handlePageChange}
      />
    </div>
  );
};
