export const FAQ_SECTION_KEYS = [
  "hero",
  "faq_list",
] as const;

export type FaqSectionKey = (typeof FAQ_SECTION_KEYS)[number];

export interface FaqBuilderSectionConfig {
  id: FaqSectionKey;
  section_key: FaqSectionKey;
  label: string;
  variant: string;
  enabled: boolean;
  display_order: number;
}

export interface FaqBuilderContent {
  schema_version: 1;
  page_key: "faq";
  sections: FaqBuilderSectionConfig[];
}

export const FAQ_SECTION_LABELS: Record<FaqSectionKey, string> = {
  hero: "Hero Banner",
  faq_list: "FAQ List",
};

export const FAQ_VARIANTS: Record<FaqSectionKey, string[]> = {
  hero: ["default"],
  faq_list: ["default", "accordion"],
};

export const DEFAULT_FAQ_BUILDER_CONTENT: FaqBuilderContent = {
  schema_version: 1,
  page_key: "faq",
  sections: [
    { id: "hero", section_key: "hero", label: FAQ_SECTION_LABELS.hero, variant: "default", enabled: true, display_order: 0 },
    { id: "faq_list", section_key: "faq_list", label: FAQ_SECTION_LABELS.faq_list, variant: "default", enabled: true, display_order: 1 },
  ],
};

const isFaqSectionKey = (value: unknown): value is FaqSectionKey =>
  typeof value === "string" && FAQ_SECTION_KEYS.includes(value as FaqSectionKey);

export function normalizeFaqBuilderContent(value: unknown): FaqBuilderContent {
  if (!value || typeof value !== "object") {
    return DEFAULT_FAQ_BUILDER_CONTENT;
  }

  const candidate = value as Partial<FaqBuilderContent>;
  const sectionMap = new Map<FaqSectionKey, FaqBuilderSectionConfig>();

  if (Array.isArray(candidate.sections)) {
    for (const section of candidate.sections) {
      if (!section || typeof section !== "object") continue;
      const sectionKey = (section as Partial<FaqBuilderSectionConfig>).section_key;
      if (!isFaqSectionKey(sectionKey)) continue;
      const variants = FAQ_VARIANTS[sectionKey];
      const variant =
        typeof (section as Partial<FaqBuilderSectionConfig>).variant === "string" &&
        variants.includes((section as Partial<FaqBuilderSectionConfig>).variant!)
          ? (section as Partial<FaqBuilderSectionConfig>).variant!
          : "default";
      sectionMap.set(sectionKey, {
        id: sectionKey,
        section_key: sectionKey,
        label: FAQ_SECTION_LABELS[sectionKey],
        variant,
        enabled:
          typeof (section as Partial<FaqBuilderSectionConfig>).enabled === "boolean"
            ? (section as Partial<FaqBuilderSectionConfig>).enabled!
            : true,
        display_order:
          typeof (section as Partial<FaqBuilderSectionConfig>).display_order === "number"
            ? (section as Partial<FaqBuilderSectionConfig>).display_order!
            : DEFAULT_FAQ_BUILDER_CONTENT.sections.find((s) => s.section_key === sectionKey)?.display_order ?? 0,
      });
    }
  }

  const normalizedSections = FAQ_SECTION_KEYS.map((sectionKey, index) => {
    const existing = sectionMap.get(sectionKey);
    return {
      ...(existing || DEFAULT_FAQ_BUILDER_CONTENT.sections[index]),
      display_order: existing?.display_order ?? DEFAULT_FAQ_BUILDER_CONTENT.sections[index].display_order,
    };
  });

  return {
    schema_version: 1,
    page_key: "faq",
    sections: normalizedSections
      .sort((a, b) => a.display_order - b.display_order)
      .map((section, index) => ({ ...section, display_order: index })),
  };
}
