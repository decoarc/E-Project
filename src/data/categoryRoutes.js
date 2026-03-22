/** Preços fictícios (USD) para o conjunto a1 na categoria Women's (type-2). */
export const TYPE2_A1_PRICES_USD = {
  a1_bottom: 89,
  a1_up: 79,
};

/**
 * Rotas que carregam dados de sets e partilham o mesmo layout de cards.
 * — `setId` + `fetchSet` /api/sets/:id
 * — `useLatest` + `fetchLatestSet` (ver `src/lib/api.js`)
 * Textos visíveis vivem em `locales/<lng>/category.json` em `routes.<slug>`.
 */
export const CATEGORY_SET_ROUTES = {
  "new-arrivals": {
    useLatest: true,
    priceMap: {},
  },
  "type-1": {
    setId: "b1",
    priceMap: {},
  },
  "type-2": {
    setId: "a1",
    priceMap: TYPE2_A1_PRICES_USD,
  },
  "type-3": {
    setId: "c1",
    priceMap: {},
  },
};
