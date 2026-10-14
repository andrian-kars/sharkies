import type { Page } from "@playwright/test";
import { creatureFilms } from "../src/data/catalog";

export const results = creatureFilms.slice(0, 6).map((film) => ({
  id: film.id,
  title: film.title,
  name: film.title,
  poster_path: film.poster,
  backdrop_path: film.backdrop,
  release_date: film.date,
  first_air_date: film.date,
  vote_average: film.vote,
  genre_ids: [28, 12],
  overview: film.overview || "An adventure of extraordinary proportions.",
  media_type: "movie",
}));

export const creatureTotals = { sharks: 155, titans: 124 };
const releaseDate = (kind: "sharks" | "titans", position: number) =>
  new Date(
    Date.UTC(2026, 6, 1) - (position * 30 + (kind === "titans" ? 15 : 0)) * 86_400_000,
  )
    .toISOString()
    .slice(0, 10);

export const discoverPage = (kind: "sharks" | "titans", page: number) => {
  const curated = creatureFilms.filter((film) => film.collection === kind);
  const theMeg = creatureFilms.find((film) => film.id === 345940)!;
  const size = Math.min(20, creatureTotals[kind] - (page - 1) * 20);
  return Array.from({ length: Math.max(size, 0) }, (_, index) => {
    const position = (page - 1) * 20 + index;
    // The Meg is tagged as both a shark and a giant monster on TMDB.
    const film = kind === "titans" && position === 6 ? theMeg : curated[position];
    const artwork = curated[position % curated.length];
    const title =
      film?.title ?? `${kind === "sharks" ? "Shark" : "Monster"} Feature ${position + 1}`;
    return {
      id: film?.id ?? (kind === "sharks" ? 700000 : 800000) + position,
      title,
      poster_path: artwork.poster,
      backdrop_path: artwork.backdrop,
      release_date: releaseDate(kind, position),
      vote_average: film?.vote ?? 6,
      genre_ids: [27, 28],
      overview: film ? "An adventure of extraordinary proportions." : "",
    };
  });
};

export async function mockTmdb(page: Page) {
  await page.route("https://api.themoviedb.org/3/**", async (route) => {
    const url = new URL(route.request().url());
    const ukrainian = url.searchParams.get("language") === "uk-UA";
    if (/\/(movie|tv)\/\d+$/.test(url.pathname)) {
      await route.fulfill({
        json: {
          ...(url.pathname.endsWith("/999001")
            ? { title: ukrainian ? "Океанська подорож" : "Ocean Journey" }
            : {}),
          overview: ukrainian
            ? "Два титани об’єднуються проти прихованої загрози."
            : "Two titans unite against a hidden threat.",
          runtime: 115,
          genres: [{ name: "Action" }, { name: "Adventure" }],
          videos: {
            results: [
              {
                site: "YouTube",
                type: "Trailer",
                official: true,
                key: "m2u6RfmTXt0",
                iso_639_1: "en",
              },
              ...(ukrainian
                ? [
                    {
                      site: "YouTube",
                      type: "Trailer",
                      official: true,
                      key: "ukrainian-trailer",
                      iso_639_1: "uk",
                    },
                  ]
                : []),
            ],
          },
        },
      });
      return;
    }
    if (url.pathname.endsWith("/discover/movie")) {
      const kind = url.searchParams.get("with_keywords")?.includes("15097")
        ? "sharks"
        : "titans";
      const page = Number(url.searchParams.get("page")) || 1;
      await route.fulfill({
        json: {
          results: discoverPage(kind, page),
          page,
          total_pages: Math.ceil(creatureTotals[kind] / 20),
          total_results: creatureTotals[kind],
        },
      });
      return;
    }
    const query = url.searchParams.get("query")?.toLowerCase();
    const titles = [
      "Ґодзілла та Конґ: Нова імперія",
      "Мег 2: Западина",
      "Конг: Острів черепа",
      "Мег",
      "Ґодзілла проти Конґа",
      "Щелепи",
    ];
    const localizedResults = ukrainian
      ? results.map((film, index) => ({
          ...film,
          title: titles[index],
          name: titles[index],
        }))
      : results;
    const filtered = url.pathname.includes("search")
      ? [
          ...localizedResults.filter((film) =>
            film.title.toLowerCase().includes(query || ""),
          ),
          { id: 99, name: "A Person", media_type: "person" },
        ]
      : localizedResults;
    await route.fulfill({
      json: {
        results: filtered,
        page: Number(url.searchParams.get("page")) || 1,
        total_pages: 3,
        total_results: 18,
      },
    });
  });
}
