import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveCatalogMode,
  catalogSwitchDestination,
  resolveDummyCatalogApiUrl,
  DEFAULT_DUMMY_CATALOG_API_URL,
} from "../src/lib/catalog-mode.js";

test("dummy mode uses the hosted API without a local dataset or environment file", () => {
  assert.equal(
    resolveDummyCatalogApiUrl(undefined),
    DEFAULT_DUMMY_CATALOG_API_URL,
  );
  assert.equal(
    resolveDummyCatalogApiUrl(" https://catalog.example.test/api/ "),
    "https://catalog.example.test/api",
  );
  assert.equal(resolveDummyCatalogApiUrl("local"), "");
});

test("the switch remembers a supported catalog choice", () => {
  assert.equal(
    resolveCatalogMode({
      stored: "live",
      defaultMode: "dummy",
      dummyAvailable: true,
    }),
    "live",
  );
  assert.equal(
    resolveCatalogMode({
      stored: "dummy",
      defaultMode: "live",
      dummyAvailable: true,
    }),
    "dummy",
  );
});
test("a deployment cannot enter dummy mode without a dummy data source", () => {
  assert.equal(
    resolveCatalogMode({
      requested: "dummy",
      stored: "dummy",
      defaultMode: "dummy",
      dummyAvailable: false,
    }),
    "live",
  );
});
test("explicit URL selection works when browser storage is blocked", () => {
  assert.equal(
    resolveCatalogMode({
      requested: "dummy",
      defaultMode: "live",
      dummyAvailable: true,
    }),
    "dummy",
  );
  assert.equal(
    resolveCatalogMode({
      requested: "invalid",
      stored: "live",
      defaultMode: "dummy",
      dummyAvailable: true,
    }),
    "live",
  );
});
test("switching leaves transaction and product-specific screens for clean browsing", () => {
  assert.equal(
    catalogSwitchDestination("/shop/checkout", "dummy"),
    "/shop/home?catalog=dummy",
  );
  assert.equal(
    catalogSwitchDestination("/shop/tryon/local-123", "live"),
    "/shop/home?catalog=live",
  );
  assert.equal(
    catalogSwitchDestination("/shop/listing", "live"),
    "/shop/listing?catalog=live",
  );
});
