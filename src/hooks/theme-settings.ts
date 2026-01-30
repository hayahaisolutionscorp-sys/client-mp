import { useState, useEffect } from "react";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { IThemeSettings } from "@/models";

const THEME_CACHE_KEY = "theme_settings";

export const useThemeSettings = () => {
  // Start with null to avoid hydration mismatch
  // Don't read from localStorage during initial render
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);
    
    // Try to get cached theme first for instant display
    const cached = localStorage.getItem(THEME_CACHE_KEY);
    if (cached) {
      try {
        setThemeSettings(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached theme:", e);
      }
    }

    // Then fetch fresh theme in background
    getThemeSettings()
      .then((data) => {
        if (data) {
          setThemeSettings(data);
          // Cache the theme for next time
          localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(data));
        }
      })
      .catch((error) => console.error("Error fetching theme settings:", error));
  }, []);

  return themeSettings;
};
