"use client";

import { useEffect, useState } from "react";
import LandingPageBuilder from "@/components/landing/builder/LandingPageBuilder";
import { useTheme } from "@/components/ThemeProvider";
import { getReadableTextColor, hexToHsl, toRgbCssValue } from "@/lib/color-utils";
import { normalizeLandingBuilderContent } from "@/lib/landing-builder";
import type { LandingBuilderContent } from "@/lib/landing-builder";
import type { LandingPreviewPayload } from "@/lib/preview/landing-preview";
import type { LandingPageData } from "@/services/content/landing-page.service";
import type { IBrandingConfig, IThemeSettings } from "@/models";
import type { IBrandingColors, IBrandingLogo } from "@/models/branding.model";

interface LandingPreviewClientProps {
  initialPayload: LandingPreviewPayload;
  initialLandingData: LandingPageData | null;
}

export default function LandingPreviewClient({
  initialPayload,
  initialLandingData,
}: LandingPreviewClientProps) {
  const { setBranding, setThemeSettings } = useTheme();
  const [payload, setPayload] = useState<LandingPreviewPayload>(initialPayload);
  const [config, setConfig] = useState<LandingBuilderContent>(
    normalizeLandingBuilderContent(initialPayload.builderConfig)
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: Trust origin from TMS
      if (typeof event.data !== "object" || event.data.type !== "AYAHAY_LANDING_PREVIEW_SYNC") {
        return;
      }

      const rawPayload = event.data.payload as LandingPreviewPayload;
      if (rawPayload) {
        setPayload(rawPayload);
        setConfig(normalizeLandingBuilderContent(rawPayload.builderConfig));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    const previewConfig = payload.config;
    if (!previewConfig) {
      return;
    }

    const baseBranding = initialLandingData?.brandingConfig;
    const incomingColors = {
      ...(baseBranding?.colors ?? {}),
      ...(previewConfig.colors ?? {}),
    };
    const colors: IBrandingColors = {
      primaryColor: incomingColors.primaryColor || incomingColors.primary || "#004C70",
      secondaryColor: incomingColors.secondaryColor || incomingColors.secondary || "#7ACCFA",
      primary: incomingColors.primary || incomingColors.primaryColor || "#004C70",
      secondary: incomingColors.secondary || incomingColors.secondaryColor || "#7ACCFA",
      accent: incomingColors.accent || baseBranding?.colors?.accent || "#042B3F",
      surface: incomingColors.surface || baseBranding?.colors?.surface || "#FFFFFF",
      surfaceAlt: incomingColors.surfaceAlt || baseBranding?.colors?.surfaceAlt || "#EEF8FC",
    };
    const logo: IBrandingLogo = {
      light:
        previewConfig.logo?.light ||
        baseBranding?.logo?.light ||
        previewConfig.logo?.dark ||
        baseBranding?.logo?.dark ||
        "",
      dark:
        previewConfig.logo?.dark ||
        baseBranding?.logo?.dark ||
        previewConfig.logo?.light ||
        baseBranding?.logo?.light ||
        "",
    };

    const mergedBranding: IBrandingConfig = {
      id: baseBranding?.id ?? "preview-branding",
      brand_name: previewConfig.brand_name ?? baseBranding?.brand_name ?? "Ayahay",
      domain_name: previewConfig.domain_name ?? baseBranding?.domain_name ?? "",
      subdomain_name: previewConfig.subdomain_name ?? baseBranding?.subdomain_name ?? "",
      favicon_url: previewConfig.favicon_url ?? baseBranding?.favicon_url ?? "",
      font_family:
        previewConfig.font_family ??
        previewConfig.fontFamily ??
        baseBranding?.font_family ??
        baseBranding?.fontFamily ??
        "Jost",
      font_family_title:
        previewConfig.font_family_title ??
        previewConfig.fontFamilyTitle ??
        baseBranding?.font_family_title ??
        baseBranding?.fontFamilyTitle ??
        previewConfig.font_family ??
        previewConfig.fontFamily ??
        baseBranding?.font_family ??
        baseBranding?.fontFamily ??
        "Jost",
      colors,
      logo,
      slogan: previewConfig.slogan ?? baseBranding?.slogan ?? null,
      motto: previewConfig.motto ?? baseBranding?.motto ?? null,
      tagline: previewConfig.tagline ?? baseBranding?.tagline ?? null,
      created_at: baseBranding?.created_at ?? "",
      updated_at: baseBranding?.updated_at ?? "",
    };

    const primary = colors.primaryColor || colors.primary || "#004C70";
    const secondary = colors.secondaryColor || colors.secondary || "#7ACCFA";
    const accent = colors.accent || "#042B3F";
    const surface = colors.surface || "#FFFFFF";
    const surfaceAlt = colors.surfaceAlt || "#EEF8FC";
    const textOnSurface = getReadableTextColor(surface);
    const textOnSurfaceAlt = getReadableTextColor(surfaceAlt);
    const mutedOnSurface = textOnSurface === "#f8fafc" ? "#cbd5e1" : "#64748b";

    const themeSettings: IThemeSettings = {
      primary,
      secondary,
      accent,
      primaryColor: primary,
      secondaryColor: secondary,
      surface,
      surfaceAlt,
      fontStyle: mergedBranding.font_family || mergedBranding.fontFamily || "Jost",
      fontTitle:
        mergedBranding.font_family_title ||
        mergedBranding.fontFamilyTitle ||
        mergedBranding.font_family ||
        mergedBranding.fontFamily ||
        "Jost",
    };

    setBranding(mergedBranding);
    setThemeSettings(themeSettings);

    const root = document.documentElement;
    root.style.setProperty("--primary", hexToHsl(primary));
    root.style.setProperty("--secondary", hexToHsl(secondary));
    root.style.setProperty("--accent", hexToHsl(accent));
    root.style.setProperty("--surface", surface);
    root.style.setProperty("--surface-alt", surfaceAlt);
    root.style.setProperty("--text-on-surface", textOnSurface);
    root.style.setProperty("--text-on-surface-alt", textOnSurfaceAlt);
    root.style.setProperty("--muted-on-surface", mutedOnSurface);
    root.style.setProperty("--text-default-rgb", toRgbCssValue(textOnSurface));
  }, [initialLandingData?.brandingConfig, payload.config, setBranding, setThemeSettings]);

  return (
    <LandingPageBuilder 
      config={config} 
      previewPayload={payload} 
      landingData={initialLandingData} 
    />
  );
}
