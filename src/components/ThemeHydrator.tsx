"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { IThemeSettings } from "@/models";

const BRANDING_CACHE_KEY = "branding_config";

export default function ThemeHydrator({ theme, isFallback }: { theme: IThemeSettings, isFallback?: boolean }) {
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined" || isFallback) return;
        if (pathname.startsWith("/preview")) return;

        // Seed the cache with the server-fetched theme
        // We only need to store the essential fields
        const { primary, secondary, accent, fontStyle, primaryColor, secondaryColor, surface, surfaceAlt } = theme;
        const cacheData = { primary, secondary, accent, fontStyle, primaryColor, secondaryColor, surface, surfaceAlt };

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
                    surface: surface || branding.colors?.surface,
                    surfaceAlt: surfaceAlt || branding.colors?.surfaceAlt,
                };
                localStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(branding));
            } catch (e) {
                console.error("Failed to sync branding cache:", e);
            }
        }
    }, [theme, pathname]);

    return null;
}
