import { useState, useEffect } from "react";
import { getHeadersSections } from "@/services/ui/header-section.service";
import { IHeaderSection } from "@/models";

const HEADERS_CACHE_KEY = "header_sections";

export const useHeaders = () => {
  const [headers, setHeaders] = useState<IHeaderSection | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Try to get cached headers first
    const cached = localStorage.getItem(HEADERS_CACHE_KEY);
    if (cached) {
      try {
        setHeaders(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached headers:", e);
      }
    }

    // Fetch fresh headers in background to keep it updated
    getHeadersSections()
      .then((data) => {
        if (data) {
          setHeaders(data);
          localStorage.setItem(HEADERS_CACHE_KEY, JSON.stringify(data));
        }
      })
      .catch((error) => console.error("Error fetching headers settings:", error));
  }, []);

  return headers;
};
