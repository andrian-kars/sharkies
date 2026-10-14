import { getAllCreatureMovies, getCreatureMovies } from "@/api/creaturesService";
import { CreatureFilter } from "@/data/catalog";
import { useFilmFeed } from "@/hooks/useFilmFeed";
import { getApiLanguage } from "@/i18n";

export const useCreatureFeed = (filter: CreatureFilter, page: number, enabled: boolean) =>
  useFilmFeed(enabled ? `${filter}:${page}` : null, (signal) =>
    filter === "all"
      ? getAllCreatureMovies(page, getApiLanguage())
      : getCreatureMovies(filter, page, getApiLanguage(), signal),
  );
