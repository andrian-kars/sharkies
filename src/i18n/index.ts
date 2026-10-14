import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en, uk } from "./translations";

export type Language = "en" | "uk";
const storageKey = "movies:language";

function initialLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === "en" || saved === "uk") return saved;
  } catch {
    return navigator.language.startsWith("uk") ? "uk" : "en";
  }
  return navigator.language.startsWith("uk") ? "uk" : "en";
}

i18n.on("languageChanged", (language: string) => {
  document.documentElement.lang = language;
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute(
      "content",
      (language === "uk" ? uk : en)["meta.description"],
    );
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    return;
  }
});

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, uk: { translation: uk } },
  lng: initialLanguage(),
  fallbackLng: "en",
  supportedLngs: ["en", "uk"],
  keySeparator: false,
  interpolation: { escapeValue: false },
});

export const getLanguage = (): Language =>
  i18n.resolvedLanguage === "uk" ? "uk" : "en";
export const getApiLanguage = () =>
  getLanguage() === "uk" ? "uk-UA" : "en-US";
export const paginationLabel = (
  type: string,
  page: number | null,
  selected: boolean,
) =>
  i18n.t(
    type === "page"
      ? selected
        ? "pagination.selected"
        : "pagination.page"
      : `pagination.${type}`,
    { page },
  );
export default i18n;
