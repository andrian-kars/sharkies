import { expect, test } from "@playwright/test";
import { creatureFilms } from "../src/data/catalog";

const results = creatureFilms.slice(0, 6).map((film) => ({
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

const creatureTotals = { sharks: 155, titans: 124 };
const releaseDate = (kind: "sharks" | "titans", position: number) =>
  new Date(
    Date.UTC(2026, 6, 1) -
      (position * 30 + (kind === "titans" ? 15 : 0)) * 86_400_000,
  )
    .toISOString()
    .slice(0, 10);

const discoverPage = (kind: "sharks" | "titans", page: number) => {
  const curated = creatureFilms.filter((film) => film.collection === kind);
  const theMeg = creatureFilms.find((film) => film.id === 345940)!;
  const size = Math.min(20, creatureTotals[kind] - (page - 1) * 20);
  return Array.from({ length: Math.max(size, 0) }, (_, index) => {
    const position = (page - 1) * 20 + index;
    // The Meg is tagged as both a shark and a giant monster on TMDB.
    const film =
      kind === "titans" && position === 6 ? theMeg : curated[position];
    const artwork = curated[position % curated.length];
    const title =
      film?.title ??
      `${kind === "sharks" ? "Shark" : "Monster"} Feature ${position + 1}`;
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

test.beforeEach(async ({ page }) => {
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
});

test("discovery renders real artwork without overlap or overflow", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(page.locator(".film-card")).toHaveCount(12);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".spotlight-image")).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator(".spotlight-image")
        .evaluate((element) => (element as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  const sizes =
    testInfo.project.name === "mobile" ? [320, 390] : [768, 1440, 1920];
  for (const width of sizes) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    const layout = await page.evaluate(() => {
      const actions = document
        .querySelector(".spotlight-actions")!
        .getBoundingClientRect();
      const controls = document
        .querySelector(".spotlight-bottom")!
        .getBoundingClientRect();
      const hero = document
        .querySelector(".spotlight")!
        .getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        separated: actions.bottom < controls.top,
        nextSectionVisible: hero.bottom < innerHeight,
      };
    });
    expect(layout, `layout at ${width}px`).toEqual({
      overflow: false,
      separated: true,
      nextSectionVisible: true,
    });
  }
  await page.setViewportSize(
    testInfo.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1440, height: 1000 },
  );
  await page.locator(".deep-sea-feature").scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page.evaluate(() =>
        [...document.querySelectorAll(".poster-button img")].every(
          (image) =>
            (image as HTMLImageElement).complete &&
            (image as HTMLImageElement).naturalWidth > 0,
        ),
      ),
    )
    .toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("discovery.png"),
    fullPage: true,
  });
});

