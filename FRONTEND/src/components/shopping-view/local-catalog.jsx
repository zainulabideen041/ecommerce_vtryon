import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCatalogMetadata } from "@/hooks/use-catalog-metadata";
import { LOCAL_CATALOG } from "@/lib/catalog-source";
import { imageDelivery } from "@/lib/image-delivery";
import "@/local-catalog.css";

export function LocalCatalogNotice() {
  const { metadata, error } = useCatalogMetadata();
  if (!LOCAL_CATALOG) return null;
  return (
    <div className="local-catalog-notice" role="status">
      <span>LOCAL CATALOG PREVIEW</span>
      <p>
        {error
          ? "The local dataset could not be read."
          : metadata
            ? `${metadata.total.toLocaleString()} products · ${metadata.categories.length} categories · USD`
            : "Loading your local fashion catalog…"}
      </p>
      <span>Preview items are excluded from live checkout.</span>
    </div>
  );
}

export function CatalogDirectory() {
  const { metadata } = useCatalogMetadata();
  if (!LOCAL_CATALOG || !metadata) return null;
  return (
    <section
      className="store-section catalog-directory"
      aria-labelledby="catalog-directory-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE WARDROBE, OPENED UP</p>
          <h2 id="catalog-directory-title">
            Every side
            <br />
            <em>of your style.</em>
          </h2>
        </div>
        <div className="section-heading-aside">
          <p>
            {metadata.total.toLocaleString()} pieces across{" "}
            {metadata.categories.length} categories. Find your starting point.
          </p>
          <Link className="text-link" to="/shop/listing">
            Explore every piece <ArrowUpRight size={18} />
          </Link>
        </div>
      </div>
      <div className="catalog-category-grid">
        {metadata.groups.map((group, index) => (
          <Link
            key={group.id}
            to={`/shop/listing?category=${group.id}`}
            className="catalog-category-card"
          >
            <div>
              <img
                {...imageDelivery(group.image, [250, 450])}
                sizes="(max-width: 600px) 62vw, 22vw"
                alt=""
                loading="lazy"
              />
              <span className="catalog-category-number">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <span className="catalog-category-name">
              {group.label}
              <ArrowUpRight size={18} />
            </span>
            <span className="catalog-category-count">
              {group.count.toLocaleString()} pieces
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CatalogPagination({ pagination, onPage, busy = false }) {
  if (!pagination || pagination.pages <= 1) return null;
  return (
    <nav className="catalog-pagination" aria-label="Product pages">
      <span>
        {((pagination.page - 1) * pagination.pageSize + 1).toLocaleString()}–
        {Math.min(
          pagination.page * pagination.pageSize,
          pagination.total,
        ).toLocaleString()}{" "}
        of {pagination.total.toLocaleString()} pieces
      </span>
      <div>
        <button
          disabled={busy || pagination.page <= 1}
          onClick={() => onPage(pagination.page - 1)}
          aria-label="Previous product page"
        >
          <ChevronLeft size={17} />
        </button>
        <label>
          Page
          <select
            value={pagination.page}
            disabled={busy}
            onChange={(event) => onPage(Number(event.target.value))}
          >
            {Array.from({ length: pagination.pages }, (_, index) => (
              <option key={index} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
          of {pagination.pages}
        </label>
        <button
          disabled={busy || pagination.page >= pagination.pages}
          onClick={() => onPage(pagination.page + 1)}
          aria-label="Next product page"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </nav>
  );
}
