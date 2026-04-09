import {
  createSectionedBuilderContent,
  normalizeSectionedBuilderContent,
  type SectionedBuilderContent,
  type SectionedBuilderSectionConfig,
} from "@/lib/sectioned-builder";

export const SCHEDULE_SECTION_KEYS = ["hero", "date_picker", "fare_table"] as const;

export type ScheduleSectionKey = (typeof SCHEDULE_SECTION_KEYS)[number];

export interface ScheduleBuilderVariantOption {
  value: string;
  label: string;
  description: string;
}

export type ScheduleBuilderSectionConfig = SectionedBuilderSectionConfig<ScheduleSectionKey>;
export type ScheduleBuilderContent = SectionedBuilderContent<"schedule", ScheduleSectionKey>;

export const SCHEDULE_SECTION_LABELS: Record<ScheduleSectionKey, string> = {
  hero: "Hero Header",
  date_picker: "Date Picker",
  fare_table: "Schedule Table",
};

export const SCHEDULE_VARIANTS: Record<ScheduleSectionKey, ScheduleBuilderVariantOption[]> = {
  hero: [
    {
      value: "default",
      label: "Default",
      description: "Current production schedule page hero.",
    },
    {
      value: "compact",
      label: "Compact",
      description: "Reduced vertical spacing in the schedule hero.",
    },
    {
      value: "modern-clean",
      label: "Modern Clean",
      description: "Cleaner hero spacing with contemporary emphasis.",
    },
    {
      value: "readable",
      label: "Readable",
      description: "Larger and clearer heading hierarchy.",
    },
  ],
  date_picker: [
    {
      value: "default",
      label: "Default",
      description: "Current production date picker layout.",
    },
    {
      value: "minimal",
      label: "Minimal",
      description: "Cleaner date picker spacing and framing.",
    },
    {
      value: "simple",
      label: "Simple",
      description: "Flat and minimal framing for straightforward scanning.",
    },
    {
      value: "outlined",
      label: "Outlined",
      description: "Crisp bordered picker for clearer separation.",
    },
  ],
  fare_table: [
    {
      value: "default",
      label: "Default",
      description: "Current production schedule table styling.",
    },
    {
      value: "striped",
      label: "Striped",
      description: "Alternating row backgrounds for readability.",
    },
    {
      value: "comfortable",
      label: "Comfortable",
      description: "More spacing and calmer row rhythm.",
    },
    {
      value: "high-contrast",
      label: "High Contrast",
      description: "Stronger contrast for quick legibility.",
    },
  ],
};

const SCHEDULE_SECTION_DEFINITIONS = SCHEDULE_SECTION_KEYS.map((sectionKey) => ({
  section_key: sectionKey,
  label: SCHEDULE_SECTION_LABELS[sectionKey],
  variant_values: SCHEDULE_VARIANTS[sectionKey].map((variant) => variant.value),
}));

export const DEFAULT_SCHEDULE_BUILDER_CONTENT = createSectionedBuilderContent(
  "schedule",
  SCHEDULE_SECTION_DEFINITIONS
);

export function normalizeScheduleBuilderContent(value: unknown): ScheduleBuilderContent {
  return normalizeSectionedBuilderContent(value, "schedule", SCHEDULE_SECTION_DEFINITIONS);
}
