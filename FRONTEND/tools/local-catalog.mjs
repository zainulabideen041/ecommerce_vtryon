import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const catalogRoot = fileURLToPath(
  new URL("../../womens-fashion-catalog-open-data/", import.meta.url),
);
export const slugify = (value) =>
  String(value || "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const groups = [
  ["dresses", "Dresses", / > Dresses$/],
  ["tops", "Tops & knitwear", / > Clothing Tops(?: >|$)/],
  ["bottoms", "Bottoms", / > (Pants|Shorts|Skirts|Skorts|Leggings)(?: >|$)/],
  ["sets", "Matching sets", / > Outfit Sets$/],
  ["jumpsuits", "Jumpsuits & rompers", / > One-Pieces$/],
  [
    "outerwear",
    "Outerwear",
    / > (Outerwear|Traditional & Ceremonial Clothing)(?: >|$)/,
  ],
  ["swimwear", "Swim & resort", / > Swimwear(?: >|$)/],
  [
    "loungewear",
    "Lounge & sleep",
    / > (Sleepwear(?: & Loungewear)?|Loungewear)(?: >|$)/,
  ],
  ["activewear", "Activewear", / > Activewear(?: >|$)/],
  ["intimates", "Intimates", / > Lingerie(?: >|$)/],
  ["footwear", "Shoes", / > Shoes(?: >|$)/],
  [
    "accessories",
    "Accessories",
    / > (Jewelry|Clothing Accessories|Handbag & Wallet Accessories|Handbags, Wallets & Cases|Luggage|Wigs|Socks)(?: >|$)/,
  ],
];

