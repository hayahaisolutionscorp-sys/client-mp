import { useState, useEffect } from "react";
import { getHeadersSections } from "@/services/ui/header-section.service";
import { IHeaderSection } from "@/models";

const HEADERS_CACHE_KEY = "header_sections";

export const useHeaders = () => {
  const [headers, setHeaders] = useState<IHeaderSection | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Try to get cached headers first
    const cached = localStorage.getItem(HEADERS_CACHE_KEY);
    if (cached) {
      try {
        setHeaders(JSON.parse(cached));
        setIsHydrated(true);
        // Skip fetch if cached
        return;
      } catch (e) {
        console.error("Failed to parse cached headers:", e);
      }
    }

    setIsHydrated(true);

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
  }, []);

  return headers;
};
