import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "./config";

/**
 * Stable API aligned with {@link useCurrency}: current locale + setter.
 * Locales are BCP 47 codes matching i18next resources (`en`, `fr`, `pt-BR`).
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const setLanguage = useCallback(
    (lng) => {
      if (SUPPORTED_LANGUAGES.includes(lng)) {
        void i18n.changeLanguage(lng);
      }
    },
    [i18n]
  );

  const raw = i18n.resolvedLanguage ?? i18n.language;
  /** `pt` e `pt-BR` partilham o mesmo bundle; a UI só usa `pt-BR`. */
  const language = raw === "pt" ? "pt-BR" : raw;

  const options = useMemo(
    () => [
      { value: "en", label: "EN" },
      { value: "fr", label: "FR" },
      { value: "pt-BR", label: "PT-BR" },
    ],
    []
  );

  return {
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    languageOptions: options,
  };
}
