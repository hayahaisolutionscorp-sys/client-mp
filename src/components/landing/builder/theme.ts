import type { IBrandingConfig } from "@/models/branding.model";
import type { BuilderThemeTokens } from "./types";

const withFallback = (value: string | undefined | null, fallback: string) => value || fallback;

export function createBuilderTheme(branding: IBrandingConfig): BuilderThemeTokens {
  return {
    primary: withFallback(branding.colors?.primaryColor || branding.colors?.primary, "#004C70"),
    secondary: withFallback(branding.colors?.secondaryColor || branding.colors?.secondary, "#7ACCFA"),
    accent: withFallback(branding.colors?.accent, "#042B3F"),
    surface: withFallback(branding.colors?.surface, "#FFFFFF"),
    surfaceAlt: withFallback(branding.colors?.surfaceAlt, "#EEF8FC"),
    text: "#0f172a",
    muted: "#64748b",
    fontFamily: withFallback(branding.font_family || branding.fontFamily, "Jost"),
    fontFamilyTitle: withFallback(branding.font_family_title || branding.fontFamilyTitle || branding.font_family || branding.fontFamily, "Jost"),
  };
}
