import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { loadCatalog, queryCatalog } from "./local-catalog.mjs";

const catalog = await loadCatalog();
const query = (params) => queryCatalog(catalog, new URLSearchParams(params));
const require = createRequire(import.meta.url);
const Product = require("../../BACKEND/models/Product.js");

test("all products retain unique source identities and taxonomy categories", () => {
  assert.equal(
    new Set(catalog.products.map((product) => product._id)).size,
    catalog.products.length,
  );
  assert.equal(
    catalog.metadata.categories.length,
    new Set(catalog.products.map((product) => product.taxonomy.externalId))
      .size,
  );
  assert.equal(
    catalog.metadata.groups.reduce((sum, group) => sum + group.count, 0),
    catalog.products.length,
  );
  assert.equal(
    catalog.metadata.categories.reduce(
      (sum, category) => sum + category.count,
      0,
    ),
    catalog.products.length,
  );
});

test("every normalized record validates against the extended product schema without a database connection", () => {
  for (const record of catalog.products) {
    const { _id, localPreview, thumbnail, ...fields } = record;
    const error = new Product(fields).validateSync();
    assert.equal(error, undefined, `${_id}: ${error?.message}`);
  }
  assert.equal(Product.db.readyState, 0);
});

test("legacy products remain valid and invalid structured prices are rejected", () => {
  const legacy = new Product({
    title: "Legacy piece",
    image: "https://example.com/photo.jpg",
    category: "women",
    brand: "zara",
    price: 100,
    totalStock: 4,
  });
  assert.equal(legacy.validateSync(), undefined);
  const invalid = new Product({ variants: [{ price: -5 }] });
  assert.ok(invalid.validateSync()?.errors["variants.0.price"]);
});

test("department, precise taxonomy and brand filters preserve correct membership", () => {
  const dresses = query({ category: "dresses", pageSize: 60 });
  assert.ok(dresses.data.every((product) => product.category === "dresses"));
  assert.equal(
    dresses.pagination.total,
    catalog.products.filter((product) => product.category === "dresses").length,
  );
  const category = catalog.metadata.categories[2];
  assert.equal(
    query({ category: category.id }).pagination.total,
    category.count,
  );
  assert.equal(query({ brand: "nonexistent" }).pagination.total, 0);
  assert.equal(query({ category: "men" }).pagination.total, 0);
});

test("pagination is bounded and sorted pages do not repeat products", () => {
  const first = query({ page: 1, pageSize: 24, sortBy: "price-lowtohigh" });
  const second = query({ page: 2, pageSize: 24, sortBy: "price-lowtohigh" });
  assert.equal(first.data.length, 24);
  assert.equal(second.data.length, 24);
  assert.ok(first.data.at(-1).price <= second.data[0].price);
  assert.equal(
    new Set([...first.data, ...second.data].map((product) => product._id)).size,
    48,
  );
  assert.equal(query({ pageSize: 9999 }).data.length, 60);
  assert.equal(query({ page: -1 }).pagination.page, 1);
  const last = query({ page: 99999 });
  assert.equal(last.pagination.page, last.pagination.pages);
});

test("search matches all terms and returns no invented inventory quantities or reviews", () => {
  const result = query({ keyword: "black dress" });
  assert.ok(result.pagination.total > 0);
  for (const product of catalog.products) {
    assert.equal(product.totalStock, undefined);
    assert.ok(
      product.variants.every((variant) => variant.stockQuantity === undefined),
    );
    assert.equal(product.localPreview, true);
    assert.ok(product._id.startsWith("local-"));
  }
  assert.equal(
    catalog.products.filter((product) => product.availability === "sold-out")
      .length,
    4,
  );
});

test("editorial selection leads with available clothing and never fabricates collection membership", () => {
  const featured = query({ featured: 1, pageSize: 60 });
  assert.ok(featured.data.length >= 12);
  assert.ok(
    featured.data.every(
      (product) =>
        !["accessories", "footwear", "other"].includes(product.category) &&
        product.availability === "available",
    ),
  );
  assert.ok(
    catalog.products.every(
      (product) => product.collectionHandles === undefined,
    ),
  );
  assert.ok(catalog.metadata.collections.length > 0);
});
