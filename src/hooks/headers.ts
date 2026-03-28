import { useState, useEffect } from "react";
import { getHeadersSections } from "@/services/ui/header-section.service";
import type { HeaderNavigationConfig } from "@/lib/landing-nav";

const HEADERS_CACHE_KEY = "header_sections";

const getCachedHeaders = (): HeaderNavigationConfig | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const cached = localStorage.getItem(HEADERS_CACHE_KEY);
  if (!cached) {
    return null;
  }

  try {
    return JSON.parse(cached) as HeaderNavigationConfig;
  } catch (e) {
    console.error("Failed to parse cached headers:", e);
    return null;
  }
};

export const useHeaders = (initialHeaders: HeaderNavigationConfig | null = null) => {
  const [headers, setHeaders] = useState<HeaderNavigationConfig | null>(
    () => initialHeaders ?? getCachedHeaders()
  );

  useEffect(() => {
    if (initialHeaders) {
      setHeaders(initialHeaders);
    }
  }, [initialHeaders]);

  useEffect(() => {
    if (initialHeaders) {
      return;
    }

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
