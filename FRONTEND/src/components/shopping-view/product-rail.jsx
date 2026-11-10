import { createContext, useContext, useMemo, useState } from "react";

const RailContext = createContext(null);

export function ProductRail({
  children,
  className = "",
  label = "Garments in the collection",
}) {
  const [activeId, setActiveId] = useState(null);
  const value = useMemo(
    () => ({
      activeId,
      activate: (id) => setActiveId(id),
      release: (id) =>
        setActiveId((current) => (current === id ? null : current)),
      toggle: (id) => setActiveId((current) => (current === id ? null : id)),
    }),
    [activeId],
  );
  return (
    <RailContext.Provider value={value}>
      <div
        className={`product-rail ${className}`}
        data-has-selection={activeId ? "true" : "false"}
        role="group"
        aria-label={label}
      >
        {children}
      </div>
    </RailContext.Provider>
  );
}

export function useProductRail() {
  return useContext(RailContext);
}
