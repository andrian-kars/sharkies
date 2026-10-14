export type Film = {
  id: number;
  title: string;
  poster: string | null;
  backdrop?: string | null;
  date: string;
  vote: number;
  genres?: string[];
  overview?: string;
  mediaType?: "movie" | "tv";
  language?: "en" | "uk";
};

export type CreatureFilter = "all" | "sharks" | "titans";

export const creatureFilms: (Film & {
  collection: Exclude<CreatureFilter, "all">;
})[] = [
  {
    id: 823464,
    title: "Godzilla x Kong: The New Empire",
    poster: "/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg",
    backdrop: "/gvLG3Fnznkxl4SmYfcK8gUuqxM8.jpg",
    date: "2024-03-27",
    vote: 7.0,
    genres: ["Action", "Adventure"],
    collection: "titans",
    overview:
      "Two titans. One impossible alliance. Godzilla and Kong return to face a threat hidden deep within our world.",
  },
  {
    id: 615656,
    title: "Meg 2: The Trench",
    poster: "/4m1Au3YkjqsxF8iwQy0fPYSxE0h.jpg",
    backdrop: "/5mzr6JZbrqnqD8rCEvPhuCE5Fw2.jpg",
    date: "2023-08-02",
    vote: 6.3,
    genres: ["Action", "Sci-Fi"],
    collection: "sharks",
    overview:
      "The deeper they go, the bigger it gets. A dive into uncharted waters brings an ancient predator back to the surface.",
  },
  {
    id: 293167,
    title: "Kong: Skull Island",
    poster: "/r2517Vz9EhDhj88qwbDVj8DCRZN.jpg",
    backdrop: "/nVodCGKYLpqNC8YwQAbivKlWCgZ.jpg",
    date: "2017-03-08",
    vote: 6.6,
    genres: ["Adventure", "Action"],
    collection: "titans",
  },
  {
    id: 345940,
    title: "The Meg",
    poster: "/eyWICPcxOuTcDDDbTMOZawoOn8d.jpg",
    backdrop: "/ibKeXahq4JD63z6uWQphqoJLvNw.jpg",
    date: "2018-08-08",
    vote: 6.3,
    genres: ["Action", "Sci-Fi"],
    collection: "sharks",
  },
  {
    id: 399566,
    title: "Godzilla vs. Kong",
    poster: "/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg",
    backdrop: "/wWqTMWkEw6HouLd1zPZbZWxtAPr.jpg",
    date: "2021-03-24",
    vote: 7.5,
    genres: ["Action", "Sci-Fi"],
    collection: "titans",
  },
  {
    id: 578,
    title: "Jaws",
    poster: "/lxM6kqilAdpdhqUl2biYp5frUxE.jpg",
    backdrop: "/i1yf91svRHX45l9BXL8rVFzLoPH.jpg",
    date: "1975-06-20",
    vote: 7.7,
    genres: ["Thriller", "Adventure"],
    collection: "sharks",
  },
  {
    id: 68726,
    title: "Pacific Rim",
    poster: "/lC4ULSf5J4X9jnBOKcY3pwbAwmT.jpg",
    backdrop: "/9X7Im1YuBhyHYVD8r7CAONPJR5k.jpg",
    date: "2013-07-11",
    vote: 7.0,
    genres: ["Sci-Fi", "Action"],
    collection: "titans",
    overview:
      "When monsters rise from the Pacific, humanity builds giants of its own. The last line of defense is only as strong as the pilots inside.",
  },
  {
    id: 332567,
    title: "The Shallows",
    poster: "/bnBV7hZmLuA0Si5Aop481sPF2RY.jpg",
    backdrop: "/89ZSaf9Ofm7oDounnCOu4ktGI9e.jpg",
    date: "2016-06-24",
    vote: 6.4,
    genres: ["Thriller", "Horror"],
    collection: "sharks",
  },
  {
    id: 254,
    title: "King Kong",
    poster: "/6a2HY6UmD7XiDD3NokgaBAXEsD2.jpg",
    backdrop: "/mRM2NB0i3wv4HqxXvwIjEVi4Qqq.jpg",
    date: "2005-12-12",
    vote: 6.9,
    genres: ["Adventure", "Drama"],
    collection: "titans",
  },
  {
    id: 8914,
    title: "Deep Blue Sea",
    poster: "/fyn0zyCI4kIlbDoHH0Hzv09hDC5.jpg",
    backdrop: "/bdDTda15ZPbNumwkKa9eH9RplIe.jpg",
    date: "1999-07-28",
    vote: 6.0,
    genres: ["Horror", "Sci-Fi"],
    collection: "sharks",
  },
  {
    id: 124905,
    title: "Godzilla",
    poster: "/tphkjmQq8WebuVwNXelmjLUXuPJ.jpg",
    backdrop: "/6CLNOzMXO9bvapDD8gsdwkJU4wN.jpg",
    date: "2014-05-14",
    vote: 6.4,
    genres: ["Action", "Sci-Fi"],
    collection: "titans",
  },
  {
    id: 403119,
    title: "47 Meters Down",
    poster: "/2IgdRUTdHyoI3nFORcnnYEKOGIH.jpg",
    backdrop: "/5JIdbM1SPymEge4f0pMy23Zj26m.jpg",
    date: "2017-05-25",
    vote: 5.8,
    genres: ["Horror", "Thriller"],
    collection: "sharks",
  },
];

