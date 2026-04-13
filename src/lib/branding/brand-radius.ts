import type { IBrandingConfig } from "@/models";
import type { CSSProperties } from "react";

/** Maps TMS global corner tokens to CSS lengths for descendant overrides */
export const BRAND_RADIUS_CLASS_TO_CSS: Record<string, string> = {
  "rounded-none": "0px",
  "rounded-sm": "0.125rem",
  "rounded-md": "0.375rem",
  "rounded-lg": "0.5rem",
  "rounded-xl": "0.75rem",
  "rounded-2xl": "1rem",
  "rounded-3xl": "1.5rem",
};

const DEFAULT_FALLBACK_CLASS = "rounded-2xl";

export function resolveBrandCornerRadiusClass(
  branding: IBrandingConfig | null | undefined,
  presetFallbackClass: string = DEFAULT_FALLBACK_CLASS
): string {
  const explicit =
    branding?.corner_radius_class?.trim() || branding?.colors?.cornerRadiusClass?.trim();
  if (explicit) return explicit;
  const preset = presetFallbackClass?.trim();
  return preset || DEFAULT_FALLBACK_CLASS;
}

export function getBrandRadiusCssLength(resolvedRadiusClass: string): string {
  return BRAND_RADIUS_CLASS_TO_CSS[resolvedRadiusClass] ?? BRAND_RADIUS_CLASS_TO_CSS["rounded-2xl"];
}

/** Merge onto a page root so globals.css can apply --wl-br to rounded descendants */
export function brandRadiusScopeStyle(
  branding: IBrandingConfig | null | undefined,
  presetFallbackClass?: string
): CSSProperties {
  const token = resolveBrandCornerRadiusClass(branding, presetFallbackClass ?? DEFAULT_FALLBACK_CLASS);
  return {
    ["--wl-br" as string]: getBrandRadiusCssLength(token),
  };
}
