export const LANDING_SECTION_KEYS = [
  "header",
  "hero",
  "booking",
  "promotions",
  "routes",
  "why_choose",
  "get_to_know",
  "partners",
] as const;

export type LandingSectionKey = (typeof LANDING_SECTION_KEYS)[number];

export interface LandingBuilderSectionConfig {
  id: LandingSectionKey;
  section_key: LandingSectionKey;
  label: string;
  variant: string;
  enabled: boolean;
  display_order: number;
}

export interface LandingBuilderContent {
  schema_version: 1;
  page_key: "landing";
  sections: LandingBuilderSectionConfig[];
}

export const LANDING_SECTION_LABELS: Record<LandingSectionKey, string> = {
  header: "Header",
  hero: "Hero Banner",
  booking: "Booking Search",
  promotions: "Promotions",
  routes: "Popular Routes",
  why_choose: "Why Choose Us",
  get_to_know: "About / Get To Know Us",
  partners: "Partners",
};

export const LANDING_VARIANTS: Record<LandingSectionKey, string[]> = {
  header: ["default", "centered", "floating"],
  hero: ["default", "split", "minimal", "cards"],
  booking: ["default", "overlay", "compact-dark"],
  promotions: ["default", "grid", "banner"],
  routes: ["default", "carousel", "cards", "list"],
  why_choose: ["default", "steps", "grid", "minimal"],
  get_to_know: ["default", "timeline", "modern", "center"],
  partners: ["default", "strip", "marquee", "grid-premium"],
};

export const DEFAULT_LANDING_BUILDER_CONTENT: LandingBuilderContent = {
  schema_version: 1,
  page_key: "landing",
  sections: [
    {
      id: "header",
      section_key: "header",
      label: LANDING_SECTION_LABELS.header,
      variant: "default",
      enabled: false,
      display_order: 0,
    },
    {
      id: "hero",
      section_key: "hero",
      label: LANDING_SECTION_LABELS.hero,
      variant: "default",
      enabled: true,
      display_order: 1,
    },
    {
      id: "booking",
      section_key: "booking",
      label: LANDING_SECTION_LABELS.booking,
      variant: "default",
      enabled: false,
      display_order: 2,
    },
    {
      id: "promotions",
      section_key: "promotions",
      label: LANDING_SECTION_LABELS.promotions,
      variant: "default",
      enabled: true,
      display_order: 3,
    },
    {
      id: "routes",
      section_key: "routes",
      label: LANDING_SECTION_LABELS.routes,
      variant: "default",
      enabled: true,
      display_order: 4,
    },
    {
      id: "why_choose",
      section_key: "why_choose",
      label: LANDING_SECTION_LABELS.why_choose,
      variant: "default",
      enabled: true,
      display_order: 5,
    },
    {
      id: "get_to_know",
      section_key: "get_to_know",
      label: LANDING_SECTION_LABELS.get_to_know,
      variant: "default",
      enabled: false,
      display_order: 6,
    },
    {
      id: "partners",
      section_key: "partners",
      label: LANDING_SECTION_LABELS.partners,
      variant: "default",
      enabled: false,
      display_order: 7,
    },
  ],
};

const isLandingSectionKey = (value: unknown): value is LandingSectionKey => {
  return typeof value === "string" && LANDING_SECTION_KEYS.includes(value as LandingSectionKey);
};

function isLegacyAllEnabledDefault(
  sections: LandingBuilderSectionConfig[] | undefined
): boolean {
  if (!sections || sections.length !== LANDING_SECTION_KEYS.length) {
    return false;
  }

  return LANDING_SECTION_KEYS.every((sectionKey) =>
    sections.some(
      (section) =>
        section.section_key === sectionKey &&
        section.variant === "default" &&
        section.enabled === true
    )
  );
}

export function normalizeLandingBuilderContent(value: unknown): LandingBuilderContent {
  if (!value || typeof value !== "object") {
    return DEFAULT_LANDING_BUILDER_CONTENT;
  }

  const candidate = value as Partial<LandingBuilderContent>;
  const sectionMap = new Map<LandingSectionKey, LandingBuilderSectionConfig>();

  if (Array.isArray(candidate.sections)) {
    for (const section of candidate.sections) {
      if (!section || typeof section !== "object") {
        continue;
      }

      const sectionKey = (section as Partial<LandingBuilderSectionConfig>).section_key;
      if (!isLandingSectionKey(sectionKey)) {
        continue;
      }

      const variants = LANDING_VARIANTS[sectionKey];
      const variant =
        typeof (section as Partial<LandingBuilderSectionConfig>).variant === "string" &&
        variants.includes((section as Partial<LandingBuilderSectionConfig>).variant!)
          ? (section as Partial<LandingBuilderSectionConfig>).variant!
          : "default";

      sectionMap.set(sectionKey, {
        id: sectionKey,
        section_key: sectionKey,
        label: LANDING_SECTION_LABELS[sectionKey],
        variant,
        enabled:
          typeof (section as Partial<LandingBuilderSectionConfig>).enabled === "boolean"
            ? (section as Partial<LandingBuilderSectionConfig>).enabled!
            : true,
        display_order:
          typeof (section as Partial<LandingBuilderSectionConfig>).display_order === "number"
            ? (section as Partial<LandingBuilderSectionConfig>).display_order!
            : DEFAULT_LANDING_BUILDER_CONTENT.sections.find(
                (defaultSection) => defaultSection.section_key === sectionKey
              )?.display_order ?? 0,
      });
    }
  }

  const normalizedSections = LANDING_SECTION_KEYS.map((sectionKey, index) => {
    const existing = sectionMap.get(sectionKey);
    return {
      ...(existing || DEFAULT_LANDING_BUILDER_CONTENT.sections[index]),
      display_order:
        existing?.display_order ?? DEFAULT_LANDING_BUILDER_CONTENT.sections[index].display_order,
    };
  });

  if (isLegacyAllEnabledDefault(normalizedSections)) {
    return DEFAULT_LANDING_BUILDER_CONTENT;
  }

  return {
    schema_version: 1,
    page_key: "landing",
    sections: normalizedSections
      .sort((left, right) => left.display_order - right.display_order)
      .map((section, index) => ({
        ...section,
        display_order: index,
      })),
  };
}
