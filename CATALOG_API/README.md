# Luxar dummy catalog on Cloudflare R2

Worker: **luxar-demo-api**. Private bucket: **luxar-demo-catalog**.

This service serves only the public preview catalog. It has no MongoDB connection,
login system, payment actions, upload endpoint, or product/order mutation routes.
The storefront's Live mode continues using the existing backend.

## Deployment

Deployed 10 November 2026. Snapshot: `e6b43054127159b5` (2,938 products).

- API base: https://luxar-demo-api.luxar-demo-api.workers.dev/api
- Health: https://luxar-demo-api.luxar-demo-api.workers.dev/api/health
- Bucket: `luxar-demo-catalog`, accessed through the Worker binding.

The storefront uses this public API URL by default, including fresh Git checkouts
without the source dataset. `VITE_DUMMY_CATALOG_API_URL` can override it; use
`local` explicitly to restore the original local-data development server.

## Prepared in this workspace

- Read-only Worker, bound to `CATALOG_BUCKET` in `wrangler.jsonc`.
- An exporter for 2,938 products; generated files go under
  `../.catalog-export/luxar-demo-catalog/` and can be removed after upload.
- Eight upload objects, totaling approximately 111.4 MiB.
- Versioned catalog data, checksummed upload plan, and publish-last manifest.
- Localhost CORS, response caching, category/search/filter/sort/pagination,
  real product details and JPEG thumbnail delivery.
- Nine passing API/export checks and a successful production deployment.
- Verified deployed search, pagination, variants, thumbnails, CORS and read-only access.

The export is bigger than the original source folder because it includes
precomputed category/sort pages. This makes normal browsing inexpensive to serve;
visitors receive only the requested page, never the 111 MiB export.

## Updating or redeploying

The initial upload and deployment are complete. Use these commands only when
publishing a new snapshot or redeploying the service.

Open PowerShell and run:

```powershell
cd "F:\Projects\Control Center\ecommerce_vtryon\CATALOG_API"
npx.cmd wrangler login
```

Authorize Wrangler in the browser using the Cloudflare account that owns
`luxar-demo-catalog`. Repeat this only if your Wrangler session has expired.
This login is a user step; no credentials need to be added to the storefront.

Rebuild the local export from the ignored source dataset, then upload it:

```powershell
npm.cmd run export
npm.cmd run upload -- --remote
```

The script verifies file sizes and SHA-256 checksums, uploads the seven snapshot
objects, and uploads `manifest.json` last. It only writes the eight declared keys
to `luxar-demo-catalog`; it does not delete objects or synchronize unrelated files.
If a snapshot upload fails, rerun the command. The active manifest is published
only after all snapshot uploads succeed.

Deploy the Worker:

```powershell
npm.cmd run deploy
```

Wrangler prints a URL like:

```text
https://luxar-demo-api.luxar-demo-api.workers.dev
```

Keep the R2 bucket private. Public Development URL and R2 custom-domain access
are unnecessary because the Worker uses its R2 binding.

## Verify the deployed API

Check the deployed service:

```powershell
Invoke-RestMethod "https://luxar-demo-api.luxar-demo-api.workers.dev/api/health"
Invoke-RestMethod "https://luxar-demo-api.luxar-demo-api.workers.dev/api/products?category=dresses&page=1"
```

Health should show `success: true`, `readOnly: true`, the snapshot version and
`total: 2938`. The products response should contain a page of normalized products
and pagination metadata.

## Connect the storefront

The frontend already defaults to this public URL. Optionally override it in
`FRONTEND/.env.local` (it is not a secret):

```dotenv
VITE_DUMMY_CATALOG_API_URL=https://luxar-demo-api.luxar-demo-api.workers.dev/api
```

Restart/rebuild after changing an environment override. Select **Dummy** in the
navbar to use this API. Production still defaults to Live mode; the public API
default also makes Dummy available there without requiring the dataset files.

The live storefront `https://luxar-vtryon.vercel.app` and local development
origins are configured. Before using another storefront origin, add it to `ALLOWED_ORIGINS` in
`wrangler.jsonc`, keeping the localhost entries if you still need them:

