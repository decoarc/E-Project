import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Keeps `<html lang>` in sync with the active i18n locale (a11y + SEO). */
export default function DocumentLang() {
  const { i18n } = useTranslation();
  useEffect(() => {
    const raw = i18n.resolvedLanguage ?? i18n.language;
    if (raw) {
      document.documentElement.lang = raw === "pt" ? "pt-BR" : raw;
    }
  }, [i18n.language, i18n.resolvedLanguage]);
  return null;
}
