// The supplied dataset is used during development and is never included in a
// production bundle. VITE_CATALOG_SOURCE=remote restores the original API.
export const LOCAL_CATALOG =
  import.meta.env.DEV && import.meta.env.VITE_CATALOG_SOURCE !== "remote";
export const isLocalProductId = (id) => String(id || "").startsWith("local-");
export async function localCatalogRequest(path, params = {}, signal) {
  const response = await fetch(
    `/__local-catalog/${path}?${new URLSearchParams(params)}`,
    { signal },
  );
  if (!response.ok) throw new Error("The local catalog could not be loaded.");
  return response.json();
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
