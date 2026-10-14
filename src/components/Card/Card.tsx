import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Dialog } from "@mui/material";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  Film as FilmIcon,
  Play,
  Star,
  X,
} from "lucide-react";
import { moviesApi } from "@/api/config";
import { Film, imageUrl } from "@/data/catalog";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useTranslation } from "react-i18next";
import { getApiLanguage, getLanguage, Language } from "@/i18n";
import { isCuratedFilm, localizeFilm, translateGenre } from "@/i18n/catalog";

export const Card = (source: Film) => {
  const { t } = useTranslation();
  const language = getLanguage();
  const film = useLocalizedFilm(source, language);
  const [open, setOpen] = useState(false);
  // Safari does not focus a button on click, so the dialog cannot restore focus itself.
  const trigger = useRef<HTMLButtonElement>(null);
  const closeDialog = () => {
    flushSync(() => setOpen(false));
    trigger.current?.focus();
  };
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(film);
  const showPoster = Boolean(film.poster) && !imageFailed;

  return (
    <article className="film-card">
      <div className="poster-wrap">
        <button
          ref={trigger}
          className={`poster-button ${showPoster && !imageLoaded ? "is-loading" : ""}`}
          onClick={() => setOpen(true)}
          aria-label={t("card.details", { title: film.title })}
        >
          {showPoster ? (
            <img
              src={imageUrl(film.poster!)}
              alt={t("card.poster", { title: film.title })}
              loading="lazy"
              width="300"
              height="450"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span className="poster-fallback">
              <FilmIcon size={36} />
              <span>{film.title}</span>
            </span>
          )}
          <span className="poster-overlay">
            <span>
              {t(film.mediaType === "tv" ? "card.viewSeries" : "card.viewFilm")}{" "}
              <ArrowUpRight size={16} />
            </span>
          </span>
        </button>
        <span className="poster-rating">
          <Star size={12} fill="currentColor" />
          {film.vote > 0
            ? film.vote.toLocaleString(language, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })
            : t("card.unrated")}
        </span>
        <button
          className={`icon-button poster-save ${saved ? "is-saved" : ""}`}
          onClick={() => toggle(film)}
          aria-label={t(saved ? "card.remove" : "card.save", {
            title: film.title,
          })}
          aria-pressed={saved}
          title={t(saved ? "card.removeTooltip" : "card.saveTooltip")}
        >
          {saved ? <Check size={17} /> : <Bookmark size={17} />}
        </button>
      </div>
      <h3>{film.title}</h3>
      <p className="film-meta">
        <span>{film.date?.slice(0, 4) || t("card.tba")}</span>
        <span>
          {film.genres?.[0] || t(film.mediaType === "tv" ? "card.series" : "card.movie")}
        </span>
      </p>
      {open && <MovieDialog film={film} onClose={closeDialog} />}
    </article>
  );
};

type Details = {
  title?: string;
  name?: string;
  overview?: string;
  runtime?: number;
  number_of_seasons?: number;
  genres?: { name: string }[];
  videos?: {
    results: {
      site: string;
      type: string;
      official: boolean;
      key: string;
      iso_639_1?: string;
    }[];
  };
};

