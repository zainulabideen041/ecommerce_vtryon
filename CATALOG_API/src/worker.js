const states = new WeakMap();
const SORTS = [
  "price-lowtohigh",
  "price-hightolow",
  "title-atoz",
  "title-ztoa",
];

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const json = (value, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
const positive = (value, fallback, max) =>
  Math.min(max, Math.max(1, Number.parseInt(value, 10) || fallback));

async function readJson(bucket, key, range) {
  const object = await bucket.get(
    key,
    range ? { range: { offset: range[0], length: range[1] } } : undefined,
  );
  if (!object)
    throw new ApiError(
      503,
      "The catalog snapshot is incomplete. Upload all snapshot objects before manifest.json.",
    );
  return object.json();
}
function stateFor(bucket) {
  if (!states.has(bucket))
    states.set(bucket, {
      manifest: null,
      expires: 0,
      pending: null,
      data: new Map(),
      shards: new Map(),
    });
  return states.get(bucket);
}
async function manifestFor(bucket, state) {
  if (state.manifest && state.expires > Date.now()) return state.manifest;
  if (!state.pending) {
    state.pending = readJson(bucket, "manifest.json")
      .then((manifest) => {
        if (
          manifest.schemaVersion !== 1 ||
          !/^[a-f0-9]{16}$/.test(manifest.version) ||
          manifest.prefix !== `snapshots/${manifest.version}/`
        )
          throw new ApiError(
            503,
            "Unsupported catalog snapshot. Export it again with the supplied script.",
          );
        if (state.manifest?.version !== manifest.version) {
          state.data.clear();
          state.shards.clear();
        }
        state.manifest = manifest;
        state.expires = Date.now() + 60000;
        return manifest;
      })
      .finally(() => {
        state.pending = null;
      });
  }
  return state.pending;
}
async function dataFor(bucket, state, manifest, name) {
  const key = `${manifest.version}:${name}`;
  if (!state.data.has(key)) {
    state.data.set(
      key,
      readJson(bucket, `${manifest.prefix}${name}.json`)
        .then((value) => {
          if (name === "index") {
            value.byId = new Map(value.rows.map((row) => [row.id, row]));
            value.byHandle = new Map(value.rows.map((row) => [row.h, row]));
          }
          return value;
        })
        .catch((error) => {
          state.data.delete(key);
          throw error;
        }),
    );
  }
  return state.data.get(key);
}
function queryOptions(params) {
  const keyword = (params.get("keyword") || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (keyword.length > 120)
    throw new ApiError(400, "Search is limited to 120 characters.");
  const split = (key) =>
    [...new Set((params.get(key) || "").split(",").filter(Boolean))].sort();
  const category = split("category");
  const brand = split("brand");
  if (category.length > 80 || brand.length > 40)
    throw new ApiError(400, "Too many filter values.");
  const sort = params.get("sortBy") || SORTS[0];
  if (!SORTS.includes(sort))
    throw new ApiError(400, "Unsupported catalog sort.");
  return {
    category,
    brand,
    keyword,
    sort,
    featured: params.get("featured") === "1",
    page: positive(params.get("page"), 1, 1000000),
    pageSize: positive(params.get("pageSize"), 24, 60),
  };
}
const emptyPage = (pageSize) => ({
  success: true,
  data: [],
  pagination: { page: 1, pageSize, total: 0, pages: 1 },
});

async function listProducts(bucket, state, manifest, options) {
  const directory = await dataFor(bucket, state, manifest, "pages");
  const allBrands =
    !options.brand.length ||
    directory.brands.every((brand) => options.brand.includes(brand));
  if (
    options.brand.length &&
    !directory.brands.some((brand) => options.brand.includes(brand))
  )
    return emptyPage(options.pageSize);
  const allCategories =
    !options.category.length || options.category.includes("women");
  if (!options.keyword && allBrands) {
    if (options.featured && allCategories && options.pageSize === 60) {
      return readJson(
        bucket,
        `${manifest.prefix}pages.bin`,
        directory.featured.range,
      );
    }
    if (
      !options.featured &&
      options.pageSize === 24 &&
      (allCategories || options.category.length === 1)
    ) {
      const branch =
        directory.branches[allCategories ? "" : options.category[0]];
      if (!branch?.total) return emptyPage(24);
      const ranges = branch.sorts[options.sort];
      const page = Math.min(options.page, ranges.length);
      return readJson(bucket, `${manifest.prefix}pages.bin`, ranges[page - 1]);
    }
  }
  const index = await dataFor(bucket, state, manifest, "index");
  const terms = options.keyword.split(" ").filter(Boolean);
  const ordering = options.featured
    ? index.featured
    : index.ordering[options.sort];
  const selected = ordering.filter((number) => {
    const row = index.rows[number];
    return (
      (allCategories ||
        options.category.some(
          (category) => category === row.c || category === row.t,
        )) &&
      (!options.brand.length || options.brand.includes(row.b)) &&
      terms.every((term) => row.s.includes(term))
    );
  });
  const total = selected.length;
  const pages = Math.max(1, Math.ceil(total / options.pageSize));
  const page = Math.min(options.page, pages);
  const rows = selected
    .slice((page - 1) * options.pageSize, page * options.pageSize)
    .map((number) => index.rows[number]);
  const shardNumbers = [...new Set(rows.map((row) => row.g))];
  const shards = new Map(
    await Promise.all(
      shardNumbers.map(async (number) => {
        const key = `${manifest.version}:${number}`;
        if (!state.shards.has(key)) {
          state.shards.set(
            key,
            readJson(
              bucket,
              `${manifest.prefix}summaries.bin`,
              index.shards[number],
            ).catch((error) => {
              state.shards.delete(key);
              throw error;
            }),
          );
        }
        return [number, await state.shards.get(key)];
      }),
    ),
  );
  return {
    success: true,
    data: rows.map((row) => shards.get(row.g)[row.id]),
    pagination: { page, pageSize: options.pageSize, total, pages },
  };
}

async function routeRequest(url, bucket, state, manifest) {
  const route = url.pathname.replace(/\/+$/, "");
  if (route === "/api/meta")
    return json({
      success: true,
      data: await dataFor(bucket, state, manifest, "meta"),
    });
  if (route === "/api/products")
    return json(
      await listProducts(
        bucket,
        state,
        manifest,
        queryOptions(url.searchParams),
      ),
    );
  const product = route.match(/^\/api\/products\/(local-\d+)$/);
  if (product) {
    const index = await dataFor(bucket, state, manifest, "index");
    const row = index.byId.get(product[1]);
    if (!row) throw new ApiError(404, "Preview product not found.");
    return json({
      success: true,
      data: await readJson(bucket, `${manifest.prefix}products.bin`, row.d),
    });
  }
  const thumbnail = route.match(
    /^\/api\/thumbnail\/([a-z0-9][a-z0-9-]{0,511})$/,
  );
  if (thumbnail) {
    const index = await dataFor(bucket, state, manifest, "index");
    const row = index.byHandle.get(thumbnail[1]);
    if (!row) throw new ApiError(404, "Thumbnail not found.");
    const object = await bucket.get(`${manifest.prefix}thumbnails.bin`, {
      range: { offset: row.j[0], length: row.j[1] },
    });
    if (!object) throw new ApiError(503, "Thumbnail data is not uploaded yet.");
    return new Response(object.body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(row.j[1]),
      },
    });
  }
  throw new ApiError(404, "Catalog endpoint not found.");
}

