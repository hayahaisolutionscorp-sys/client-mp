import { useState, useEffect } from "react";
import { getBrandingConfig } from "@/services/ui/branding.service";
import { IBrandingConfig } from "@/models/branding.model";
import { useTheme } from "@/components/ThemeProvider";

const BRANDING_CACHE_KEY = "branding_config";
const BRANDING_CACHE_TS_KEY = "branding_config_ts";

export const useBranding = () => {
  const { branding: themeBranding } = useTheme();
  const [branding, setBranding] = useState<IBrandingConfig | null>(themeBranding);

  useEffect(() => {
    if (themeBranding) {
      setBranding(themeBranding);
    }
  }, [themeBranding]);

  useEffect(() => {
    // Try to get cached branding first for fast initial paint
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (cached) {
      try {
        setBranding(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached branding:", e);
      }
    }

    // Always fetch fresh branding so whitelabel updates are reflected
    getBrandingConfig()
      .then((data) => {
        if (data) {
          setBranding(data);
          localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(BRANDING_CACHE_TS_KEY, String(Date.now()));
        }
      })
      .catch((error) => console.error("Error fetching branding settings:", error));
  }, []);

  return branding || themeBranding;
};
