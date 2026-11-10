export const CATALOG_MODE_KEY = "luxar.catalog-mode";

export function resolveCatalogMode({
  requested,
  stored,
  defaultMode,
  dummyAvailable,
}) {
  const valid = (value) => value === "dummy" || value === "live";
  const preferred = valid(requested)
    ? requested
    : valid(stored)
      ? stored
      : defaultMode;
  return preferred === "dummy" && dummyAvailable ? "dummy" : "live";
}

export function catalogSwitchDestination(pathname, mode) {
  // Clear source-specific category/search/product IDs. Account and transaction
  // pages return to browsing; auth and the real bag are preserved.
  const page = pathname === "/shop/listing" ? pathname : "/shop/home";
  return `${page}?catalog=${mode}`;
}
