import { fetchGetMovies, setLoading } from "@/redux/MoviesSlice";
import { RootState, useAppDispatch } from "@/redux/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { MoviesPageContent } from "./MoviesPageContent";
import {
  ERROR_CODE_404,
  MoviesPageType,
  NOW_PLAYING,
  POPULAR,
  TOP_RATED,
  UPCOMING,
} from "@/constants";
import { ErrorPage } from "..";

const ARR_OF_PAGES = [POPULAR, NOW_PLAYING, UPCOMING, TOP_RATED];

export const MoviesPage = () => {
  const dispatch = useAppDispatch();
  const params = useParams();

  const state = useSelector((state: RootState) => state.movies);
  const { isLoading, error } = state;

  if (!params.page || !ARR_OF_PAGES.includes(params.page)) {
    return <ErrorPage errorCode={ERROR_CODE_404} />;
  }

  const currentPage = params.page as MoviesPageType;
  const content = state[currentPage];

  const getContent = (page: number) => {
    dispatch(fetchGetMovies(currentPage, page));
  };

  if (error) {
    return (
      <ErrorPage
        additionalMessage={error}
        onRetry={() =>
          // Without cached content, clearing the error lets the page's mount effect fetch it.
          content ? getContent(content.page) : dispatch(setLoading(true))
        }
      />
    );
  }

  return (
    <MoviesPageContent
      currentPage={currentPage}
      isLoading={isLoading}
      content={content}
      getContent={getContent}
    />
  );
};
