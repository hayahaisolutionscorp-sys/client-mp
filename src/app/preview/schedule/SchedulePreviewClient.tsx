"use client";

import { useLayoutEffect, useMemo } from "react";
import { usePreviewSyncPayload } from "@/lib/preview/use-preview-sync-payload";
import type { SchedulePreviewPayload } from "@/lib/preview/schedule-preview";
import { normalizeScheduleBuilderContent } from "@/lib/schedule-builder";
import { ScheduleAndFaresClientPage } from "@/components/schedule-and-fares/ScheduleAndFaresClientPage";
import { useTheme } from "@/components/ThemeProvider";
import type { IBrandingConfig } from "@/models";
import { buildPreviewThemeSettings } from "@/lib/preview/theme";
import { brandRadiusScopeStyle } from "@/lib/branding/brand-radius";

interface SchedulePreviewClientProps {
  initialPayload: SchedulePreviewPayload | null;
}
export default function SchedulePreviewClient({ initialPayload }: SchedulePreviewClientProps) {
  const { setBranding, setThemeSettings } = useTheme();
  const payload = usePreviewSyncPayload(initialPayload, "AYAHAY_SCHEDULE_PREVIEW_SYNC");

  const theme = useMemo(
    () =>
      payload ? buildPreviewThemeSettings(payload.config ?? null, null as IBrandingConfig | null) : null,
    [payload]
  );

  useLayoutEffect(() => {
    if (!theme) return;
    setBranding(theme.branding);
    setThemeSettings(theme.themeSettings);
  }, [theme, setBranding, setThemeSettings]);

  const variants = useMemo(() => {
    const builder = normalizeScheduleBuilderContent(payload?.page?.content);
    const heroSection = builder.sections.find((section) => section.section_key === "hero");
    const datePickerSection = builder.sections.find((section) => section.section_key === "date_picker");
    const fareTableSection = builder.sections.find((section) => section.section_key === "fare_table");

    return {
      heroVariant: heroSection?.enabled === false ? "default" : heroSection?.variant || "default",
      datePickerVariant:
        datePickerSection?.enabled === false ? "default" : datePickerSection?.variant || "default",
      fareTableVariant:
        fareTableSection?.enabled === false
          ? ("default" as const)
          : ((fareTableSection?.variant as "default" | "striped" | "comfortable" | "high-contrast") || "default"),
    };
  }, [payload?.page?.content]);

  if (!payload || !theme) {
    const isStandalone = typeof window !== "undefined" && window.parent === window;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--surface-alt)] text-slate-500 text-sm">
        {isStandalone ? "Open this preview from the TMS editor." : "Loading preview..."}
      </div>
    );
  }

  return (
    <div className="wl-brand-radius-scope" style={brandRadiusScopeStyle(theme.branding, "rounded-2xl")}>
      <ScheduleAndFaresClientPage
        heroVariant={variants.heroVariant}
        datePickerVariant={variants.datePickerVariant}
        fareTableVariant={variants.fareTableVariant}
      />
    </div>
  );
}
