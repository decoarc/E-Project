/** Preços fictícios (USD) para o conjunto a1 na categoria Women's (type-2). */
export const TYPE2_A1_PRICES_USD = {
  a1_bottom: 89,
  a1_up: 79,
};

export const TYPE1_B1_PRICES_USD = {
  b1_jacket: 123,
};

/** Mapa único id de produto → preço USD (carrinho, PDP, categorias). */
export const PRODUCT_PRICES_USD = {
  ...TYPE2_A1_PRICES_USD,
  ...TYPE1_B1_PRICES_USD,
};

/** Prefixo do id antes do primeiro `_` (ex.: `b1_jacket` → `b1`). */
export function getSetIdForProductId(productId) {
  if (!productId || typeof productId !== "string") return "a1";
  const prefix = productId.split("_")[0];
  if (prefix === "b1" || prefix === "a1" || prefix === "c1") return prefix;
  return "a1";
}

export function getCategorySlugForSetId(setId) {
  const map = { b1: "type-1", a1: "type-2", c1: "type-3" };
  return map[setId] ?? "type-2";
}

export function getCategoryHrefForSetId(setId) {
  return `/category/${getCategorySlugForSetId(setId)}`;
}

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
    priceMap: TYPE1_B1_PRICES_USD,
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
