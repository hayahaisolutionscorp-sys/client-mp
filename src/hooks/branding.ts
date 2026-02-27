import { useState, useEffect } from "react";
import { getBrandingConfig } from "@/services/ui/branding.service";
import { IBrandingConfig } from "@/models/branding.model";

const BRANDING_CACHE_KEY = "branding_config";

export const useBranding = () => {
  const [branding, setBranding] = useState<IBrandingConfig | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Try to get cached branding first
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (cached) {
      try {
        setBranding(JSON.parse(cached));
        setIsHydrated(true);
        // Avoid redundant fetch if cached
        return;
      } catch (e) {
        console.error("Failed to parse cached branding:", e);
      }
    }

    setIsHydrated(true);

    // Fetch fresh branding only if not cached
    getBrandingConfig()
      .then((data) => {
        if (data) {
          setBranding(data);

          // Exclude unnecessary fields before caching as requested
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { created_at, updated_at, ...cacheData } = data;
          localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(cacheData));
        }
      })
      .catch((error) => console.error("Error fetching branding settings:", error));
  }, []);

  return branding;
};
