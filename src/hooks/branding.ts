import { useState, useEffect } from "react";
import { getBrandingConfig } from "@/services/ui/branding.service";
import { IBrandingConfig } from "@/models/branding.model";

const BRANDING_CACHE_KEY = "branding_config";

export const useBranding = () => {
  const [branding, setBranding] = useState<IBrandingConfig | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Try to get cached branding first
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (cached) {
      try {
        setBranding(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached branding:", e);
      }
    }

    // Fetch fresh branding in background to keep it updated
    getBrandingConfig()
      .then((data) => {
        if (data) {
          setBranding(data);
          localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(data));
        }
      })
      .catch((error) => console.error("Error fetching branding settings:", error));
  }, []);

  return branding;
};
