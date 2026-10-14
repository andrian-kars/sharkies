<p align="center">
  <img src="public/favicon.svg" width="120" height="120" alt="Sharkies logo"/>
</p>
<h2 align="center">Sharkies</h2>

<p align="center">
  Shark, megalodon, and giant-monster films, plus a full movie and series library (The Movie Database API).
  <br>
  <a href="https://andrian-kars.com/sharkies"><strong>« Explore Sharkies »</strong></a>
</p>

[![Checks and deploy](https://github.com/andrian-kars/sharkies/actions/workflows/ci.yml/badge.svg)](https://github.com/andrian-kars/sharkies/actions/workflows/ci.yml)

**Live:** [andrian-kars.com/sharkies](https://andrian-kars.com/sharkies)

## Features

The discovery page features shark and giant-monster films first: a creature spotlight, the newest creature releases, and live weekly trends. Creature Features lists TMDB shark/megalodon and Kong/Godzilla/kaiju films newest first, with pagination at `/creatures?kind=sharks` and `/creatures?kind=titans`. All creatures (`/creatures`) is also paginated: both catalogues are fetched once per language, merged newest first, and deduplicated. Only released films with at least 10 TMDB votes are included, which filters out unrated announcements and fan films. Curated picks remain as a fallback when TMDB is unavailable.

Search covers movies and series and updates as you type (from two characters, 350 ms after the last keystroke); Enter searches immediately. A typing session adds one history entry, and previous results stay visible while the next query loads. Film details include official trailer links when available. Watchlists are stored in the current browser's local storage; no account is required. If the trending feed fails, discovery shows editor picks instead.

### Languages

The header's EN / УК switch changes between English and Ukrainian without leaving the current page. The choice persists in local storage. On the first visit, browsers set to Ukrainian use Ukrainian; other browsers use English.

Navigation, curated film titles, genres, film details, search, watchlists, and status messages are localized. TMDB requests use `en-US` or `uk-UA`, and cached feeds refresh when the language changes. Ukrainian trailers are preferred when available, with English trailers as a fallback. Watchlist entries remain shared between languages. Oswald supplies Cyrillic display typography.

## Stack

- React 18 and TypeScript in strict mode, built with Vite
- Redux Toolkit for movie and series lists, React Router, Material UI
- i18next for English and Ukrainian
- Self-hosted variable fonts (Manrope, Oswald, Bebas Neue)
- Film data and artwork from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.

## Quality

Every push and pull request runs ESLint, a type check, Prettier, a production build and the Playwright suite against that build in Chromium, WebKit (Safari) and a mobile viewport. A failing check blocks the deploy. The tests cover:

- creature catalogues, pagination, sorting and feed failures
- type-to-search, history entries and stale-result handling
- film details, watchlist persistence and language switching
- loading skeletons for lists, counts, posters and film details
- automated WCAG 2.2 AA checks with axe on every screen in both languages, including the film dialog, plus keyboard focus and the skip link
- layouts from 320px to 1920px without overflow
- social metadata and the share image

API responses are stubbed for reproducibility; layout checks load real TMDB artwork and capture screenshots in `test-results/`.

## Getting started

Requires Node.js 24 (see `.nvmrc`).

```sh
yarn install
yarn dev
```

## Scripts

| Command          | What it does                                          |
| :--------------- | :---------------------------------------------------- |
| `yarn dev`       | Development server                                    |
| `yarn build`     | Type check and production build                       |
| `yarn preview`   | Serve the production build                            |
| `yarn lint`      | ESLint                                                |
| `yarn typecheck` | `tsc --noEmit`                                        |
| `yarn format`    | Format with Prettier (`format:check` to verify only)  |
| `yarn test:e2e`  | Playwright suite (dev server locally, build under CI) |

Run `npx playwright install chromium webkit` before the first `yarn test:e2e`.

## Project structure

```text
src/api/         TMDB clients, including the creature catalogue queries
src/components/  film card and detail dialog, brand mark
src/data/        curated films, genre names and TMDB mapping
src/hooks/       film feeds, creature feeds, watchlist
src/i18n/        English and Ukrainian copy and catalogue translations
src/layouts/     header and main
src/pages/       discovery, creatures, movie and series lists, errors
src/redux/       list state, reset when the language changes
tests/           Playwright end-to-end and accessibility tests
public/          favicon, touch icon and share image
```

## Deployment

Pushes to `main` that pass every check deploy to GitHub Pages with the workflow in `.github/workflows/ci.yml`. The build uses the repository name as its base path, and `404.html` is a copy of the app so deep links work. [andrian-kars.com](https://andrian-kars.com) forwards `/sharkies` to that build.

Set `VITE_BASE` to build for another path, for example `VITE_BASE=/ yarn build` for a domain root.
