import { filterOptions } from "@/config";
import { LOCAL_CATALOG } from "@/lib/catalog-source";
import { useCatalogMetadata } from "@/hooks/use-catalog-metadata";
export default function ProductFilter({
  filters,
  handleFilter,
  onCategoryChange,
}) {
  const { metadata } = useCatalogMetadata();
  const optionsBySection = LOCAL_CATALOG
    ? { category: metadata?.groups || [], brand: metadata?.brands || [] }
    : filterOptions;
  return (
    <div className="filter-panel">
      <h2>Refine the edit</h2>
      {Object.entries(optionsBySection).map(([section, options]) => (
        <fieldset key={section}>
          <legend>{section}</legend>
          {options.map((option) => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={!!filters[section]?.includes(option.id)}
                onChange={() => handleFilter(section, option.id)}
              />
              {option.label}
              {option.count != null && (
                <span className="filter-option-count">{option.count}</span>
              )}
            </label>
          ))}
        </fieldset>
      ))}
      {LOCAL_CATALOG && metadata && (
        <label className="filter-taxonomy-select">
          Specific category
          <select
            value={
              filters.category.find((id) =>
                metadata.categories.some((category) => category.id === id),
              ) || ""
            }
            onChange={(event) => onCategoryChange?.(event.target.value)}
          >
            <option value="">All categories</option>
            {metadata.categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.label} ({category.count})
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
