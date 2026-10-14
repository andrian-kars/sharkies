import { useSyncExternalStore } from "react";
import { Film, filmKey } from "@/data/catalog";

const storageKey = "movies:watchlist";
const listeners = new Set<() => void>();

function readFilms(): Film[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(storageKey) || "[]",
    );
    return Array.isArray(stored)
      ? stored.filter(
          (film): film is Film =>
            film &&
            typeof film.id === "number" &&
            typeof film.title === "string" &&
            typeof film.date === "string" &&
            typeof film.vote === "number" &&
            (film.poster === null || typeof film.poster === "string"),
        )
      : [];
  } catch {
    return [];
  }
}

let snapshot = { films: readFilms(), persistent: true };
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

window.addEventListener("storage", (event) => {
  if (event.key === storageKey || event.key === null) {
    snapshot = { films: readFilms(), persistent: true };
    notify();
  }
});

export function useWatchlist() {
  const current = useSyncExternalStore(subscribe, () => snapshot);
  const isSaved = (film: Film) =>
    current.films.some((saved) => filmKey(saved) === filmKey(film));
  const toggle = (film: Film) => {
    const exists = snapshot.films.some(
      (saved) => filmKey(saved) === filmKey(film),
    );
    const films = exists
      ? snapshot.films.filter((saved) => filmKey(saved) !== filmKey(film))
      : [...snapshot.films, film];
    let persistent = true;
    try {
      localStorage.setItem(storageKey, JSON.stringify(films));
    } catch {
      persistent = false;
    }
    snapshot = { films, persistent };
    notify();
  };
  return { ...current, isSaved, toggle };
}
