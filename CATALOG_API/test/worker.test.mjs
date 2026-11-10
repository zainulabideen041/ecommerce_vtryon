import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, open, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildExport } from "../scripts/export.mjs";
import { createWorker } from "../src/worker.js";
import {
  normalizeProduct,
  queryCatalog,
} from "../../FRONTEND/tools/local-catalog.mjs";

let directory, catalog, snapshot;
const photograph = (handle) => Buffer.from(`jpeg-fixture:${handle}:\u00e9`);
before(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "luxar-catalog-test-"));
  const products = Array.from({ length: 300 }, (_, index) =>
    normalizeProduct({
      id: String(index + 1),
      handle: `piece-${index + 1}`,
      title: `${index % 2 ? "Caf\u00e9 \u2013 Black Top" : "Rose Silk Dress"} ${index + 1}`,
      description: "Fixture description",
      product_type: index % 2 ? "Top" : "Dress",
      vendor: "Test Vendor",
      tags: index % 2 ? ["black", "knit"] : ["rose", "silk"],
      category:
        index % 2
          ? {
              id: "9525",
              name: "Clothing Tops",
              full_path: "Apparel & Accessories > Clothing > Clothing Tops",
            }
          : {
              id: "160",
              name: "Dresses",
              full_path: "Apparel & Accessories > Clothing > Dresses",
            },
      images: [
        {
          url: "https://example.test/photo.jpg",
          alt: index % 2 ? "Black Top" : "Rose Dress",
          width: 1000,
          height: 1400,
        },
      ],
      featured_image_url: "https://example.test/photo.jpg",
      price: {
        min_usd: 10 + index / 10,
        max_usd: 10 + index / 10,
        currency: "USD",
      },
      variants: [
        {
          sku: `SKU-${index}`,
          title: "S",
          price_usd: 10 + index / 10,
          in_stock: index !== 2,
          options: { Size: "S", Color: index % 2 ? "Black" : "Rose" },
        },
      ],
      metafields: { fabric: index % 2 ? "Knit" : "Silk" },
      reviews: { count: 0, rating: 0 },
      url: "https://example.test/product",
      updated_at: "2026-10-18T06:00:00Z",
    }),
  );
  catalog = {
    products,
    metadata: {
      total: products.length,
      currency: "USD",
      syncedAt: "2026-10-18T06:00:00Z",
      groups: [
        { id: "dresses", label: "Dresses", count: 150 },
        { id: "tops", label: "Tops", count: 150 },
      ],
      categories: [
        { id: "dresses-160", label: "Dresses", count: 150 },
        { id: "clothing-tops-9525", label: "Tops", count: 150 },
      ],
      brands: [{ id: "test-vendor", label: "Test Vendor" }],
    },
  };
  snapshot = await buildExport(catalog, {
    destination: directory,
    thumbnailReader: photograph,
  });
});
after(async () => {
  if (
    !directory ||
    path.dirname(path.resolve(directory)) !== path.resolve(os.tmpdir()) ||
    !path.basename(directory).startsWith("luxar-catalog-test-")
  )
    throw new Error("Refusing to remove an unexpected test directory.");
  await rm(directory, { recursive: true, force: true });
});

class FileBucket {
  reads = [];
  async get(key, options) {
    assert.match(key, /^(manifest\.json|snapshots\/[a-f0-9]{16}\/[a-z.]+)$/);
    this.reads.push({ key, range: options?.range });
    let file;
    try {
      file = await open(path.join(directory, ...key.split("/")), "r");
    } catch (error) {
      if (error.code === "ENOENT") return null;
      throw error;
    }
    try {
      const stat = await file.stat();
      const offset = options?.range?.offset || 0;
      const length = options?.range?.length ?? stat.size;
      const bytes = Buffer.alloc(length);
      const result = await file.read(bytes, 0, length, offset);
      assert.equal(result.bytesRead, length);
      return {
        body: new Response(bytes).body,
        json: async () => JSON.parse(bytes.toString("utf8")),
      };
    } finally {
      await file.close();
    }
  }
}
const environment = (bucket = new FileBucket()) => ({
  CATALOG_BUCKET: bucket,
  ALLOWED_ORIGINS: "http://localhost:5173,https://shop.example.test",
  CACHE_TTL_SECONDS: "300",
});
const request = (route, options = {}) =>
  new Request(`https://demo.example.test${route}`, options);
const worker = createWorker({ cache: () => null });

test("eight-object export keeps real Unicode details and binary thumbnail ranges intact", async () => {
  assert.equal(snapshot.inventory.length, 8);
  const env = environment();
  const detail = await worker.fetch(request("/api/products/local-178"), env);
  assert.equal(detail.status, 200);
  const data = (await detail.json()).data;
  assert.equal(data.title, catalog.products[177].title);
  assert.equal(data.variants[0].sku, "SKU-177");
  assert.equal(data.localPreview, true);
  assert.equal(
    data.thumbnail,
    "https://demo.example.test/api/thumbnail/piece-178",
  );
  const image = await worker.fetch(request("/api/thumbnail/piece-178"), env);
  assert.equal(image.headers.get("Content-Type"), "image/jpeg");
  assert.deepEqual(
    Buffer.from(await image.arrayBuffer()),
    photograph("piece-178"),
  );
  assert.ok(
    env.CATALOG_BUCKET.reads
      .filter((read) => read.key.endsWith(".bin"))
      .every((read) => read.range),
  );
});