function corsHeaders(response, origin, version) {
  const headers = new Headers(response.headers);
  headers.set("Vary", "Origin");
  headers.set("X-Content-Type-Options", "nosniff");
  if (version) headers.set("X-Catalog-Version", version);
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "If-None-Match");
    headers.set("Access-Control-Expose-Headers", "ETag, X-Catalog-Version");
  }
  return new Response(response.body, { status: response.status, headers });
}
async function etagFor(key, version) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  );
  const value = [...new Uint8Array(hash)]
    .slice(0, 8)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  return `W/"${version}-${value}"`;
}
async function prepareResponse(response, url, version, ttl) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", `public, max-age=${ttl}`);
  headers.set("ETag", await etagFor(url.href, version));
  if (headers.get("Content-Type")?.startsWith("application/json")) {
    const value = await response.json();
    const body = JSON.stringify(value, (key, entry) =>
      key === "thumbnail" &&
      typeof entry === "string" &&
      entry.startsWith("/__local-catalog/")
        ? `${url.origin}/api/${entry.slice("/__local-catalog/".length)}`
        : entry,
    );
    return new Response(body, { headers, status: response.status });
  }
  return new Response(response.body, { headers, status: response.status });
}

export function createWorker({
  cache = () => globalThis.caches?.default,
} = {}) {
  return {
    async fetch(request, env, ctx = {}) {
      const url = new URL(request.url);
      const origin = request.headers.get("Origin");
      const allowed = (env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      if (origin && !allowed.includes(origin))
        return corsHeaders(
          json(
            {
              success: false,
              message:
                "This storefront origin is not configured for the demo API.",
            },
            403,
          ),
          null,
        );
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
        const response = json(
          { success: false, message: "This catalog API is read-only." },
          405,
        );
        response.headers.set("Allow", "GET, HEAD, OPTIONS");
        return corsHeaders(response, origin);
      }
      if (request.method === "OPTIONS") {
        const method = request.headers.get("Access-Control-Request-Method");
        if (method && !["GET", "HEAD"].includes(method))
          return corsHeaders(
            json(
              { success: false, message: "Only catalog reads are allowed." },
              405,
            ),
            origin,
          );
        const response = new Response(null, {
          status: 204,
          headers: { "Access-Control-Max-Age": "86400" },
        });
        return corsHeaders(response, origin);
      }
      try {
        if (!env.CATALOG_BUCKET)
          throw new ApiError(503, "The CATALOG_BUCKET R2 binding is missing.");
        if (url.href.length > 4096)
          throw new ApiError(400, "Request URL is too long.");
        const bucket = env.CATALOG_BUCKET;
        const state = stateFor(bucket);
        const manifest = await manifestFor(bucket, state);
        if (["/", "/api", "/api/", "/api/health"].includes(url.pathname)) {
          const response = corsHeaders(
            json({
              success: true,
              service: "luxar-demo-api",
              readOnly: true,
              version: manifest.version,
              total: manifest.total,
            }),
            origin,
            manifest.version,
          );
          return request.method === "HEAD"
            ? new Response(null, {
                status: response.status,
                headers: response.headers,
              })
            : response;
        }
        const ttl = positive(env.CACHE_TTL_SECONDS, 300, 3600);
        // Drop unknown parameters and sort keys for a stable cache key. CORS is
        // added after the cache so one origin never receives another's header.
        const canonical = new URL(
          url.origin + url.pathname.replace(/\/+$/, ""),
        );
        if (canonical.pathname === "/api/products") {
          const options = queryOptions(url.searchParams);
          canonical.search = new URLSearchParams({
            category: options.category.join(","),
            brand: options.brand.join(","),
            keyword: options.keyword,
            sortBy: options.sort,
            page: options.page,
            pageSize: options.pageSize,
            featured: options.featured ? "1" : "0",
          }).toString();
        }
        const cacheKey = new Request(
          `${canonical.origin}/__catalog-cache/${manifest.version}${canonical.pathname}${canonical.search}`,
        );
        const store = cache();
        let response = store ? await store.match(cacheKey) : null;
        if (!response) {
          response = await prepareResponse(
            await routeRequest(canonical, bucket, state, manifest),
            canonical,
            manifest.version,
            ttl,
          );
          if (store && ctx.waitUntil)
            ctx.waitUntil(
              store.put(cacheKey, response.clone()).catch(() => {}),
            );
        }
        response = corsHeaders(response, origin, manifest.version);
        if (
          request.headers.get("If-None-Match") === response.headers.get("ETag")
        )
          return new Response(null, { status: 304, headers: response.headers });
        return request.method === "HEAD"
          ? new Response(null, {
              status: response.status,
              headers: response.headers,
            })
          : response;
      } catch (error) {
        const response = corsHeaders(
          json(
            {
              success: false,
              message:
                error instanceof ApiError
                  ? error.message
                  : "The demo catalog is temporarily unavailable.",
            },
            error instanceof ApiError ? error.status : 503,
          ),
          origin,
        );
        response.headers.set("Cache-Control", "no-store");
        return request.method === "HEAD"
          ? new Response(null, {
              status: response.status,
              headers: response.headers,
            })
          : response;
      }
    },
  };
}

export default createWorker();
