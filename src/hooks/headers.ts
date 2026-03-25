import { useState, useEffect } from "react";
import { getHeadersSections } from "@/services/ui/header-section.service";
import { IHeaderSection } from "@/models";

const HEADERS_CACHE_KEY = "header_sections";

export const useHeaders = (initialHeaders: IHeaderSection | null = null) => {
  const [headers, setHeaders] = useState<IHeaderSection | null>(initialHeaders);

  useEffect(() => {
    if (initialHeaders) {
      setHeaders(initialHeaders);
    }
  }, [initialHeaders]);

  useEffect(() => {
    if (initialHeaders) {
      return;
    }

    // Try to get cached headers first
    const cached = localStorage.getItem(HEADERS_CACHE_KEY);
    if (cached) {
      try {
        setHeaders(JSON.parse(cached));
        // Skip fetch if cached
        return;
      } catch (e) {
        console.error("Failed to parse cached headers:", e);
      }
    }

    // Fetch fresh headers only if not cached
    getHeadersSections()
      .then((data) => {
        if (data) {
          setHeaders(data);
          
          // Exclude unnecessary fields before caching
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, shippingLineId, ...cacheData } = data;
          localStorage.setItem(HEADERS_CACHE_KEY, JSON.stringify(cacheData));
        }
      })
      .catch((error) => console.error("Error fetching headers settings:", error));
  }, [initialHeaders]);

  return headers;
};
