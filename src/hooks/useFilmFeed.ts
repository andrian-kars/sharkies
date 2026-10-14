import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ListCardsGeneralData } from "@/api/config";
import { ApiFilm, Film, toFilm } from "@/data/catalog";
import { getLanguage } from "@/i18n";

type FeedResponse = { data: ListCardsGeneralData & { results: ApiFilm[] } };
type Feed = {
  key: string;
  films: Film[];
  total: number;
  pages: number;
  failed: boolean;
};

export function useFilmFeed(
  key: string | null,
  load: (signal: AbortSignal) => Promise<FeedResponse>,
  { keepPrevious = false } = {},
) {
  const { t } = useTranslation();
  const language = getLanguage();
  const [attempt, setAttempt] = useState(0);
  const [feed, setFeed] = useState<Feed | null>(null);
  // The key must encode every input of `load`; a result is shown only for the request that produced it.
  const requestKey = key && `${key}:${language}:${attempt}`;

  useEffect(() => {
    if (!requestKey) {
      if (keepPrevious) setFeed(null);
      return;
    }
    const controller = new AbortController();
    load(controller.signal)
      .then(({ data }) =>
        setFeed({
          key: requestKey,
          films: data.results
            .filter((film) => !film.adult && film.media_type !== "person")
            .map((film) => toFilm(film, language, t("common.untitled"))),
          total: data.total_results,
          pages: Math.min(data.total_pages, 500),
          failed: false,
        }),
      )
      .catch(() => {
        if (!controller.signal.aborted)
          setFeed({
            key: requestKey,
            films: [],
            total: 0,
            pages: 0,
            failed: true,
          });
      });
    return () => controller.abort();
  }, [requestKey]);

  const current = feed?.key === requestKey ? feed : null;
  const previous = keepPrevious && !current && feed && !feed.failed ? feed : null;
  return {
    loading: Boolean(requestKey) && !current,
    failed: Boolean(current?.failed),
    films: current?.films ?? [],
    total: current?.total ?? 0,
    pages: current?.pages ?? 0,
    stale: requestKey && previous ? previous.films : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
