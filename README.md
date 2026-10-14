<p align="center">
  <img src="public/favicon.svg" width="120" height="120" alt="Sharkies logo"/>
</p>
<h2 align="center">Sharkies</h2>

<p align="center">
  Shark, megalodon, and giant-monster films, plus a full movie and series library (The Movie Database API).
  <br>
  <a href="https://andrian-kars.github.io/sharkies/"><strong>« Explore Sharkies »</strong></a>
</p>

## React / TypeScript / Grid / TMDB API

API was provided by [TMDB](https://www.themoviedb.org/).

## Local Development

```sh
yarn install
yarn dev
```

The discovery page features shark and giant-monster films first: a creature
spotlight, the newest creature releases, and live weekly trends. Creature
Features lists TMDB shark/megalodon and Kong/Godzilla/kaiju films newest first,
with pagination at `/creatures?kind=sharks` and `/creatures?kind=titans`.
All creatures (`/creatures`) is also paginated: both catalogues are fetched
once per language, merged newest first, and deduplicated.
Only released films with at least 10 TMDB votes are included, which filters out
unrated announcements and fan films. Curated picks remain as a fallback when TMDB
is unavailable.

Search covers movies and series and updates as you type (from two characters,
350 ms after the last keystroke); Enter searches immediately. A typing session
adds one history entry, and previous results stay visible while the next query
loads. Film details include official trailer links
when available. Watchlists are stored in the current browser's local storage;
no account is required. Live metadata and artwork require access to TMDB.
If the trending feed fails, discovery shows editor picks instead.

## Languages

The header's EN / УК switch changes between English and Ukrainian without
leaving the current page. The choice persists in local storage. On the first
visit, browsers set to Ukrainian use Ukrainian; other browsers use English.

Navigation, curated film titles, genres, film details, search, watchlists, and
status messages are localized. TMDB requests use `en-US` or `uk-UA`, and cached
feeds refresh when the language changes. Ukrainian trailers are preferred when
available, with English trailers as a fallback. Watchlist entries remain shared
between languages. Oswald supplies Cyrillic display typography.

## Verification

```sh
yarn build
yarn playwright install chromium
yarn test:e2e
```

Playwright covers desktop and mobile browsing, creature filters, search, film
details, watchlist persistence, pagination, feed failures, and language switching.
Ukrainian checks cover translated metadata, saved titles, browser preferences,
and responsive typography. API responses are
stubbed for reproducibility; layout checks load real TMDB artwork and capture
screenshots in `test-results/`.
