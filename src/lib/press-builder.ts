export const PRESS_SECTION_KEYS = ["hero", "press_list"] as const;

export type PressSectionKey = (typeof PRESS_SECTION_KEYS)[number];

export interface PressBuilderSectionConfig {
  id: PressSectionKey;
  section_key: PressSectionKey;
  label: string;
  variant: string;
  enabled: boolean;
  display_order: number;
}

export interface PressBuilderContent {
  schema_version: 1;
  page_key: "press";
  sections: PressBuilderSectionConfig[];
}

export const PRESS_SECTION_LABELS: Record<PressSectionKey, string> = {
  hero: "Hero Banner",
  press_list: "Article List",
};

export const PRESS_VARIANTS: Record<PressSectionKey, string[]> = {
  hero: ["default"],
  press_list: ["default"],
};

export const DEFAULT_PRESS_BUILDER_CONTENT: PressBuilderContent = {
  schema_version: 1,
  page_key: "press",
  sections: [
    { id: "hero", section_key: "hero", label: PRESS_SECTION_LABELS.hero, variant: "default", enabled: true, display_order: 0 },
    { id: "press_list", section_key: "press_list", label: PRESS_SECTION_LABELS.press_list, variant: "default", enabled: true, display_order: 1 },
  ],
};

const isPressSectionKey = (value: unknown): value is PressSectionKey =>
  typeof value === "string" && PRESS_SECTION_KEYS.includes(value as PressSectionKey);

export function normalizePressBuilderContent(value: unknown): PressBuilderContent {
  if (!value || typeof value !== "object") {
    return DEFAULT_PRESS_BUILDER_CONTENT;
  }

  const candidate = value as Partial<PressBuilderContent>;
  const sectionMap = new Map<PressSectionKey, PressBuilderSectionConfig>();

  if (Array.isArray(candidate.sections)) {
    for (const section of candidate.sections) {
      if (!section || typeof section !== "object") continue;
      const sectionKey = (section as Partial<PressBuilderSectionConfig>).section_key;
      if (!isPressSectionKey(sectionKey)) continue;
      const variants = PRESS_VARIANTS[sectionKey];
      const variant =
        typeof (section as Partial<PressBuilderSectionConfig>).variant === "string" &&
        variants.includes((section as Partial<PressBuilderSectionConfig>).variant!)
          ? (section as Partial<PressBuilderSectionConfig>).variant!
          : "default";

      sectionMap.set(sectionKey, {
        id: sectionKey,
        section_key: sectionKey,
        label: PRESS_SECTION_LABELS[sectionKey],
        variant,
        enabled:
          typeof (section as Partial<PressBuilderSectionConfig>).enabled === "boolean"
            ? (section as Partial<PressBuilderSectionConfig>).enabled!
            : true,
        display_order:
          typeof (section as Partial<PressBuilderSectionConfig>).display_order === "number"
            ? (section as Partial<PressBuilderSectionConfig>).display_order!
            : DEFAULT_PRESS_BUILDER_CONTENT.sections.find((item) => item.section_key === sectionKey)?.display_order ?? 0,
      });
    }
  }

  const normalizedSections = PRESS_SECTION_KEYS.map((sectionKey, index) => {
    const existing = sectionMap.get(sectionKey);
    return {
      ...(existing || DEFAULT_PRESS_BUILDER_CONTENT.sections[index]),
      display_order: existing?.display_order ?? DEFAULT_PRESS_BUILDER_CONTENT.sections[index].display_order,
    };
  });

  return {
    schema_version: 1,
    page_key: "press",
    sections: normalizedSections
      .sort((left, right) => left.display_order - right.display_order)
      .map((section, index) => ({ ...section, display_order: index })),
  };
}
