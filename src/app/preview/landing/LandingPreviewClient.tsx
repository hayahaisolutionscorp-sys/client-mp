"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import LandingPageBuilder from "@/components/landing/builder/LandingPageBuilder";
import { useTheme } from "@/components/ThemeProvider";
import { getReadableTextColor, hexToHsl, toRgbCssValue } from "@/lib/color-utils";
import { normalizeLandingBuilderContent } from "@/lib/landing-builder";
import type { LandingBuilderContent } from "@/lib/landing-builder";
import type { LandingPreviewPayload } from "@/lib/preview/landing-preview";
import type { LandingPageData } from "@/services/content/landing-page.service";
import { buildPreviewBranding } from "@/lib/preview/theme";
import { usePreviewSyncPayload } from "@/lib/preview/use-preview-sync-payload";
import { usePreviewScrollToSection } from "@/lib/preview/use-preview-scroll-to-section";
import type { IThemeSettings } from "@/models";

function NoPayloadPlaceholder() {
  const [standalone, setStandalone] = useState<boolean | null>(null);
  useEffect(() => {
    setStandalone(window.parent === window);
  }, []);
  if (standalone !== true) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-alt)] text-slate-500 text-sm">
        Loading preview…
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[var(--surface-alt)] px-4 text-center text-slate-500 text-sm">
      <span>Preview data is not available in this tab yet.</span>
      <span className="max-w-md text-xs text-slate-400">
        Open this preview from the TMS whitelabel editor and wait for the iframe to sync. If this URL has no{" "}
        <code className="rounded bg-slate-200/80 px-1">draftId</code> query, open the preview again from the editor.
      </span>
    </div>
  );
}

interface LandingPreviewClientProps {
  initialPayload: LandingPreviewPayload | null;
  initialLandingData: LandingPageData | null;
}
export default function LandingPreviewClient({
  initialPayload,
  initialLandingData,
}: LandingPreviewClientProps) {
  const { setBranding, setThemeSettings } = useTheme();
  const payload = usePreviewSyncPayload(initialPayload, "AYAHAY_LANDING_PREVIEW_SYNC");
  usePreviewScrollToSection();
  const [config, setConfig] = useState<LandingBuilderContent>(
    normalizeLandingBuilderContent(initialPayload?.builderConfig)
  );

  useEffect(() => {
    if (!payload) return;
    setConfig(normalizeLandingBuilderContent(payload.builderConfig));
  }, [payload?.builderConfig]);

  useLayoutEffect(() => {
    const previewConfig = payload?.config;
    // When opened standalone (no payload), use the server-fetched branding
    // so the page doesn't flash white before styles are applied.
    const baseBranding = initialLandingData?.brandingConfig;
    if (!previewConfig && !baseBranding) return;

    const mergedBranding = previewConfig
      ? buildPreviewBranding(previewConfig, baseBranding)
      : baseBranding!;
    const colors = mergedBranding.colors;
    const primary = colors?.primaryColor || colors?.primary || "#004C70";
    const secondary = colors?.secondaryColor || colors?.secondary || "#7ACCFA";
    const accent = colors?.accent || "#042B3F";
    const surface = colors?.surface || "#FFFFFF";
    const surfaceAlt = colors?.surfaceAlt || "#EEF8FC";
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
  }, [initialLandingData?.brandingConfig, payload?.config, setBranding, setThemeSettings]);

  if (!payload) {
    // When opened standalone (no parent iframe), render with landing data only
    // instead of showing a permanent "Loading..." screen
    if (initialLandingData) {
      return <LandingPageBuilder config={config} previewPayload={null} landingData={initialLandingData} />;
    }
    return <NoPayloadPlaceholder />;
  }

  return <LandingPageBuilder config={config} previewPayload={payload} landingData={initialLandingData} />;
}