export function normalizeProduct(item) {
  const path = item.category?.full_path || "";
  const group = groups.find(([, , pattern]) => pattern.test(path)) || [
    "other",
    "More to discover",
  ];
  const variants = (item.variants || []).map((variant, index) => ({
    id: variant.sku || `${item.id}-${index}`,
    sku: variant.sku,
    title: variant.title,
    price: variant.price_usd,
    compareAtPrice: variant.compare_at_price_usd,
    available: !!variant.in_stock,
    options: variant.options || {},
  }));
  const images = (item.images || [])
    .filter((image) => /^https:\/\//.test(image.url))
    .map((image) => ({
      url: image.url,
      alt: image.alt || item.title,
      width: image.width,
      height: image.height,
    }));
  // Availability is not a stock quantity. Never invent an inventory count.
  const available = variants.some((variant) => variant.available);
  return {
    _id: `local-${item.id}`,
    title: item.title,
    handle: item.handle,
    description: item.description,
    image: item.featured_image_url || images[0]?.url,
    thumbnail: `/__local-catalog/thumbnail/${item.handle}`,
    images,
    category: group[0],
    categoryLabel: group[1],
    taxonomy: {
      externalId: item.category.id,
      name: item.category.name,
      slug: `${slugify(item.category.name)}-${item.category.id}`,
      fullPath: path,
    },
    brand: slugify(item.vendor),
    brandLabel: item.vendor,
    productType: item.product_type,
    tags: item.tags || [],
    price: item.price.min_usd,
    salePrice: 0,
    pricing: {
      min: item.price.min_usd,
      max: item.price.max_usd,
      currency: item.price.currency,
    },
    availability: available ? "available" : "sold-out",
    variants,
    attributes: item.metafields || {},
    reviewSummary: { rating: item.reviews.rating, count: item.reviews.count },
    source: {
      provider: "livostyle-open-data",
      externalId: item.id,
      url: item.url,
      updatedAt: item.updated_at,
    },
    localPreview: true,
  };
}

export async function loadCatalog() {
  const [raw, collections, stats] = await Promise.all(
    ["products", "collections", "stats"].map(async (name) =>
      JSON.parse(await readFile(`${catalogRoot}/data/${name}.json`, "utf8")),
    ),
  );
  const products = raw.map(normalizeProduct);
  const categories = [
    ...new Map(
      products.map((product) => [
        product.taxonomy.slug,
        {
          id: product.taxonomy.slug,
          externalId: product.taxonomy.externalId,
          label: product.taxonomy.name,
          fullPath: product.taxonomy.fullPath,
          group: product.category,
        },
      ]),
    ).values(),
  ]
    .map((category) => ({
      ...category,
      count: products.filter((product) => product.taxonomy.slug === category.id)
        .length,
    }))
    .sort((a, b) => b.count - a.count);
  const departments = [
    ...groups.map(([id, label]) => ({ id, label })),
    { id: "other", label: "More to discover" },
  ]
    .map((group) => ({
      ...group,
      count: products.filter((product) => product.category === group.id).length,
      image: products.find((product) => product.category === group.id)?.image,
    }))
    .filter((group) => group.count);
  // Collection exports contain counts, but no product membership. Keep them as
  // source metadata rather than fabricating collection/product relationships.
  return {
    products,
    metadata: {
      source: "Livostyle open data",
      localPreview: true,
      total: products.length,
      variantCount: products.reduce(
        (sum, product) => sum + product.variants.length,
        0,
      ),
      currency: "USD",
      syncedAt: stats.last_synced,
      groups: departments,
      categories,
      brands: [
        ...new Map(
          products.map((product) => [
            product.brand,
            { id: product.brand, label: product.brandLabel },
          ]),
        ).values(),
      ],
      collections: collections.map((collection) => ({
        externalId: collection.id,
        handle: collection.handle,
        title: collection.title,
        sourceProductCount: collection.products_count,
        sourceUrl: collection.url,
      })),
    },
  };
}

export function summarize(product) {
  const { description, variants, attributes, images, source, ...summary } =
    product;
  return {
    ...summary,
    images: images.slice(0, 2),
    source: { provider: source.provider },
    variantCount: variants.length,
  };
}

export function queryCatalog(catalog, params) {
  const selected = (key) => (params.get(key) || "").split(",").filter(Boolean);
  const categories = selected("category");
  const brands = selected("brand");
  const terms = (params.get("keyword") || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  let result = catalog.products.filter(
    (product) =>
      (!categories.length ||
        categories.some(
          (category) =>
            category === "women" ||
            category === product.category ||
            category === product.taxonomy.slug,
        )) &&
      (!brands.length || brands.includes(product.brand)) &&
      (!terms.length ||
        terms.every((term) =>
          `${product.title} ${product.productType} ${product.brandLabel} ${product.taxonomy.fullPath} ${product.tags.join(" ")} ${product.attributes.fabric || ""} ${product.attributes.material || ""} ${product.variants.map((variant) => Object.values(variant.options).join(" ")).join(" ")}`
            .toLowerCase()
            .includes(term),
        )),
  );
  if (params.get("featured") === "1") {
    // Clothing leads the editorial homepage, with a spread across departments.
    const clothing = result.filter(
      (product) =>
        !["accessories", "footwear", "other"].includes(product.category) &&
        product.availability === "available",
    );
    const chosen = [];
    const add = (product) => {
      if (product && !chosen.includes(product)) chosen.push(product);
    };
    for (const term of [
      /burgundy|maroon|wine/i,
      /sage|green/i,
      /teal/i,
      /pink|rose/i,
      /black/i,
      /light blue|blue/i,
      /purple|lavender/i,
      /embroider|lace/i,
    ])
      add(
        clothing.find((product) => product.category === "dresses" && term.test(product.images[0]?.alt || product.title)) ||
        clothing.find((product) => term.test(product.images[0]?.alt || product.title)),
      );
    for (const group of catalog.metadata.groups)
      clothing
        .filter((product) => product.category === group.id)
        .slice(0, 5)
        .forEach(add);
    result = chosen;
  } else {
    const sort = params.get("sortBy");
    result = [...result].sort((a, b) =>
      sort === "price-hightolow"
        ? b.price - a.price
        : sort === "title-atoz"
          ? a.title.localeCompare(b.title)
          : sort === "title-ztoa"
            ? b.title.localeCompare(a.title)
            : a.price - b.price,
    );
  }
  const positive = (value, fallback, max) =>
    Math.min(max, Math.max(1, Number.parseInt(value, 10) || fallback));
  const pageSize = positive(params.get("pageSize"), 24, 60);
  const total = result.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(pages, positive(params.get("page"), 1, pages));
  return {
    success: true,
    data: result.slice((page - 1) * pageSize, page * pageSize).map(summarize),
    pagination: { page, pageSize, total, pages },
  };
}

export function localCatalogPlugin() {
  let loaded;
  return {
    name: "local-fashion-catalog",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__local-catalog", async (req, res, next) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Read-only catalog");
          return;
        }
        try {
          loaded ||= loadCatalog().catch((error) => {
            loaded = null;
            throw error;
          });
          const catalog = await loaded;
          const url = new URL(req.url, "http://localhost");
          if (/^\/thumbnail\/[a-z0-9-]+$/.test(url.pathname)) {
            const handle = url.pathname.split("/").pop();
            if (
              !catalog.products.some((product) => product.handle === handle)
            ) {
              res.statusCode = 404;
              res.end();
              return;
            }
            const photo = await readFile(
              `${catalogRoot}/thumbnails/${handle}.jpg`,
            );
            res.setHeader("Content-Type", "image/jpeg");
            res.setHeader("Cache-Control", "public, max-age=3600");
            res.end(photo);
            return;
          }
          let payload;
          if (url.pathname === "/meta")
            payload = { success: true, data: catalog.metadata };
          else if (url.pathname === "/products")
            payload = queryCatalog(catalog, url.searchParams);
          else if (/^\/products\/local-\d+$/.test(url.pathname)) {
            const product = catalog.products.find(
              (item) => item._id === url.pathname.split("/").pop(),
            );
            res.statusCode = product ? 200 : 404;
            payload = { success: !!product, data: product || null };
          } else {
            next();
            return;
          }
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(payload));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              success: false,
              message:
                "Local catalog could not be read. Check the dataset folder.",
              detail: error.code || "invalid-data",
            }),
          );
        }
      });
    },
  };
}