export const featuredFilms = [creatureFilms[0], creatureFilms[1], creatureFilms[6]];

export const editorPicks: Film[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    poster: "/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    date: "2024-02-27",
    vote: 8.1,
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: 911430,
    title: "F1",
    poster: "/9PXZIUsSDh4alB80jheWX4fhZmy.jpg",
    date: "2025-06-25",
    vote: 7.8,
    genres: ["Action", "Drama"],
  },
  {
    id: 1233413,
    title: "Sinners",
    poster: "/fWPgbnt2LSqkQ6cdQc0SZN9CpLm.jpg",
    date: "2025-04-16",
    vote: 7.5,
    genres: ["Horror", "Thriller"],
  },
  {
    id: 157336,
    title: "Interstellar",
    poster: "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    date: "2014-11-04",
    vote: 8.5,
    genres: ["Sci-Fi", "Adventure"],
  },
  {
    id: 1184918,
    title: "The Wild Robot",
    poster: "/wTnV3PCVW5O92JMrFvvrRcV39RU.jpg",
    date: "2024-09-12",
    vote: 8.3,
    genres: ["Animation", "Adventure"],
  },
  {
    id: 414906,
    title: "The Batman",
    poster: "/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    date: "2022-03-01",
    vote: 7.7,
    genres: ["Crime", "Thriller"],
  },
];

const genreNames: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10765: "Sci-Fi & Fantasy",
};

export const getGenreNames = (ids: number[]) =>
  ids.map((id) => genreNames[id]).filter(Boolean);

export type ApiFilm = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids?: number[];
  media_type?: "movie" | "tv" | "person";
  adult?: boolean;
};

export const toFilm = (film: ApiFilm, language: "en" | "uk", untitled: string): Film => ({
  id: film.id,
  title: film.title || film.name || untitled,
  poster: film.poster_path,
  backdrop: film.backdrop_path,
  date: film.release_date || film.first_air_date || "",
  vote: film.vote_average || 0,
  overview: film.overview,
  genres: getGenreNames(film.genre_ids || []),
  mediaType: film.media_type === "tv" ? "tv" : "movie",
  language,
});
export const imageUrl = (path: string, size = "w500") =>
  `https://image.tmdb.org/t/p/${size}${path}`;
export const filmKey = (film: Film) => `${film.mediaType || "movie"}:${film.id}`;