```json
"ALLOWED_ORIGINS": "http://localhost:5173,http://127.0.0.1:5173,https://luxar-vtryon.vercel.app,https://YOUR-STOREFRONT-DOMAIN"
```

Use origins without paths or trailing slashes. Redeploy the Worker after changing
the file. CORS is configured on this Worker, not on the private bucket. Direct
browser navigation and CLI GETs without an Origin header can inspect the public
catalog; CORS is not an authentication system.

Once deployed Dummy mode is verified, the original source dataset is no longer
required to run the storefront. Keep a backup if you want to regenerate or update
the snapshot. Both the source folder and generated export are ignored by Git.

## Rebuild or update the snapshot later

Use Node 24, matching this workspace. If dependencies are not installed:

```powershell
npm.cmd install
```

With the source dataset in the repository root:

```powershell
npm.cmd run export
npm.cmd test
npm.cmd run upload
```

The last command is a checksum-verifying **dry run**. Add `-- --remote` only when
you intend to publish the export to R2. The export's version derives from the
normalized catalog and thumbnail bytes. Unchanged data produces the same version;
changed data produces a new immutable snapshot. Old R2 snapshots are retained.
The active manifest refreshes within 60 seconds in a warm Worker; API responses
use a versioned internal cache and a five-minute browser cache.

## Optional local Worker development

```powershell
npm.cmd run upload -- --local
npm.cmd run dev
```

This populates Wrangler's local R2 simulator and starts the Worker locally.
It does not upload to the real bucket. Set the frontend dummy API URL to the
local address Wrangler prints, with `/api` appended.

## API contract

| Endpoint | Response |
| --- | --- |
| `GET /api/health` | Read-only service health, active version and product count |
| `GET /api/meta` | Departments, taxonomy categories, brands and source metadata |
| `GET /api/products` | Normalized summary records and pagination |
| `GET /api/products/local-<source-id>` | Full preview product, images, variants and attributes |
| `GET /api/thumbnail/<handle>` | Original local JPEG preview |

Listing parameters: `category` and `brand` comma-separated IDs; `keyword` up to
120 characters; `page`; `pageSize` from 1 to 60; `featured=1`; `sortBy` equal to
`price-lowtohigh`, `price-hightolow`, `title-atoz` or `title-ztoa`.

The service accepts GET, HEAD and OPTIONS only. Product IDs keep the `local-`
namespace and records retain `localPreview: true`. Existing store checkout
guards therefore continue to reject preview products.

## Storage layout and runtime behavior

```text
manifest.json
snapshots/<version>/
  meta.json
  index.json
  pages.json
  pages.bin
  summaries.bin
  products.bin
  thumbnails.bin
```

Binary packs contain concatenated individual records or JPEGs. Exported indexes
record UTF-8 byte offsets and lengths; the Worker uses R2 range reads to retrieve
only the requested records. Common 24-product category/sort pages and the homepage
edit are precomputed. Search uses a compact cached index and at most 24 summary
shards. No full source JSON is loaded on each request. Full-resolution product
photography continues using the source CDN URLs.

`.catalog-export/`, `node_modules/`, `.wrangler/` and local secrets are ignored.
Only the Worker, export/upload tooling, configuration and tests belong in Git.

## Troubleshooting

- **503, incomplete snapshot:** run the upload command again and check all eight
  objects, including root-level `manifest.json`, exist in the selected bucket.
- **403 from the storefront:** add its exact origin to `ALLOWED_ORIGINS` and
  redeploy. A frontend URL ending in `/shop/home` is not an origin.
- **Bucket/account not found:** sign into the Cloudflare account owning the
  bucket. With several accounts, select the appropriate one when Wrangler asks,
  or configure its account ID locally.
- **Wrangler permission error:** run from a normal user terminal with permission
  to read/write Wrangler's own local config and logs.
- **Live products still shown:** select Dummy, confirm the frontend environment
  variable and restart/rebuild the frontend after changing it.

References: [R2 bindings](https://developers.cloudflare.com/r2/api/workers/workers-api-usage/),
[Wrangler uploads](https://developers.cloudflare.com/r2/objects/upload-objects/),
[Worker configuration](https://developers.cloudflare.com/workers/wrangler/configuration/).
