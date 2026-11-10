import {
  CATALOG_MODE_KEY,
  resolveCatalogMode,
  catalogSwitchDestination,
  resolveDummyCatalogApiUrl,
} from "./catalog-mode";

// Only this public, read-only API URL goes into the frontend. Hosting credentials
// belong on the server. The local dataset is never bundled into the app.
const hostedDummyApi = resolveDummyCatalogApiUrl(
  import.meta.env.VITE_DUMMY_CATALOG_API_URL,
);
export const DUMMY_CATALOG_AVAILABLE = import.meta.env.DEV || !!hostedDummyApi;
let storedMode;
try {
  storedMode = window.localStorage.getItem(CATALOG_MODE_KEY);
} catch {
  /* Storage can be blocked; the URL still selects the mode. */
}
const defaultMode = ["remote", "live"].includes(
  import.meta.env.VITE_CATALOG_SOURCE,
)
  ? "live"
  : import.meta.env.DEV ||
      ["local", "dummy"].includes(import.meta.env.VITE_CATALOG_SOURCE)
    ? "dummy"
    : "live";
export const CATALOG_MODE = resolveCatalogMode({
  requested: new URLSearchParams(window.location.search).get("catalog"),
  stored: storedMode,
  defaultMode,
  dummyAvailable: DUMMY_CATALOG_AVAILABLE,
});
// Retain this export for existing category, gallery and preview integrations.
export const LOCAL_CATALOG = CATALOG_MODE === "dummy";
export function switchCatalogMode(mode) {
  if (
    !["dummy", "live"].includes(mode) ||
    mode === CATALOG_MODE ||
    (mode === "dummy" && !DUMMY_CATALOG_AVAILABLE)
  )
    return;
  try {
    window.localStorage.setItem(CATALOG_MODE_KEY, mode);
  } catch {
    /* URL fallback below. */
  }
  try {
    window.sessionStorage.removeItem("filters");
  } catch {
    /* Optional browser storage. */
  }
  // A fresh app instance prevents previous-source products and metadata from
  // leaking into the next catalog. Login and the actual shopping bag stay intact.
  window.location.assign(
    catalogSwitchDestination(window.location.pathname, mode),
  );
}
export const isLocalProductId = (id) => String(id || "").startsWith("local-");
export async function localCatalogRequest(path, params = {}, signal) {
  const response = await fetch(
    `${hostedDummyApi || "/__local-catalog"}/${path}?${new URLSearchParams(params)}`,
    { signal },
  );
  if (!response.ok) throw new Error("The dummy catalog could not be loaded.");
  const result = await response.json();
  if (!result.success)
    throw new Error("The dummy catalog could not be loaded.");
  if (hostedDummyApi && path.startsWith("products")) {
    const rebaseThumbnail = (product) =>
      product?.thumbnail?.startsWith("/__local-catalog/")
        ? {
            ...product,
            thumbnail: `${hostedDummyApi}/${product.thumbnail.slice("/__local-catalog/".length)}`,
          }
        : product;
    result.data = Array.isArray(result.data)
      ? result.data.map(rebaseThumbnail)
      : rebaseThumbnail(result.data);
  }
  return result;
}

const editorialMatches = {
  "Grand Maroon": /burgundy|maroon|wine/i,
  Sage: /sage|green/i,
  "Royal Teal": /teal/i,
  Peachy: /pink|peach|rose/i,
  Midnight: /black/i,
  "Dusty Rose": /rose|pink/i,
  "Powder Blue": /blue/i,
  "Regal Powder": /embroider|lace/i,
  "Mauve Organza": /purple|lavender/i,
  "Ethereal Mauve": /purple|lavender/i,
  "Powder Blue Heavily": /blue/i,
};
export function editorialProduct(products, phrase, fallback = null) {
  const exact = products.find((product) =>
    product.title.toLowerCase().includes(phrase.toLowerCase()),
  );
  if (exact) return exact;
  if (products.some((product) => product.localPreview)) {
    const match = editorialMatches[phrase];
    const found =
      match &&
      products.find((product) =>
        match.test(product.images?.[0]?.alt || product.title),
      );
    if (found) return found;
  }
  return fallback === null ? undefined : products[fallback];
}
