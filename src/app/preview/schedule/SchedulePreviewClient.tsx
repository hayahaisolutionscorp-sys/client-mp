"use client";

import { useMemo } from "react";
import { usePreviewSyncPayload } from "@/lib/preview/use-preview-sync-payload";
import type { SchedulePreviewPayload } from "@/lib/preview/schedule-preview";
import { normalizeScheduleBuilderContent } from "@/lib/schedule-builder";
import { ScheduleAndFaresClientPage } from "@/components/schedule-and-fares/ScheduleAndFaresClientPage";
import ThemeProvider from "@/components/ThemeProvider";
import type { IThemeSettings, IBrandingConfig } from "@/models";
import { buildPreviewThemeSettings } from "@/lib/preview/theme";

interface SchedulePreviewClientProps {
  initialPayload: SchedulePreviewPayload;
}

export default function SchedulePreviewClient({ initialPayload }: SchedulePreviewClientProps) {
  const payload = usePreviewSyncPayload(initialPayload, "AYAHAY_SCHEDULE_PREVIEW_SYNC");
  const theme = buildPreviewThemeSettings(payload.config ?? null, null as IBrandingConfig | null);

  const variants = useMemo(() => {
    const builder = normalizeScheduleBuilderContent(payload.page?.content);
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
          : ((fareTableSection?.variant as "default" | "striped") || "default"),
    };
  }, [payload.page?.content]);

  return (
    <ThemeProvider initialTheme={theme.themeSettings as IThemeSettings} initialBranding={theme.branding}>
      <ScheduleAndFaresClientPage
        heroVariant={variants.heroVariant}
        datePickerVariant={variants.datePickerVariant}
        fareTableVariant={variants.fareTableVariant}
      />
    </ThemeProvider>
  );
}
