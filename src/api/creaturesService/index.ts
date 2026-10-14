import { ListCardsGeneralData, moviesApi } from "@/api/config";
import { ApiFilm } from "@/data/catalog";

export type CreatureKind = "sharks" | "titans";

// TMDB keyword and genre IDs; genre limits drop shark cameos in comedies, cartoons, and documentaries.
const queries: Record<CreatureKind, Record<string, string>> = {
  sharks: {
    with_keywords: "15097|324727|2988|15098|158108",
    with_genres: "27|53|878|28",
    without_genres: "16,10751,99",
  },
  titans: {
    with_keywords: "161791|257384|293178|196425",
    without_genres: "16,10751,99",
  },
};

export const getCreatureMovies = (
  kind: CreatureKind,
  page: number,
  language: string,
  signal?: AbortSignal,
) =>
  moviesApi.get<ListCardsGeneralData & { results: ApiFilm[] }>(
    "discover/movie",
    {
      params: {
        ...queries[kind],
        include_adult: false,
        sort_by: "primary_release_date.desc",
        "primary_release_date.lte": new Date().toISOString().slice(0, 10),
        // Newest-first otherwise surfaces unrated fan films and announcements.
        "vote_count.gte": 10,
        page,
        language,
      },
      signal,
      timeout: 12000,
    },
  );

const PAGE_SIZE = 20;
const allCreatures = new Map<string, Promise<ApiFilm[]>>();

const getEveryPage = async (kind: CreatureKind, language: string) => {
  const first = await getCreatureMovies(kind, 1, language);
  const rest = await Promise.all(
    Array.from({ length: Math.min(first.data.total_pages, 500) - 1 }, (_, i) =>
      getCreatureMovies(kind, i + 2, language),
    ),
  );
  return [first, ...rest].flatMap((response) => response.data.results);
};

// TMDB cannot OR two discover queries, so the All view merges both catalogues client-side.
export const getAllCreatureMovies = (page: number, language: string) => {
  let films = allCreatures.get(language);
  if (!films) {
    films = Promise.all([
      getEveryPage("sharks", language),
      getEveryPage("titans", language),
    ]).then(([sharks, titans]) =>
      [...sharks, ...titans]
        .filter(
          (film, index, all) =>
            all.findIndex((other) => other.id === film.id) === index,
        )
        .sort((first, second) =>
          (second.release_date ?? "").localeCompare(first.release_date ?? ""),
        ),
    );
    films.catch(() => allCreatures.delete(language));
    allCreatures.set(language, films);
  }
  return films.then((all) => ({
    data: {
      results: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      page,
      total_results: all.length,
      total_pages: Math.ceil(all.length / PAGE_SIZE),
    },
  }));
};
