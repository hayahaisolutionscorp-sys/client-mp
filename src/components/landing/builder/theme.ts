import type { IBrandingConfig } from "@/models/branding.model";
import type { BuilderThemeTokens } from "./types";
import { getReadableTextColor } from "@/lib/color-utils";

const withFallback = (value: string | undefined | null, fallback: string) => value || fallback;

export function createBuilderTheme(branding: IBrandingConfig): BuilderThemeTokens {
  const primary = withFallback(branding.colors?.primaryColor || branding.colors?.primary, "#004C70");
  const secondary = withFallback(branding.colors?.secondaryColor || branding.colors?.secondary, "#7ACCFA");
  const accent = withFallback(branding.colors?.accent, "#042B3F");
  const surface = withFallback(branding.colors?.surface, "#FFFFFF");
  const surfaceAlt = withFallback(branding.colors?.surfaceAlt, "#EEF8FC");
  const text = getReadableTextColor(surface);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAlt);

  return {
    primary,
    secondary,
    accent,
    surface,
    surfaceAlt,
    text,
    textOnPrimary: getReadableTextColor(primary),
    textOnSecondary: getReadableTextColor(secondary),
    textOnSurfaceAlt,
    muted: text === "#f8fafc" ? "#cbd5e1" : "#64748b",
    mutedOnSurfaceAlt: textOnSurfaceAlt === "#f8fafc" ? "#cbd5e1" : "#64748b",
    fontFamily: withFallback(branding.font_family || branding.fontFamily, "Jost"),
    fontFamilyTitle: withFallback(branding.font_family_title || branding.fontFamilyTitle || branding.font_family || branding.fontFamily, "Jost"),
  };
}
