# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Catalog source switch

The storefront navbar has a **Dummy / Live** catalog selector. It remembers the
choice in this browser and reloads the catalog with clean product/category state.
Login, the real bag, admin records and payment APIs are preserved. Dummy catalog
items remain preview-only and cannot be added to live checkout.

- **Dummy:** uses `womens-fashion-catalog-open-data` through the read-only Vite
  development API, or a hosted API configured below.
- **Live:** uses the existing store product and search endpoints.
- Development defaults to Dummy; production defaults to Live. Without a hosted
  dummy API, the production Dummy option is disabled.
- The dataset folder is ignored by Git and is never bundled into the app.

To replace the local files with a hosted read-only catalog API, configure the
frontend build environment and rebuild:

```dotenv
VITE_DUMMY_CATALOG_API_URL=https://catalog.example.com/api
VITE_CATALOG_SOURCE=remote
```

The URL is public configuration, not a credential. The API must allow GET
requests from the storefront origin via CORS. Keep storage keys and hosting
credentials server-side.

### Hosted dummy API contract

Use the same normalized output as `tools/local-catalog.mjs`:

- `GET /meta` returns `{ success: true, data: { total, categories, groups, brands,
  currency, ... } }`.
- `GET /products` accepts `category`, `brand`, `sortBy`, `keyword`, `page`,
  `pageSize` and `featured=1`, returning `{ success: true, data: [...],
  pagination: { page, pageSize, total, pages } }`.
- `GET /products/local-<source-id>` returns the full normalized product,
  including real images, variants, attributes and `localPreview: true`.
- Optional `GET /thumbnail/<handle>` returns a JPEG fallback. The client rebases
  the existing local thumbnail URLs to the hosted API base.

Preserve the `local-` ID namespace so preview items remain separate from MongoDB
product IDs. Return paginated summaries and individual detail records; do not
make every visitor download the full dataset.

Suggested hosting: object storage such as Cloudflare R2 for the versioned
snapshot/thumbnails, plus a small read-only catalog API with a compact index.
Preprocess the original JSON when publishing a snapshot; avoid reparsing the full
JSON on every request. Full-size product images already reference the source CDN.
Hosting has not been provisioned or deployed by this change.

The Cloudflare Worker and prepared upload workflow are documented in
[`../CATALOG_API/README.md`](../CATALOG_API/README.md).
