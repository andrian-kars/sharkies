import { Film, creatureFilms, editorPicks, filmKey } from "@/data/catalog";
import { Language } from ".";

const ukrainianFilms: Record<number, { title: string; overview?: string }> = {
  823464: {
    title: "Ґодзілла та Конґ: Нова імперія",
    overview:
      "Два титани. Один неможливий союз. Ґодзілла та Конґ повертаються, щоб протистояти загрозі, прихованій у глибинах нашого світу.",
  },
  615656: {
    title: "Мег 2: Западина",
    overview:
      "Що глибше вони занурюються, то більшою стає небезпека. Експедиція в незвідані води повертає прадавнього хижака на поверхню.",
  },
  293167: { title: "Конг: Острів черепа" },
  345940: { title: "Мег" },
  399566: { title: "Ґодзілла проти Конґа" },
  578: { title: "Щелепи" },
  68726: {
    title: "Тихоокеанський рубіж",
    overview:
      "Коли з Тихого океану виходять монстри, людство створює власних велетнів. Остання лінія оборони тримається на відвазі їхніх пілотів.",
  },
  332567: { title: "Мілина" },
  254: { title: "Кінг Конг" },
  8914: { title: "Глибоке синє море" },
  124905: { title: "Ґодзілла" },
  403119: { title: "Синя безодня" },
  693134: { title: "Дюна: Частина друга" },
  911430: { title: "F1: Фільм" },
  1233413: { title: "Грішники" },
  157336: { title: "Інтерстеллар" },
  1184918: { title: "Дикий робот" },
  414906: { title: "Бетмен" },
};

const genres: Record<string, string> = {
  Action: "Бойовик",
  Adventure: "Пригоди",
  Animation: "Мультфільм",
  Comedy: "Комедія",
  Crime: "Кримінал",
  Documentary: "Документальний",
  Drama: "Драма",
  Family: "Сімейний",
  Fantasy: "Фентезі",
  History: "Історичний",
  Horror: "Жахи",
  Music: "Музика",
  Mystery: "Детектив",
  Romance: "Мелодрама",
  "Sci-Fi": "Фантастика",
  "Science Fiction": "Фантастика",
  "TV Movie": "Телефільм",
  Thriller: "Трилер",
  War: "Військовий",
  Western: "Вестерн",
  "Action & Adventure": "Бойовик і пригоди",
  "Sci-Fi & Fantasy": "Фантастика і фентезі",
  Kids: "Дитячий",
  News: "Новини",
  Reality: "Реаліті",
  Soap: "Мильна опера",
  Talk: "Ток-шоу",
  "War & Politics": "Війна і політика",
};

export const translateGenre = (genre: string, language: Language) =>
  language === "uk"
    ? genres[genre] || genre
    : Object.entries(genres).find(
        ([, translated]) => translated === genre,
      )?.[0] || genre;

export const isCuratedFilm = (film: Film) =>
  film.mediaType !== "tv" && Boolean(ukrainianFilms[film.id]);

export function localizeFilm(film: Film, language: Language): Film {
  const original = isCuratedFilm(film)
    ? [...creatureFilms, ...editorPicks].find(
        (item) => filmKey(item) === filmKey(film),
      )
    : undefined;
  const translated =
    original && language === "uk" ? ukrainianFilms[film.id] : original;
  return {
    ...film,
    ...(translated
      ? {
          title: translated.title,
          overview:
            translated.overview ??
            (film.language === language ? film.overview : undefined),
        }
      : {}),
    genres: film.genres?.map((genre) => translateGenre(genre, language)),
  };
}
