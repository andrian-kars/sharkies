import { useTranslation } from "react-i18next";

export const CardSkeleton = () => {
  const { t } = useTranslation();
  return (
    <div className="film-skeleton" aria-label={t("common.loadingMovie")}>
      <div />
      <span />
      <span />
    </div>
  );
};
