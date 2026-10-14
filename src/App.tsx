import { Link, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/Brand/Brand";
import {
  ERROR_CODE_404,
  INITIAL_PAGE_PATH,
  MOVIES_PAGE_PATH,
  TV_PAGE_PATH,
} from "@/constants";
import { CreaturesPage, ErrorPage, InitialPage, MoviesPage, TvPage } from "@/pages";
import { Header, Main } from "@/layouts";
import { useTranslation } from "react-i18next";

export const App = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <Header />
      <Main>
        <Routes>
          <Route path={INITIAL_PAGE_PATH} element={<InitialPage />} />
          <Route path="/creatures" element={<CreaturesPage />} />
          <Route path="/watchlist" element={<InitialPage />} />
          <Route path="/search" element={<InitialPage />} />
          <Route path={`${MOVIES_PAGE_PATH}/:page`} element={<MoviesPage />} />
          <Route path={`${TV_PAGE_PATH}/:page`} element={<TvPage />} />

          <Route path="*" element={<ErrorPage errorCode={ERROR_CODE_404} />} />
        </Routes>
      </Main>
      <footer className="site-footer page-container">
        <div>
          <Link to="/" className="brand" aria-label={t("nav.home")}>
            <Brand size={23} />
          </Link>
          <p>{t("footer.tagline")}</p>
        </div>
        <div className="footer-links">
          <Link to="/creatures">{t("nav.creatures")}</Link>
          <Link to="/watchlist">{t("nav.myWatchlist")}</Link>
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
            {t("footer.source")} <ArrowUpRight size={13} />
          </a>
        </div>
        <p className="tmdb-disclaimer">{t("footer.disclaimer")}</p>
      </footer>
    </>
  );
};
