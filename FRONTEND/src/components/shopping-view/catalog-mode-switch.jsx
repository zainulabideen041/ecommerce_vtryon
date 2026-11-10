import {
  CATALOG_MODE,
  DUMMY_CATALOG_AVAILABLE,
  switchCatalogMode,
} from "@/lib/catalog-source";
import "@/catalog-mode-switch.css";

export default function CatalogModeSwitch() {
  return (
    <div className="catalog-mode-switch">
      <span>CATALOG</span>
      <label className={`catalog-mode-label mode-${CATALOG_MODE}`}>
        <span className="catalog-mode-dot" aria-hidden="true" />
        <span className="sr-only">
          Choose dummy preview data or live store catalog. Switching reloads the
          catalog.
        </span>
        <select
          value={CATALOG_MODE}
          onChange={(event) => switchCatalogMode(event.target.value)}
          title={
            DUMMY_CATALOG_AVAILABLE
              ? "Switch storefront catalog. Dummy items are preview-only."
              : "Dummy preview is not available on this deployment."
          }
        >
          <option value="dummy" disabled={!DUMMY_CATALOG_AVAILABLE}>
            Dummy
          </option>
          <option value="live">Live</option>
        </select>
      </label>
    </div>
  );
}
