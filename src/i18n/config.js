import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import enNav from "../locales/en/nav.json";
import enCategory from "../locales/en/category.json";
import enProduct from "../locales/en/product.json";
import enHome from "../locales/en/home.json";
import enPages from "../locales/en/pages.json";
import enCart from "../locales/en/cart.json";

import frCommon from "../locales/fr/common.json";
import frNav from "../locales/fr/nav.json";
import frCategory from "../locales/fr/category.json";
import frProduct from "../locales/fr/product.json";
import frHome from "../locales/fr/home.json";
import frPages from "../locales/fr/pages.json";
import frCart from "../locales/fr/cart.json";

import ptBRCommon from "../locales/pt-BR/common.json";
import ptBRNav from "../locales/pt-BR/nav.json";
import ptBRCategory from "../locales/pt-BR/category.json";
import ptBRProduct from "../locales/pt-BR/product.json";
import ptBRHome from "../locales/pt-BR/home.json";
import ptBRPages from "../locales/pt-BR/pages.json";
import ptBRCart from "../locales/pt-BR/cart.json";

/** Idiomas expostos na UI (select). */
export const SUPPORTED_LANGUAGES = ["en", "fr", "pt-BR"];

/**
 * Inclui `pt` porque, com `nonExplicitSupportedLngs: true`, o i18next valida só a
 * parte de língua (`pt` para `pt-BR`). Sem `pt` na lista, PT-BR era rejeitado.
 * O bundle é o mesmo que `pt-BR`.
 */
export const I18N_SUPPORTED_LANGUAGES = [...SUPPORTED_LANGUAGES, "pt"];

export const LANGUAGE_STORAGE_KEY = "e-project.language";

const ptBrBundle = {
  common: ptBRCommon,
  nav: ptBRNav,
  category: ptBRCategory,
  product: ptBRProduct,
  home: ptBRHome,
  pages: ptBRPages,
  cart: ptBRCart,
};

const resources = {
  en: {
    common: enCommon,
    nav: enNav,
    category: enCategory,
    product: enProduct,
    home: enHome,
    pages: enPages,
    cart: enCart,
  },
  fr: {
    common: frCommon,
    nav: frNav,
    category: frCategory,
    product: frProduct,
    home: frHome,
    pages: frPages,
    cart: frCart,
  },
  "pt-BR": ptBrBundle,
  pt: ptBrBundle,
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: I18N_SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    ns: ["common", "nav", "category", "product", "home", "pages", "cart"],
    defaultNS: "common",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
