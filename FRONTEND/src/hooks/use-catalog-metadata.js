import { useEffect, useState } from "react";
import { LOCAL_CATALOG, localCatalogRequest } from "@/lib/catalog-source";

let request;
export function useCatalogMetadata() {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!LOCAL_CATALOG) return;
    let active = true;
    request ||= localCatalogRequest("meta").catch((reason) => {
      request = null;
      throw reason;
    });
    request
      .then((response) => {
        if (active) setMetadata(response.data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return { metadata, error };
}
