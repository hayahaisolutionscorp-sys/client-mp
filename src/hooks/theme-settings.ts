import { useState, useEffect } from "react";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { IThemeSettings } from "@/models";

const BRANDING_CACHE_KEY = "branding_config";

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<IThemeSettings | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Try to get cached branding first (which contains theme)
    const cached = localStorage.getItem(BRANDING_CACHE_KEY);
    if (cached) {
      try {
        const branding = JSON.parse(cached);
        if (branding && branding.colors) {
          const derivedTheme: IThemeSettings = {
            primaryColor: branding.colors.primaryColor || branding.colors.primary,
            secondaryColor: branding.colors.secondaryColor || branding.colors.secondary,
            primary: branding.colors.primaryColor || branding.colors.primary || '',
            secondary: branding.colors.secondaryColor || branding.colors.secondary || '',
            accent: branding.colors.accent,
            fontStyle: 'Inter'
          };
          setThemeSettings(derivedTheme);
          setIsHydrated(true);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached branding for theme:", e);
      }
    }

    // Fallback to theme settings cache or fetch
    const themeCached = localStorage.getItem("theme_settings");
    if (themeCached) {
        try {
            setThemeSettings(JSON.parse(themeCached));
            setIsHydrated(true);
            return;
        } catch (e) {
            console.error("Failed to parse theme_settings:", e);
        }
    }

    // Mark as hydrated
    setIsHydrated(true);

    // Fetch fresh theme only if nothing cached
    getThemeSettings()
      .then((data) => {
        if (data) {
          setThemeSettings(data);
          
          // Exclude unnecessary fields before caching for consistency
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, created_at, updated_at, ...cacheData } = data as any;
          localStorage.setItem("theme_settings", JSON.stringify(cacheData));
        }
      })
      .catch((error) => console.error("Error fetching theme settings:", error));
  }, []);

  return themeSettings;
};
