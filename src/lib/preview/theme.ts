import type { IBrandingConfig, IThemeSettings } from "@/models";
import type { PreviewGeneralConfig } from "./landing-preview";

export function buildPreviewBranding(
  previewConfig: PreviewGeneralConfig | null | undefined,
  baseBranding: IBrandingConfig | null | undefined
): IBrandingConfig {
  const incomingColors = {
    ...(baseBranding?.colors ?? {}),
    ...(previewConfig?.colors ?? {}),
  };

  return {
    id: baseBranding?.id ?? "preview-branding",
    brand_name: previewConfig?.brand_name ?? baseBranding?.brand_name ?? "Ayahay",
    domain_name: previewConfig?.domain_name ?? baseBranding?.domain_name ?? "",
    subdomain_name: previewConfig?.subdomain_name ?? baseBranding?.subdomain_name ?? "",
    favicon_url: previewConfig?.favicon_url ?? baseBranding?.favicon_url ?? "",
    font_family:
      previewConfig?.font_family ??
      previewConfig?.fontFamily ??
      baseBranding?.font_family ??
      baseBranding?.fontFamily ??
      "Jost",
    font_family_title:
      previewConfig?.font_family_title ??
      previewConfig?.fontFamilyTitle ??
      baseBranding?.font_family_title ??
      baseBranding?.fontFamilyTitle ??
      previewConfig?.font_family ??
      previewConfig?.fontFamily ??
      baseBranding?.font_family ??
      baseBranding?.fontFamily ??
      "Jost",
    colors: {
      ...incomingColors,
      primaryColor: incomingColors.primaryColor ?? incomingColors.primary ?? "#004C70",
      secondaryColor: incomingColors.secondaryColor ?? incomingColors.secondary ?? "#7ACCFA",
      primary: incomingColors.primary ?? incomingColors.primaryColor ?? "#004C70",
      secondary: incomingColors.secondary ?? incomingColors.secondaryColor ?? "#7ACCFA",
      accent: incomingColors.accent ?? baseBranding?.colors?.accent ?? "#042B3F",
      surface: incomingColors.surface ?? baseBranding?.colors?.surface ?? "#FFFFFF",
      surfaceAlt: incomingColors.surfaceAlt ?? baseBranding?.colors?.surfaceAlt ?? "#EEF8FC",
    },
    logo: {
      light:
        previewConfig?.logo?.light ||
        baseBranding?.logo?.light ||
        previewConfig?.logo?.dark ||
        baseBranding?.logo?.dark ||
        "",
      dark:
        previewConfig?.logo?.dark ||
        baseBranding?.logo?.dark ||
        previewConfig?.logo?.light ||
        baseBranding?.logo?.light ||
        "",
    },
    slogan: previewConfig?.slogan ?? baseBranding?.slogan ?? null,
    motto: previewConfig?.motto ?? baseBranding?.motto ?? null,
    tagline: previewConfig?.tagline ?? baseBranding?.tagline ?? null,
    created_at: baseBranding?.created_at ?? "",
    updated_at: baseBranding?.updated_at ?? "",
  };
}

export function buildPreviewThemeSettings(
  previewConfig: PreviewGeneralConfig | null | undefined,
  baseBranding: IBrandingConfig | null | undefined
): { branding: IBrandingConfig; themeSettings: IThemeSettings } {
  const branding = buildPreviewBranding(previewConfig, baseBranding);
  const primary = branding.colors?.primaryColor || branding.colors?.primary || "#004C70";
  const secondary = branding.colors?.secondaryColor || branding.colors?.secondary || "#7ACCFA";
  const accent = branding.colors?.accent || "#042B3F";
  const surface = branding.colors?.surface || "#FFFFFF";
  const surfaceAlt = branding.colors?.surfaceAlt || "#EEF8FC";

  return {
    branding,
    themeSettings: {
      primary,
      secondary,
      accent,
      primaryColor: primary,
      secondaryColor: secondary,
      surface,
      surfaceAlt,
      fontStyle: branding.font_family || branding.fontFamily || "Jost",
      fontTitle:
        branding.font_family_title ||
        branding.fontFamilyTitle ||
        branding.font_family ||
        branding.fontFamily ||
        "Jost",
    },
  };
}
