export const ABOUT_SECTION_KEYS = [
  "hero",
  "welcome",
  "our_story",
  "our_expertise",
  "core_values",
] as const;

export type AboutSectionKey = (typeof ABOUT_SECTION_KEYS)[number];

export interface AboutBuilderSectionConfig {
  id: AboutSectionKey;
  section_key: AboutSectionKey;
  label: string;
  variant: string;
  enabled: boolean;
  display_order: number;
}

export interface AboutBuilderContent {
  schema_version: 1;
  page_key: "about";
  sections: AboutBuilderSectionConfig[];
}

export const ABOUT_SECTION_LABELS: Record<AboutSectionKey, string> = {
  hero: "Hero Banner",
  welcome: "Welcome Section",
  our_story: "Our Story",
  our_expertise: "Our Expertise",
  core_values: "Core Values",
};

export const ABOUT_VARIANTS: Record<AboutSectionKey, string[]> = {
  hero: ["default", "split", "minimal", "overlay", "cards", "centered"],
  welcome: ["default", "spotlight", "highlight", "quote", "side-accent"],
  our_story: ["default", "timeline", "milestone", "narrative", "journey"],
  our_expertise: ["default", "checklist", "grid", "showcase", "badges"],
  core_values: ["default", "pillars", "icon-grid", "timeline", "accordion", "compact"],
};

export const DEFAULT_ABOUT_BUILDER_CONTENT: AboutBuilderContent = {
  schema_version: 1,
  page_key: "about",
  sections: [
    { id: "hero", section_key: "hero", label: ABOUT_SECTION_LABELS.hero, variant: "default", enabled: true, display_order: 0 },
    { id: "welcome", section_key: "welcome", label: ABOUT_SECTION_LABELS.welcome, variant: "default", enabled: true, display_order: 1 },
    { id: "our_story", section_key: "our_story", label: ABOUT_SECTION_LABELS.our_story, variant: "default", enabled: true, display_order: 2 },
    { id: "our_expertise", section_key: "our_expertise", label: ABOUT_SECTION_LABELS.our_expertise, variant: "default", enabled: true, display_order: 3 },
    { id: "core_values", section_key: "core_values", label: ABOUT_SECTION_LABELS.core_values, variant: "default", enabled: true, display_order: 4 },
  ],
};

const isAboutSectionKey = (value: unknown): value is AboutSectionKey =>
  typeof value === "string" && ABOUT_SECTION_KEYS.includes(value as AboutSectionKey);

export function normalizeAboutBuilderContent(value: unknown): AboutBuilderContent {
  if (!value || typeof value !== "object") {
    return DEFAULT_ABOUT_BUILDER_CONTENT;
  }

  const candidate = value as Partial<AboutBuilderContent>;
  const sectionMap = new Map<AboutSectionKey, AboutBuilderSectionConfig>();

  if (Array.isArray(candidate.sections)) {
    for (const section of candidate.sections) {
      if (!section || typeof section !== "object") continue;
      const sectionKey = (section as Partial<AboutBuilderSectionConfig>).section_key;
      if (!isAboutSectionKey(sectionKey)) continue;
      const variants = ABOUT_VARIANTS[sectionKey];
      const variant =
        typeof (section as Partial<AboutBuilderSectionConfig>).variant === "string" &&
        variants.includes((section as Partial<AboutBuilderSectionConfig>).variant!)
          ? (section as Partial<AboutBuilderSectionConfig>).variant!
          : "default";
      sectionMap.set(sectionKey, {
        id: sectionKey,
        section_key: sectionKey,
        label: ABOUT_SECTION_LABELS[sectionKey],
        variant,
        enabled:
          typeof (section as Partial<AboutBuilderSectionConfig>).enabled === "boolean"
            ? (section as Partial<AboutBuilderSectionConfig>).enabled!
            : true,
        display_order:
          typeof (section as Partial<AboutBuilderSectionConfig>).display_order === "number"
            ? (section as Partial<AboutBuilderSectionConfig>).display_order!
            : DEFAULT_ABOUT_BUILDER_CONTENT.sections.find((s) => s.section_key === sectionKey)?.display_order ?? 0,
      });
    }
  }

  const normalizedSections = ABOUT_SECTION_KEYS.map((sectionKey, index) => {
    const existing = sectionMap.get(sectionKey);
    return {
      ...(existing || DEFAULT_ABOUT_BUILDER_CONTENT.sections[index]),
      display_order: existing?.display_order ?? DEFAULT_ABOUT_BUILDER_CONTENT.sections[index].display_order,
    };
  });

  return {
    schema_version: 1,
    page_key: "about",
    sections: normalizedSections
      .sort((a, b) => a.display_order - b.display_order)
      .map((section, index) => ({ ...section, display_order: index })),
  };
}
