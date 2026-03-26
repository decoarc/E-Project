import { CATEGORY_SET_ROUTES } from "../data/categoryRoutes";
import { fetchLatestSet, fetchSet } from "./api";

export async function fetchAllSearchableProducts() {
  const routeConfigs = Object.values(CATEGORY_SET_ROUTES);
  const settled = await Promise.allSettled(
    routeConfigs.map((cfg) =>
      cfg.useLatest === true ? fetchLatestSet() : fetchSet(cfg.setId)
    )
  );

  const productsById = new Map();

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const products = Array.isArray(result.value?.products)
      ? result.value.products
      : [];
    for (const product of products) {
      if (!product?.id || productsById.has(product.id)) continue;
      productsById.set(product.id, product);
    }
  }

  return Array.from(productsById.values());
}