test("ordinary category pages use prebuilt responses without loading the search index", async () => {
  const env = environment();
  const response = await worker.fetch(
    request("/api/products?category=dresses&page=2&sortBy=price-hightolow"),
    env,
  );
  const actual = await response.json();
  const expected = queryCatalog(
    catalog,
    new URLSearchParams({
      category: "dresses",
      page: "2",
      sortBy: "price-hightolow",
    }),
  );
  assert.deepEqual(
    actual.data.map((item) => item._id),
    expected.data.map((item) => item._id),
  );
  assert.deepEqual(actual.pagination, expected.pagination);
  assert.ok(
    !env.CATALOG_BUCKET.reads.some((read) => read.key.endsWith("index.json")),
  );
});

test("search, precise taxonomy, multiple categories and pagination match local catalog behavior", async () => {
  for (const query of [
    "keyword=caf%C3%A9+black&page=2",
    "category=dresses-160&page=999",
    "category=dresses,tops&brand=test-vendor&sortBy=title-ztoa&pageSize=60",
    "category=unknown",
    "brand=unknown",
    "keyword=zzzzzz",
  ]) {
    const result = await worker.fetch(
      request(`/api/products?${query}`),
      environment(),
    );
    assert.equal(result.status, 200);
    const actual = await result.json();
    const expected = queryCatalog(catalog, new URLSearchParams(query));
    assert.deepEqual(
      actual.data.map((item) => item._id),
      expected.data.map((item) => item._id),
    );
    assert.deepEqual(actual.pagination, expected.pagination);
  }
});

test("homepage featured edit is returned from the prebuilt pack", async () => {
  const env = environment();
  const response = await worker.fetch(
    request("/api/products?featured=1&pageSize=60"),
    env,
  );
  const actual = await response.json();
  const expected = queryCatalog(
    catalog,
    new URLSearchParams({ featured: "1", pageSize: "60" }),
  );
  assert.deepEqual(
    actual.data.map((item) => item._id),
    expected.data.map((item) => item._id),
  );
  assert.ok(
    !env.CATALOG_BUCKET.reads.some((read) => read.key.endsWith("index.json")),
  );
});

test("CORS is origin-specific, preflight permits reads, and all writes are rejected", async () => {
  const env = environment();
  const allowed = await worker.fetch(
    request("/api/meta", { headers: { Origin: "http://localhost:5173" } }),
    env,
  );
  assert.equal(
    allowed.headers.get("Access-Control-Allow-Origin"),
    "http://localhost:5173",
  );
  const denied = await worker.fetch(
    request("/api/meta", { headers: { Origin: "https://other.example.test" } }),
    env,
  );
  assert.equal(denied.status, 403);
  assert.equal(denied.headers.get("Access-Control-Allow-Origin"), null);
  const preflight = await worker.fetch(
    request("/api/products", {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "GET",
      },
    }),
    env,
  );
  assert.equal(preflight.status, 204);
  for (const method of ["POST", "PUT", "PATCH", "DELETE"])
    assert.equal(
      (await worker.fetch(request("/api/products", { method }), env)).status,
      405,
    );
});

test("cached responses never mix CORS origins and conditional GET preserves correct ETags", async () => {
  const entries = new Map();
  const memoryCache = {
    match: async (key) => entries.get(key.url)?.clone(),
    put: async (key, value) => {
      entries.set(key.url, value.clone());
    },
  };
  const cachedWorker = createWorker({ cache: () => memoryCache });
  const pending = [];
  const ctx = { waitUntil: (promise) => pending.push(promise) };
  const env = environment();
  const first = await cachedWorker.fetch(
    request("/api/meta", { headers: { Origin: "http://localhost:5173" } }),
    env,
    ctx,
  );
  await Promise.all(pending);
  const second = await cachedWorker.fetch(
    request("/api/meta", { headers: { Origin: "https://shop.example.test" } }),
    env,
    ctx,
  );
  assert.equal(
    second.headers.get("Access-Control-Allow-Origin"),
    "https://shop.example.test",
  );
  const unchanged = await cachedWorker.fetch(
    request("/api/meta", {
      headers: { "If-None-Match": first.headers.get("ETag") },
    }),
    env,
    ctx,
  );
  assert.equal(unchanged.status, 304);
  assert.equal(await unchanged.text(), "");
  const head = await cachedWorker.fetch(
    request("/api/meta", { method: "HEAD" }),
    env,
    ctx,
  );
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
});

test("unknown products, traversal, invalid queries and missing snapshots fail cleanly", async () => {
  for (const route of [
    "/api/products/local-9999",
    "/api/thumbnail/not-a-handle",
    "/api/thumbnail/%2e%2e%2fmanifest.json",
    "/api/manifest.json",
  ])
    assert.equal(
      (await worker.fetch(request(route), environment())).status,
      404,
    );
  assert.equal(
    (await worker.fetch(request("/api/products?sortBy=invalid"), environment()))
      .status,
    400,
  );
  assert.equal(
    (
      await worker.fetch(
        request(`/api/products?keyword=${"x".repeat(121)}`),
        environment(),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await worker.fetch(request("/api/meta"), {
        CATALOG_BUCKET: { get: async () => null },
      })
    ).status,
    503,
  );
});

test("export checksums and versions are deterministic and include thumbnail content", async () => {
  const plan = JSON.parse(
    await readFile(path.join(directory, "upload-plan.json"), "utf8"),
  );
  assert.equal(plan.version, snapshot.manifest.version);
  const changed = await buildExport(catalog, {
    destination: directory,
    thumbnailReader: async (handle) =>
      Buffer.concat([photograph(handle), Buffer.from("changed")]),
  });
  assert.notEqual(changed.manifest.version, snapshot.manifest.version);
});
