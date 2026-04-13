import type { IThemeSettings } from "@/models";
import { getReadableTextColor, hexToHsl, toRgbCssValue } from "@/lib/color-utils";

/** Matches `app/layout.tsx` — per-font optical scaling for html { font-size } */
export const THEME_FONT_SCALE_MAP: Record<string, string> = {
  Jost: "100%",
  Roboto: "100%",
  Inter: "100%",
  Poppins: "98%",
  Montserrat: "95%",
  "League Spartan": "105%",
  Manrope: "100%",
  Urbanist: "100%",
  "Plus Jakarta Sans": "98%",
};

const GOOGLE_FONT_LINK_ID = "ayahay-dynamic-google-fonts";

/**
 * Valid `font-family` stack for inline styles and CSS custom properties.
 * Raw names like `Plus Jakarta Sans` must be quoted or the browser treats them as multiple families.
 */
export function formatCssFontStack(
  family: string | undefined | null,
  fallbackFamily: string | undefined | null = "Jost"
): string {
  const raw = (family ?? "").trim();
  const fb = (fallbackFamily ?? "Jost").trim();
  const name = raw || fb;
  const escaped = name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}", sans-serif`;
}

/**
 * Load / update Google Fonts for body + title families (same families as layout.tsx @import).
 */
export function ensureGoogleFontsStylesheet(fontStyle: string, fontTitle: string): void {
  if (typeof document === "undefined") return;
  const body = (fontStyle || "Jost").trim().replace(/ /g, "+");
  const title = (fontTitle || fontStyle || "Jost").trim().replace(/ /g, "+");
  const href = `https://fonts.googleapis.com/css2?family=${body}:wght@400;700&family=${title}:wght@400;700&display=swap`;

  let link = document.getElementById(GOOGLE_FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.id = GOOGLE_FONT_LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== href) {
    link.setAttribute("href", href);
  }
}

/**
 * Apply whitelabel typography to :root so it matches `app/layout.tsx` global rules
 * (`body, html, * { font-family: var(--font-body) !important }`).
 */
export function applyThemeTypographyToRoot(theme: IThemeSettings): void {
  if (typeof document === "undefined") return;
  const fontStyle = theme.fontStyle?.trim() || "Jost";
  const fontTitle = theme.fontTitle?.trim() || fontStyle;
  const root = document.documentElement;

  root.style.setProperty("--font-body", formatCssFontStack(fontStyle));
  root.style.setProperty("--font-title", formatCssFontStack(fontTitle, fontStyle));
  root.style.fontSize = THEME_FONT_SCALE_MAP[fontStyle] || "100%";

  ensureGoogleFontsStylesheet(fontStyle, fontTitle);
}

/**
 * Full :root sync for client-side theme (matches ThemeProvider + app/layout.tsx tokens).
 * Safe to call from preview useLayoutEffect before paint, and from ThemeProvider when context updates.
 */
export function applyFullThemeToDocument(theme: IThemeSettings): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const surface = theme.surface || "#FFFFFF";
  const surfaceAlt = theme.surfaceAlt || "#EEF8FC";
  const textOnSurface = getReadableTextColor(surface);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAlt);
  const mutedOnSurface = textOnSurface === "#f8fafc" ? "#cbd5e1" : "#64748b";

  root.style.setProperty("--primary", hexToHsl(theme.primary));
  root.style.setProperty("--secondary", hexToHsl(theme.secondary));
  root.style.setProperty("--accent", hexToHsl(theme.accent));
  root.style.setProperty("--surface", surface);
  root.style.setProperty("--surface-alt", surfaceAlt);
  root.style.setProperty("--text-on-surface", textOnSurface);
  root.style.setProperty("--text-on-surface-alt", textOnSurfaceAlt);
  root.style.setProperty("--muted-on-surface", mutedOnSurface);
  root.style.setProperty("--text-default-rgb", toRgbCssValue(textOnSurface));
  applyThemeTypographyToRoot(theme);
}
