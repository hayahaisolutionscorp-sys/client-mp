"use client";

import { useEffect } from "react";
import { IThemeSettings } from "@/models";

const BRANDING_CACHE_KEY = "branding_config";

export default function ThemeHydrator({ theme, isFallback }: { theme: IThemeSettings, isFallback?: boolean }) {
    useEffect(() => {
        if (typeof window === "undefined" || isFallback) return;

        // Seed the cache with the server-fetched theme
        // We only need to store the essential fields
        const { primary, secondary, accent, fontStyle, primaryColor, secondaryColor } = theme;
        const cacheData = { primary, secondary, accent, fontStyle, primaryColor, secondaryColor };

        localStorage.setItem("theme_settings", JSON.stringify(cacheData));

        // Also sync to branding_config if colors match
        const cachedBranding = localStorage.getItem(BRANDING_CACHE_KEY);
        if (cachedBranding) {
            try {
                const branding = JSON.parse(cachedBranding);
                branding.colors = {
                    ...branding.colors,
                    primary: primary,
                    secondary: secondary,
                    accent: accent,
                    primaryColor: primaryColor || primary,
                    secondaryColor: secondaryColor || secondary,
                };
                localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(branding));
            } catch (e) {
                console.error("Failed to sync branding cache:", e);
            }
        }
    }, [theme]);

    return null;
}