test("creature collection shows the full paginated shark and monster catalogues", async ({
  page,
}) => {
  const discoverRequests: URL[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/discover/movie"))
      discoverRequests.push(new URL(request.url()));
  });
  await page.goto("/creatures");
  const titles = page.locator(".film-card h3");
  await expect(page.locator(".film-card")).toHaveCount(20);
  await expect(page.getByText("278 FILMS / NEWEST FIRST")).toBeVisible();
  await expect(titles.first()).toHaveText("Meg 2: The Trench");
  await expect(titles.nth(1)).toHaveText("Godzilla x Kong: The New Empire");
  await expect(
    page.getByRole("heading", { name: "The Meg", exact: true }),
  ).toHaveCount(1);
  expect(discoverRequests).toHaveLength(15);
  await page.getByRole("button", { name: "Go to page 2", exact: true }).click();
  await expect(page).toHaveURL(/\/creatures\?page=2$/);
  await expect(titles.first()).toHaveText("Monster Feature 11");
  await page
    .getByRole("button", { name: "Go to page 14", exact: true })
    .click();
  await expect(page.locator(".film-card")).toHaveCount(18);
  await expect(page.getByText("278 FILMS / NEWEST FIRST")).toBeVisible();
  expect(discoverRequests).toHaveLength(15);
  await page.getByRole("button", { name: "Sharks & deep sea" }).click();
  await expect(page).toHaveURL(/kind=sharks/);
  await expect(page.locator(".film-card")).toHaveCount(20);
  await expect(page.getByText("155 FILMS / NEWEST FIRST")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "King Kong", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Go to page 2", exact: true }).click();
  await expect(page).toHaveURL(/kind=sharks&page=2/);
  await expect(
    page.getByRole("heading", { name: "Shark Feature 21", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sharks & deep sea" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "page 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page.getByRole("button", { name: "Giant monsters" }).click();
  await expect(page).toHaveURL(/\?kind=titans$/);
  await expect(page.locator(".film-card")).toHaveCount(20);
  await expect(page.getByText("124 FILMS / NEWEST FIRST")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "King Kong", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toHaveCount(0);
  const sharkRequest = discoverRequests.find((url) =>
    url.searchParams.get("with_keywords")?.includes("324727"),
  );
  expect(sharkRequest?.searchParams.get("sort_by")).toBe(
    "primary_release_date.desc",
  );
  expect(sharkRequest?.searchParams.get("vote_count.gte")).toBe("10");
  expect(sharkRequest?.searchParams.get("primary_release_date.lte")).toMatch(
    /^\d{4}-\d{2}-\d{2}$/,
  );
  expect(sharkRequest?.searchParams.get("without_genres")).toBe("16,10751,99");
});

test("a creature feed outage falls back to curated picks and retries", async ({
  page,
}) => {
  await page.route("**/discover/movie**", (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.goto("/creatures?kind=sharks");
  await expect(
    page.getByText("The full collection is unavailable right now.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(page.locator(".film-card")).toHaveCount(6);
  await expect(page.getByText("FILMS / NEWEST FIRST")).toHaveCount(0);
  await page.unroute("**/discover/movie**");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.locator(".film-card")).toHaveCount(20);
  await expect(page.getByText("155 FILMS / NEWEST FIRST")).toBeVisible();
});

test("loading shows skeletons for counts, cards, posters, and film details", async ({
  page,
}) => {
  const gate = () => {
    let release = () => {};
    const pending = new Promise<void>((resolve) => (release = resolve));
    return { pending, release };
  };
  const feed = gate();
  const images = gate();
  const details = gate();
  await page.route("**/discover/movie**", async (route) => {
    await feed.pending;
    await route.fallback();
  });
  await page.route("https://image.tmdb.org/**", async (route) => {
    await images.pending;
    await route.continue();
  });
  await page.route(/api\.themoviedb\.org\/3\/movie\/\d+\?/, async (route) => {
    await details.pending;
    await route.fallback();
  });

  await page.goto("/creatures?kind=sharks");
  await expect(page.locator(".film-skeleton")).toHaveCount(20);
  await expect(page.locator(".collection-count.text-skeleton")).toBeVisible();
  feed.release();
  await expect(page.locator(".film-card")).toHaveCount(20);
  await expect(page.getByText("155 FILMS / NEWEST FIRST")).toBeVisible();
  const firstPoster = page.locator(".poster-button").first();
  await expect(firstPoster).toHaveClass(/is-loading/);
  images.release();
  await expect(firstPoster).not.toHaveClass(/is-loading/);

  await page
    .getByRole("button", { name: "View details for Shark Feature 7" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Shark Feature 7" });
  await expect(dialog.locator(".synopsis-skeleton")).toBeVisible();
  await expect(dialog.locator(".meta-skeleton")).toBeVisible();
  details.release();
  await expect(
    dialog.getByText("Two titans unite against a hidden threat."),
  ).toBeVisible();
  await expect(dialog.getByText("115 min")).toBeVisible();
  await expect(dialog.locator(".text-skeleton")).toHaveCount(0);
});

test("Sharkies home features the newest creatures from both collections", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ \| Sharkies$/);
  await expect(
    page.getByRole("link", { name: "Sharkies home" }).first(),
  ).toBeVisible();
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    "/favicon.svg",
  );
  expect((await page.request.get("/favicon.svg")).ok()).toBe(true);
  const preview = page.locator(".creature-section .film-card h3");
  await expect(preview).toHaveText([
    "Meg 2: The Trench",
    "Godzilla x Kong: The New Empire",
    "The Meg",
    "Kong: Skull Island",
    "Jaws",
    "Godzilla vs. Kong",
  ]);
  await page.getByRole("button", { name: "Sharks & deep sea" }).click();
  await expect(preview).toHaveText([
    "Meg 2: The Trench",
    "The Meg",
    "Jaws",
    "The Shallows",
    "Deep Blue Sea",
    "47 Meters Down",
  ]);
  await page.getByRole("button", { name: "Giant monsters" }).click();
  await expect(
    page.getByRole("link", { name: "Explore collection" }),
  ).toHaveAttribute("href", "/creatures?kind=titans");
  await page.getByRole("link", { name: "Explore collection" }).click();
  await expect(
    page.getByRole("button", { name: "Giant monsters" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".film-card")).toHaveCount(20);
});

test("watchlist persists, avoids duplicates, and supports removal", async ({
  page,
}) => {
  await page.goto("/creatures?kind=sharks");
  await page
    .getByRole("button", { name: "Save Jaws to watchlist", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "My watchlist, 1 saved title" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "My watchlist, 1 saved title" }).click();
  await expect(page.locator(".film-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "My watchlist 1", level: 1 }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Remove Jaws from watchlist", exact: true })
    .click();
  await expect(page.getByText("No films in your watchlist yet.")).toBeVisible();
  await page.reload();
  await expect(page.locator(".film-card")).toHaveCount(0);
});

test("spotlight changes films and opens an accessible detail dialog", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "Godzilla x Kong The New Empire",
      level: 1,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next featured film" }).click();
  await expect(page.locator(".spotlight-title")).toContainText("Meg 2");
  await page.getByRole("button", { name: "Previous featured film" }).click();
  await page.getByRole("button", { name: "Explore the film" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Godzilla x Kong: The New Empire",
  });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("115 min")).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Watch trailer" }),
  ).toHaveAttribute("href", "https://www.youtube.com/watch?v=m2u6RfmTXt0");
  await dialog.getByRole("button", { name: "Watchlist", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Saved", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Explore the film" }),
  ).toBeFocused();
  await expect(
    page.getByRole("button", { name: "In my watchlist" }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("search returns movies, excludes people, and handles no matches", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Open search" }).click();
  await page
    .getByRole("searchbox", { name: "Search movies and series" })
    .fill("Jaws");
  await page
    .getByRole("searchbox", { name: "Search movies and series" })
    .press("Enter");
  await expect(page).toHaveURL(/search\?q=Jaws/);
  await expect(page.locator(".film-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toBeVisible();
  await page.goto("/search?q=no-match");
  await expect(
    page.getByRole("heading", { name: "No matches this time." }),
  ).toBeVisible();
});

const openSearch = async (
  page: import("@playwright/test").Page,
  mobile: boolean,
) => {
  if (mobile) await page.getByRole("button", { name: "Open search" }).click();
  return page.getByRole("searchbox", { name: "Search movies and series" });
};

test("type to search shows results without pressing Enter", async ({
  page,
}, testInfo) => {
  await page.goto("/creatures");
  const searchbox = await openSearch(page, testInfo.project.name === "mobile");
  await searchbox.pressSequentially("J");
  await page.waitForTimeout(600);
  await expect(page).toHaveURL(/\/creatures$/);

  await searchbox.pressSequentially("aws ");
  await expect(page).toHaveURL(/\/search\?q=Jaws$/);
  await expect(page.locator(".film-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").filter({ hasText: "Showing" }),
  ).toHaveText('Showing 1 title for "Jaws"');
  await expect(searchbox).toHaveValue("Jaws ");
  await expect(searchbox).toBeFocused();

  await searchbox.pressSequentially("x");
  await expect(page).toHaveURL(/\/search\?q=Jaws%20x$/);
  await expect(
    page.getByRole("heading", { name: "No matches this time." }),
  ).toBeVisible();
  await expect(searchbox).toHaveValue("Jaws x");

  await searchbox.clear();
  await expect(page).toHaveURL(/\/search$/);
  await expect(
    page.getByRole("heading", { name: "What are you in the mood for?" }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/creatures$/);
  await expect(searchbox).toHaveValue("");
});

test("type to search keeps previous results while the next query loads", async ({
  page,
}, testInfo) => {
  await page.goto("/search?q=Meg");
  await expect(page.locator(".film-card")).toHaveCount(2);
  let release = () => {};
  const pending = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/search/multi?query=Jaws**", async (route) => {
    await pending;
    await route.fallback();
  });
  const searchbox = await openSearch(page, testInfo.project.name === "mobile");
  await searchbox.fill("Jaws");
  await expect(page.locator(".film-grid.is-refreshing")).toBeVisible();
  await expect(page.locator(".film-card")).toHaveCount(2);
  await expect(page.locator(".film-skeleton")).toHaveCount(0);
  release();
  await expect(page.locator(".film-grid.is-refreshing")).toHaveCount(0);
  await expect(page.locator(".film-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toBeVisible();
});

test("leaving mid-typing cancels the pending live search", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const searchbox = await openSearch(page, testInfo.project.name === "mobile");
  await searchbox.pressSequentially("Kong");
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Close search" }).click();
  await page.getByRole("link", { name: "Series", exact: true }).click();
  await expect(page).toHaveURL(/\/tv\/popular$/);
  await page.waitForTimeout(600);
  await expect(page).toHaveURL(/\/tv\/popular$/);
});

test("search never shows the previous feed while new results load", async ({
  page,
}, testInfo) => {
  let release = () => {};
  const pending = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/search/multi**", async (route) => {
    await pending;
    await route.fallback();
  });
  await page.goto("/");
  await expect(page.locator(".trending-section .film-card")).toHaveCount(6);
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Open search" }).click();
  await page
    .getByRole("searchbox", { name: "Search movies and series" })
    .fill("Jaws");
  await page
    .getByRole("searchbox", { name: "Search movies and series" })
    .press("Enter");
  await expect(page).toHaveURL(/search\?q=Jaws/);
  await expect(page.locator(".film-skeleton").first()).toBeVisible();
  await expect(page.locator(".film-card")).toHaveCount(0);
  release();
  await expect(page.locator(".film-card")).toHaveCount(1);
});

test("invalid categories are 404s and failed feeds can be retried", async ({
  page,
}) => {
  await page.goto("/movies/nope");
  await expect(
    page.getByRole("heading", { name: "This page was not found." }),
  ).toBeVisible();
  await page.goto("/tv/nope");
  await expect(
    page.getByRole("heading", { name: "This page was not found." }),
  ).toBeVisible();

  for (const [path, endpoint, heading] of [
    [
      "/tv/popular",
      "https://api.themoviedb.org/3/tv/popular**",
      "Popular TV Shows",
    ],
    [
      "/movies/upcoming",
      "https://api.themoviedb.org/3/movie/upcoming**",
      "Upcoming Movies",
    ],
  ]) {
    await page.route(endpoint, (route) =>
      route.fulfill({ status: 500, json: {} }),
    );
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "Something went wrong." }),
    ).toBeVisible();
    await page.unroute(endpoint);
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(page.locator(".film-card")).toHaveCount(6);
    await expect(page).toHaveTitle(`${heading} | Sharkies`);
  }
});

test("movie and series category navigation preserves pagination", async ({
  page,
}) => {
  await page.goto("/movies/popular");
  await expect(page.locator(".film-card")).toHaveCount(6);
  await page.getByRole("link", { name: "Top rated", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Top Rated Movies" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Go to page 2", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "page 2", exact: true }),
  ).toHaveAttribute("aria-current", "true");
  await page.getByRole("link", { name: "Series", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Popular TV Shows" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Airing today", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "TV Shows Airing Today" }),
  ).toBeVisible();
  await expect(page.locator(".film-card")).toHaveCount(6);
});

test("a feed outage keeps the curated collection available", async ({
  page,
}) => {
  await page.route("**/trending/movie/week**", (route) =>
    route.fulfill({ status: 503, json: {} }),
  );
  await page.goto("/");
  await expect(
    page.getByText("Live trends are unavailable.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Dune: Part Two" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toBeVisible();
  await page.unroute("**/trending/movie/week**");
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    page.getByText("Live trends are unavailable.", { exact: false }),
  ).toHaveCount(0);
  await expect(page.locator(".trending-section .film-card")).toHaveCount(6);
});

test("Ukrainian choice persists with collection filters and saved films", async ({
  page,
}) => {
  await page.goto("/creatures?kind=sharks");
  await page
    .getByRole("button", { name: "Save Jaws to watchlist", exact: true })
    .click();
  await page
    .getByRole("button", { name: "УК (Українська)", exact: true })
    .click();
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page).toHaveURL(/creatures\?kind=sharks/);
  await expect(
    page.getByRole("button", { name: "Акули й глибини" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: "Щелепи", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Світ монстрів | Sharkies");
  await page
    .getByRole("link", { name: "Мій список, збережено: 1", exact: true })
    .click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "uk");
  await expect(page.locator(".film-card")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Щелепи", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "EN (English)", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Jaws", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".film-card")).toHaveCount(1);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("Ukrainian typography fits all spotlight slides and detail controls", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "УК (Українська)", exact: true })
    .click();
  await page.evaluate(() => document.fonts.ready);
  const widths =
    testInfo.project.name === "mobile" ? [320, 390] : [768, 1024, 1440, 1920];
  for (const width of widths) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    for (let slide = 0; slide < 3; slide += 1) {
      const layout = await page.evaluate(() => {
        const bounds = (selector: string) =>
          document.querySelector(selector)!.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          heroSeparated:
            bounds(".spotlight-actions").bottom <
            bounds(".spotlight-bottom").top,
          headerSeparated:
            bounds(".brand").right <= bounds(".header-actions").left,
          navigationFits:
            bounds(".primary-nav").bottom <= bounds(".site-header").bottom + 1,
          titleFits:
            document.querySelector(".spotlight-title")!.scrollWidth <=
            bounds(".spotlight-title").width + 1,
        };
      });
      expect(layout, `${width}px, slide ${slide}`).toEqual({
        overflow: false,
        heroSeparated: true,
        headerSeparated: true,
        navigationFits: true,
        titleFits: true,
      });
      await page
        .getByRole("button", { name: "Наступний рекомендований фільм" })
        .click();
    }
  }
  await page.setViewportSize(
    testInfo.project.name === "mobile"
      ? { width: 390, height: 844 }
      : { width: 1440, height: 1000 },
  );
  await page.screenshot({ path: testInfo.outputPath("ukrainian-home.png") });
  await page.getByRole("button", { name: "Про фільм", exact: true }).click();
  const dialog = page.getByRole("dialog", {
    name: "Ґодзілла та Конґ: Нова імперія",
  });
  await expect(
    dialog.getByText("Два титани об’єднуються проти прихованої загрози."),
  ).toBeVisible();
  await expect(dialog.getByText("115 хв", { exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Дивитися трейлер" }),
  ).toHaveAttribute(
    "href",
    "https://www.youtube.com/watch?v=ukrainian-trailer",
  );
  await page
    .getByRole("button", { name: "Закрити відомості про фільм" })
    .click();
  await page.goto("/creatures");
  await expect(
    page.getByRole("heading", { name: "Великі зуби. Ще більші проблеми." }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("ukrainian-collection.png"),
  });
});

test("Ukrainian switching refreshes movie and series metadata without duplicating watchlists", async ({
  page,
}) => {
  await page.route(/\/3\/(movie|tv)\/popular\?/, async (route) => {
    const url = new URL(route.request().url());
    const ukrainian = url.searchParams.get("language") === "uk-UA";
    const title = ukrainian ? "Океанська подорож" : "Ocean Journey";
    await route.fulfill({
      json: {
        results: [{ ...results[0], id: 999001, title, name: title }],
        page: 1,
        total_pages: 2,
        total_results: 2,
      },
    });
  });
  await page.goto("/movies/popular");
  await expect(
    page.getByRole("heading", { name: "Ocean Journey", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "УК (Українська)", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Океанська подорож", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Додати «Океанська подорож» до списку" })
    .click();
  await page.getByRole("button", { name: "EN (English)", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove Ocean Journey from watchlist" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "My watchlist, 1 saved title" }).click();
  await expect(
    page.getByRole("heading", { name: "Ocean Journey", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".film-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Series", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ocean Journey", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "УК (Українська)", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Популярні серіали", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Океанська подорож", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Перейти на сторінку 2", exact: true }),
  ).toBeVisible();
});

test("Ukrainian search and missing-page messages are translated", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "УК (Українська)", exact: true })
    .click();
  if (testInfo.project.name === "mobile")
    await page.getByRole("button", { name: "Відкрити пошук" }).click();
  await page
    .getByRole("searchbox", { name: "Пошук фільмів і серіалів" })
    .fill("Щелепи");
  const request = page.waitForRequest(
    (request) =>
      request.url().includes("search/multi") &&
      new URL(request.url()).searchParams.get("language") === "uk-UA",
  );
  await page
    .getByRole("searchbox", { name: "Пошук фільмів і серіалів" })
    .press("Enter");
  await request;
  await expect(
    page.getByRole("heading", { name: "Щелепи", exact: true }),
  ).toBeVisible();
  await page.goto("/search?q=no-match");
  await expect(
    page.getByRole("heading", { name: "Цього разу нічого не знайшлося." }),
  ).toBeVisible();
  await page.goto("/missing-page");
  await expect(
    page.getByRole("heading", { name: "Сторінку не знайдено." }),
  ).toBeVisible();
});

test.describe("Ukrainian browser preference", () => {
  test.use({ locale: "uk-UA" });
  test("selects Ukrainian on the first visit", async ({ page }) => {
    await page.goto("/creatures");
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(
      page.getByRole("button", { name: "УК (Українська)", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});
