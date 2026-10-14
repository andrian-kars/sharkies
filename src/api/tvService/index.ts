import { ListCardsGeneralData, moviesApi } from "@/api/config";
import { INITIAL_PAGE, TvPageType } from "@/constants";
import { getApiLanguage } from "@/i18n";

export interface TvData extends ListCardsGeneralData {
  results: Array<{
    name: string;
    backdrop_path: string;
    first_air_date: string;
    genre_ids: Array<number>;
    origin_country: Array<string>;
    id: number;
    original_language: string;
    original_name: string;
    overview: string;
    popularity: number;
    poster_path: string;
    vote_average: number;
    vote_count: number;
  }>;
}

export const getTv = (
  type: TvPageType,
  page: number = INITIAL_PAGE,
  language = getApiLanguage(),
) =>
  moviesApi.get(`tv/${type.split("-").join("_")}`, {
    params: {
      page,
      language,
    },
  });