function useLocalizedFilm(source: Film, language: Language): Film {
  const [translation, setTranslation] = useState<{
    id: number;
    mediaType: Film["mediaType"];
    language: Language;
    details: Details;
  } | null>(null);
  useEffect(() => {
    if (isCuratedFilm(source) || (source.language || "en") === language) return;
    const controller = new AbortController();
    moviesApi
      .get<Details>(`${source.mediaType || "movie"}/${source.id}`, {
        params: { language: getApiLanguage() },
        signal: controller.signal,
        timeout: 12000,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted)
          setTranslation({
            id: source.id,
            mediaType: source.mediaType,
            language,
            details: data,
          });
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [source.id, source.mediaType, source.language, language]);
  const film = localizeFilm(source, language);
  if (
    !isCuratedFilm(source) &&
    translation?.id === source.id &&
    translation.mediaType === source.mediaType &&
    translation.language === language
  ) {
    const details = translation.details;
    return {
      ...film,
      title: details.title || details.name || film.title,
      overview: details.overview || film.overview,
      genres:
        details.genres?.map((genre) => translateGenre(genre.name, language)) ||
        film.genres,
      language,
    };
  }
  return film;
}

export const MovieDialog = ({ film, onClose }: { film: Film; onClose: () => void }) => {
  const { t } = useTranslation();
  const language = getLanguage();
  const [details, setDetails] = useState<Details | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { isSaved, toggle, persistent } = useWatchlist();
  const saved = isSaved(film);

  useEffect(() => {
    const controller = new AbortController();
    setFailed(false);
    setDetails(null);
    moviesApi
      .get<Details>(`${film.mediaType || "movie"}/${film.id}`, {
        params: {
          append_to_response: "videos",
          language: getApiLanguage(),
          include_video_language: language === "uk" ? "uk,en,null" : "en,null",
        },
        signal: controller.signal,
        timeout: 12000,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted) setDetails(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [film.id, film.mediaType, attempt, language]);

  const trailers = details?.videos?.results.filter(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const trailer =
    trailers?.find((video) => video.official && video.iso_639_1 === language) ||
    trailers?.find((video) => video.iso_639_1 === language) ||
    trailers?.find((video) => video.official) ||
    trailers?.[0];

  return (
    <Dialog
      open
      disableRestoreFocus
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby={`film-title-${film.id}`}
      PaperProps={{ className: "film-dialog" }}
    >
      <div className="dialog-art">
        {(film.backdrop || film.poster) && (
          <img src={imageUrl((film.backdrop || film.poster)!, "w780")} alt="" />
        )}
        <button
          className="icon-button dialog-close"
          onClick={onClose}
          aria-label={t("detail.close")}
          title={t("detail.close")}
        >
          <X size={21} />
        </button>
      </div>
      <div className="dialog-body">
        <p className="eyebrow">
          {t(film.mediaType === "tv" ? "detail.smallScreen" : "detail.bigScreen")}
        </p>
        <h2 id={`film-title-${film.id}`}>
          {details?.title || details?.name || film.title}
        </h2>
        <div className="detail-meta">
          <span className="rating">
            <Star size={14} fill="currentColor" />
            {film.vote > 0
              ? film.vote.toLocaleString(language, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })
              : t("detail.unrated")}
          </span>
          <span>{film.date?.slice(0, 4) || t("detail.releaseTba")}</span>
          {details?.runtime ? (
            <span>{t("detail.runtime", { count: details.runtime })}</span>
          ) : null}
          {details?.number_of_seasons ? (
            <span>{t("detail.seasons", { count: details.number_of_seasons })}</span>
          ) : null}
          {!details && !failed && (
            <span className="text-skeleton meta-skeleton" aria-hidden="true" />
          )}
        </div>
        <p className="detail-genres">
          {(
            details?.genres?.map((genre) => translateGenre(genre.name, language)) ||
            film.genres ||
            []
          ).join(" / ")}
        </p>
        {details?.overview || film.overview || failed || details ? (
          <p className="synopsis">
            {details?.overview || film.overview || t("detail.noSynopsis")}
          </p>
        ) : (
          <div
            className="synopsis synopsis-skeleton"
            role="status"
            aria-label={t("detail.loading")}
          >
            <span className="text-skeleton" />
            <span className="text-skeleton" />
            <span className="text-skeleton" />
          </div>
        )}
        {failed && (
          <p className="inline-notice" role="status">
            {t("detail.failed")}{" "}
            <button className="text-button" onClick={() => setAttempt(attempt + 1)}>
              {t("common.tryAgain")}
            </button>
          </p>
        )}
        <div className="dialog-actions">
          {trailer ? (
            <a
              className="button button-primary"
              href={`https://www.youtube.com/watch?v=${encodeURIComponent(trailer.key)}`}
              target="_blank"
              rel="noreferrer"
            >
              <Play size={17} fill="currentColor" />
              {t("detail.trailer")}
              <ArrowUpRight size={15} />
            </a>
          ) : (
            <button className="button button-primary" disabled>
              <Play size={17} />
              {!details && !failed
                ? t("detail.trailerLoading")
                : t("detail.trailerUnavailable")}
            </button>
          )}
          <button
            className="button button-secondary"
            onClick={() => toggle(film)}
            aria-pressed={saved}
          >
            {saved ? <Check size={17} /> : <Bookmark size={17} />}
            {t(saved ? "detail.saved" : "nav.watchlist")}
          </button>
        </div>
        {!persistent && (
          <p className="inline-notice" role="status">
            {t("detail.sessionOnly")}
          </p>
        )}
        <a
          className="detail-source"
          href={`https://www.themoviedb.org/${film.mediaType || "movie"}/${film.id}`}
          target="_blank"
          rel="noreferrer"
        >
          {t("detail.source")} <ArrowUpRight size={13} />
        </a>
      </div>
    </Dialog>
  );
};
