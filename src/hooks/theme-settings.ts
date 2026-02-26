"use client";

import { useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { getThemeSettings } from "@/services/ui/theme-settings.service";
import { IThemeSettings } from "@/models";

const BRANDING_CACHE_KEY = "branding_config";

export const useThemeSettings = () => {
  const { themeSettings, setThemeSettings } = useTheme();

  useEffect(() => {
    // If we already have theme settings from context (server-side initialTheme),
    // we don't need to do anything immediately.
    if (themeSettings) {
      return;
    }

    // Fallback: Try to get cached branding/theme
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

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, created_at, updated_at, ...cacheData } = data as any;
          localStorage.setItem("theme_settings", JSON.stringify(cacheData));
        }
      })
      .catch((error) => console.error("Error fetching theme settings:", error));
  }, [themeSettings, setThemeSettings]);

  return themeSettings;
};
