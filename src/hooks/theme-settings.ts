"use client";

import { useEffect, useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { IThemeSettings } from "@/models";
import { IS_CLIENT } from "@/services/config";
import brandingData from "@/data/branding.json";

const BRANDING_CACHE_KEY = "branding_config";

export const useThemeSettings = () => {
  const { themeSettings, setThemeSettings } = useTheme();

  const defaultTheme = useMemo(() => {
    return {
      primaryColor: brandingData.colors.primary,
      secondaryColor: brandingData.colors.secondary,
      primary: brandingData.colors.primary,
      secondary: brandingData.colors.secondary,
      accent: brandingData.colors.accent,
      fontStyle: 'Inter'
    } as IThemeSettings;
  }, []);

  useEffect(() => {
    if (!IS_CLIENT) {
      return;
    }

    // Skip if ThemeProvider already supplied theme settings (from server-side fetch)
    if (themeSettings) {
      return;
    }

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
            surface: branding.colors.surface || '#FFFFFF',
            surfaceAlt: branding.colors.surfaceAlt || '#EEF8FC',
            fontStyle: 'Inter'
          };
          setThemeSettings(derivedTheme);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached branding for theme:", e);
      }
    }

    const themeCached = localStorage.getItem("theme_settings");
    if (themeCached) {
      try {
        setThemeSettings(JSON.parse(themeCached));
        return;
      } catch (e) {
        console.error("Failed to parse theme_settings:", e);
      }
    }

    // Fetch fresh theme only if nothing cached and nothing from provider
    getThemeSettings()
      .then((data) => {
        if (data) {
          setThemeSettings(data);

          // Exclude unnecessary fields before caching for consistency
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { created_at, updated_at, ...cacheData } = data as any;
          localStorage.setItem("theme_settings", JSON.stringify(cacheData));
        }
      })
      .catch((error) => console.error("Error fetching theme settings:", error));
  }, [setThemeSettings, themeSettings]);

  return themeSettings || (!IS_CLIENT ? defaultTheme : null);
};
