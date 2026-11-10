import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  catalogRoot,
  loadCatalog,
  queryCatalog,
  summarize,
} from "../../FRONTEND/tools/local-catalog.mjs";

export const outputRoot = fileURLToPath(
  new URL("../../.catalog-export/luxar-demo-catalog/", import.meta.url),
);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const json = (value) => Buffer.from(JSON.stringify(value), "utf8");
const sorts = {
  "price-lowtohigh": (a, b) => a.price - b.price,
  "price-hightolow": (a, b) => b.price - a.price,
  "title-atoz": (a, b) => a.title.localeCompare(b.title),
  "title-ztoa": (a, b) => b.title.localeCompare(a.title),
};

class Pack {
  chunks = [];
  size = 0;
  add(bytes) {
    const range = [this.size, bytes.length];
    this.chunks.push(bytes);
    this.size += bytes.length;
    return range;
  }
  bytes() {
    return Buffer.concat(this.chunks, this.size);
  }
}

export async function buildExport(
  catalog,
  {
    destination = outputRoot,
    thumbnailReader = (handle) =>
      readFile(path.join(catalogRoot, "thumbnails", `${handle}.jpg`)),
  } = {},
) {
  const { products, metadata } = catalog;
  if (
    !products.length ||
    new Set(products.map((product) => product._id)).size !== products.length
  )
    throw new Error("Catalog is empty or has duplicate IDs.");
  const revision = createHash("sha256").update(
    json({ schemaVersion: 1, products, metadata }),
  );
  const shardSize = Math.max(128, Math.ceil(products.length / 24));
  const productsPack = new Pack();
  const summariesPack = new Pack();
  const thumbnailsPack = new Pack();
  const pagesPack = new Pack();
  const summaries = products.map(summarize);
  const rows = [];
  for (const [index, product] of products.entries()) {
    if (
      !/^local-\d+$/.test(product._id) ||
      !/^[a-z0-9-]+$/.test(product.handle)
    )
      throw new Error(`Unsupported source identity: ${product._id}`);
    const searchable =
      `${product.title} ${product.productType} ${product.brandLabel} ${product.taxonomy.fullPath} ${product.tags.join(" ")} ${product.attributes.fabric || ""} ${product.attributes.material || ""} ${product.variants.map((variant) => Object.values(variant.options).join(" ")).join(" ")}`.toLowerCase();
    // Deduplicate whitespace-separated words to keep the search index small.
    const search = [...new Set(searchable.split(/\s+/))].join(" ");
    const thumbnail = await thumbnailReader(product.handle);
    revision.update(thumbnail);
    rows.push({
      id: product._id,
      c: product.category,
      t: product.taxonomy.slug,
      b: product.brand,
      p: product.price,
      n: product.title,
      s: search,
      h: product.handle,
      d: productsPack.add(json(product)),
      j: thumbnailsPack.add(thumbnail),
      g: Math.floor(index / shardSize),
    });
  }
  const version = revision.digest("hex").slice(0, 16);
  const prefix = `snapshots/${version}/`;
  const shards = [];
  for (let start = 0; start < summaries.length; start += shardSize) {
    shards.push(
      summariesPack.add(
        json(
          Object.fromEntries(
            summaries
              .slice(start, start + shardSize)
              .map((product) => [product._id, product]),
          ),
        ),
      ),
    );
  }
  const ordering = Object.fromEntries(
    Object.entries(sorts).map(([name, compare]) => [
      name,
      products
        .map((_, index) => index)
        .sort((a, b) => compare(products[a], products[b])),
    ]),
  );
  const pageDirectory = {
    schemaVersion: 1,
    version,
    brands: metadata.brands.map((brand) => brand.id),
    branches: {},
    featured: null,
  };
  const categories = [
    "",
    ...metadata.groups.map((group) => group.id),
    ...metadata.categories.map((category) => category.id),
  ];
  for (const category of new Set(categories)) {
    const branch = { total: 0, sorts: {} };
    for (const name of Object.keys(sorts)) {
      const selected = ordering[name].filter(
        (index) =>
          !category || rows[index].c === category || rows[index].t === category,
      );
      branch.total = selected.length;
      branch.sorts[name] = [];
      for (let start = 0; start < selected.length; start += 24) {
        const payload = {
          success: true,
          data: selected
            .slice(start, start + 24)
            .map((index) => summaries[index]),
          pagination: {
            page: start / 24 + 1,
            pageSize: 24,
            total: selected.length,
            pages: Math.max(1, Math.ceil(selected.length / 24)),
          },
        };
        branch.sorts[name].push(pagesPack.add(json(payload)));
      }
    }
    pageDirectory.branches[category] = branch;
  }
  const featured = queryCatalog(
    catalog,
    new URLSearchParams({ featured: "1", pageSize: "60" }),
  );
  pageDirectory.featured = {
    range: pagesPack.add(json(featured)),
    total: featured.pagination.total,
  };
  const index = {
    schemaVersion: 1,
    version,
    rows,
    ordering,
    shards,
    featured: featured.data.map((product) =>
      products.findIndex((entry) => entry._id === product._id),
    ),
  };
  const manifest = {
    schemaVersion: 1,
    version,
    prefix,
    total: products.length,
    currency: metadata.currency,
    syncedAt: metadata.syncedAt,
  };
  const files = new Map([
    [`${prefix}meta.json`, json(metadata)],
    [`${prefix}index.json`, json(index)],
    [`${prefix}pages.json`, json(pageDirectory)],
    [`${prefix}pages.bin`, pagesPack.bytes()],
    [`${prefix}summaries.bin`, summariesPack.bytes()],
    [`${prefix}products.bin`, productsPack.bytes()],
    [`${prefix}thumbnails.bin`, thumbnailsPack.bytes()],
    ["manifest.json", json(manifest)],
  ]);
  const inventory = [];
  for (const [key, bytes] of files) {
    const target = path.join(destination, ...key.split("/"));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
    inventory.push({
      key,
      bytes: bytes.length,
      sha256: digest(bytes),
      contentType: key.endsWith(".json")
        ? "application/json"
        : "application/octet-stream",
    });
  }
  await writeFile(
    path.join(destination, "upload-plan.json"),
    JSON.stringify(
      {
        bucket: "luxar-demo-catalog",
        version,
        total: products.length,
        files: inventory,
      },
      null,
      2,
    ),
  );
  return {
    manifest,
    inventory,
    destination,
    totalBytes: inventory.reduce((sum, file) => sum + file.bytes, 0),
  };
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const result = await buildExport(await loadCatalog());
  console.log(
    `Prepared ${result.manifest.total.toLocaleString()} products as ${result.inventory.length} R2 objects.`,
  );
  console.log(`Version: ${result.manifest.version}`);
  console.log(`Upload size: ${(result.totalBytes / 1024 ** 2).toFixed(1)} MiB`);
  console.log(`Upload directory: ${result.destination}`);
  console.log(
    "No cloud objects were uploaded. Run npm run upload to inspect the upload plan.",
  );
}
