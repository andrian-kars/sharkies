import {
  ERROR_CODE_400,
  ERROR_CODE_403,
  ERROR_CODE_404,
  ERROR_CODE_500,
  ERROR_CODE_502,
  ERROR_CODE_503,
  INITIAL_PAGE_PATH,
  SITE_NAME,
} from "@/constants";
import { FC, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clapperboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getLanguage } from "@/i18n";

type ErrorPageProps = {
  errorCode?: number;
  additionalMessage?: string;
  onRetry?: () => void;
};

export const ErrorPage: FC<ErrorPageProps> = ({
  errorCode,
  additionalMessage,
  onRetry,
}) => {
  const { t } = useTranslation();
  const key =
    errorCode &&
    [
      ERROR_CODE_400,
      ERROR_CODE_403,
      ERROR_CODE_404,
      ERROR_CODE_500,
      ERROR_CODE_502,
      ERROR_CODE_503,
    ].includes(errorCode)
      ? String(errorCode)
      : "unknown";
  const title = t(`error.${key}`);
  const subTitle = t(`error.${key}Description`);
  useEffect(() => {
    document.title = `${title} | ${SITE_NAME}`;
  }, [title]);

  return (
    <div className="page-container browse-page">
      <div className="empty-state">
        <Clapperboard size={36} />
        <p className="eyebrow">{errorCode || t("error.intermission")}</p>
        <h1>{title}</h1>
        <p>
          {getLanguage() === "en" && additionalMessage
            ? additionalMessage
            : subTitle}
        </p>
        <div className="empty-actions">
          {onRetry && (
            <button className="button button-primary" onClick={onRetry}>
              {t("common.tryAgain")}
            </button>
          )}
          <Link
            className={`button ${onRetry ? "button-secondary" : "button-primary"}`}
            to={INITIAL_PAGE_PATH}
          >
            {t("error.back")} <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
};
