import type { IThemeSettings } from "@/models";
import type { IBrandingConfig } from "@/models/branding.model";

/**
 * Single source for building IThemeSettings from whitelabel branding.
 * Used by ThemeProvider and useThemeSettings so server branding is never
 * overridden by stale localStorage when colors are already in context.
 */
export function deriveThemeFromBranding(branding: IBrandingConfig | null): IThemeSettings | null {
  if (!branding?.colors) return null;
  const c = branding.colors as {
    primaryColor?: string;
    primary?: string;
    secondaryColor?: string;
    secondary?: string;
    accent?: string;
    surface?: string;
    surfaceAlt?: string;
  };
  const primary = c.primaryColor || c.primary;
  const secondary = c.secondaryColor || c.secondary;
  if (!primary && !secondary && !c.accent) return null;
  return {
    primary: primary || "#004C70",
    secondary: secondary || "#7ACCFA",
    accent: c.accent || "#042B3F",
    primaryColor: primary || "#004C70",
    secondaryColor: secondary || "#7ACCFA",
    surface: c.surface || "#FFFFFF",
    surfaceAlt: c.surfaceAlt || "#EEF8FC",
    fontStyle: branding.font_family || branding.fontFamily || "Jost",
    fontTitle:
      branding.font_family_title ||
      branding.fontFamilyTitle ||
      branding.font_family ||
      branding.fontFamily ||
      "Jost",
  };
}
