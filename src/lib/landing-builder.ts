export const LANDING_SECTION_KEYS = [
  "header",
  "hero",
  "booking",
  "promotions",
  "routes",
  "why_choose",
  "get_to_know",
  "partners",
  "footer",
  "floating_cta",
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
  templatePreset: string;
  sections: LandingBuilderSectionConfig[];
}

export interface LandingTemplatePresetTokens {
  fontFamily: string;
  fontFamilyTitle: string;
  radiusClass: string;
  surfaceClass: string;
}

export interface LandingTemplatePresetOption {
  key: string;
  label: string;
  description: string;
  tokens: LandingTemplatePresetTokens;
}

export interface LandingTemplatePresetSectionDefaults {
  enabled: boolean;
  variant: string;
}

export interface LandingBuilderLayoutState {
  templatePreset: LandingTemplatePresetOption;
  headerSection: LandingBuilderSectionConfig | undefined;
  bookingSection: LandingBuilderSectionConfig | undefined;
  footerSection: LandingBuilderSectionConfig | undefined;
  visibleSections: LandingBuilderSectionConfig[];
  contentSections: LandingBuilderSectionConfig[];
  showNavbarInHero: boolean;
  showBookingInHero: boolean;
}

export const DEFAULT_TEMPLATE_PRESET = "default";

export const LANDING_TEMPLATE_PRESET_SECTION_DEFAULTS: Record<
  string,
  Partial<Record<LandingSectionKey, LandingTemplatePresetSectionDefaults>>
> = {
  default: {
    header: { enabled: true, variant: "default" },
    hero: { enabled: true, variant: "default" },
    booking: { enabled: true, variant: "default" },
    promotions: { enabled: true, variant: "default" },
    routes: { enabled: true, variant: "default" },
    why_choose: { enabled: true, variant: "default" },
    get_to_know: { enabled: false, variant: "default" },
    partners: { enabled: false, variant: "default" },
    footer: { enabled: true, variant: "default" },
    floating_cta: { enabled: true, variant: "default" },
  },
  "rounded-modern": {
    header: { enabled: true, variant: "centered" },
    hero: { enabled: true, variant: "split" },
    booking: { enabled: true, variant: "overlay" },
    promotions: { enabled: true, variant: "grid" },
    routes: { enabled: true, variant: "carousel" },
    why_choose: { enabled: true, variant: "grid" },
    get_to_know: { enabled: true, variant: "modern" },
    partners: { enabled: true, variant: "strip" },
    footer: { enabled: true, variant: "default" },
    floating_cta: { enabled: true, variant: "default" },
  },
  professional: {
    header: { enabled: true, variant: "professional-slate" },
    hero: { enabled: true, variant: "professional-editorial" },
    booking: { enabled: true, variant: "professional-card" },
    promotions: { enabled: true, variant: "professional-banner" },
    routes: { enabled: true, variant: "professional-wall" },
    why_choose: { enabled: true, variant: "professional-stack" },
    get_to_know: { enabled: true, variant: "professional-panel" },
    partners: { enabled: true, variant: "professional-rail" },
    footer: { enabled: true, variant: "professional-anchored" },
    floating_cta: { enabled: true, variant: "professional-pill" },
  },
  "editorial-sharp": {
    header: { enabled: true, variant: "floating" },
    hero: { enabled: true, variant: "minimal" },
    booking: { enabled: true, variant: "compact-dark" },
    promotions: { enabled: true, variant: "banner" },
    routes: { enabled: true, variant: "list" },
    why_choose: { enabled: true, variant: "steps" },
    get_to_know: { enabled: true, variant: "timeline" },
    partners: { enabled: true, variant: "grid-premium" },
    footer: { enabled: true, variant: "default" },
    floating_cta: { enabled: true, variant: "modern-dark" },
  },
}

export const LANDING_TEMPLATE_PRESETS: LandingTemplatePresetOption[] = [
  {
    key: "default",
    label: "Default",
    description: "Current Ayahay baseline look and feel.",
    tokens: {
      fontFamily: "Jost",
      fontFamilyTitle: "Jost",
      radiusClass: "rounded-2xl",
      surfaceClass: "bg-white",
    },
  },
  {
    key: "rounded-modern",
    label: "Rounded Modern",
    description: "Softer corners with clean, modern typography.",
    tokens: {
      fontFamily: "Inter",
      fontFamilyTitle: "Inter",
      radiusClass: "rounded-3xl",
      surfaceClass: "bg-slate-50",
    },
  },
  {
    key: "professional",
    label: "Professional",
    description: "Polished, corporate styling with a crisp, balanced layout.",
    tokens: {
      fontFamily: "Manrope",
      fontFamilyTitle: "Montserrat",
      radiusClass: "rounded-3xl",
      surfaceClass: "bg-slate-50",
    },
  },
  {
    key: "editorial-sharp",
    label: "Editorial Sharp",
    description: "Sharper corners with contrast-heavy editorial style.",
    tokens: {
      fontFamily: "Lato",
      fontFamilyTitle: "Merriweather",
      radiusClass: "rounded-md",
      surfaceClass: "bg-white",
    },
  },
];

const LANDING_TEMPLATE_PRESET_MAP = new Map(
  LANDING_TEMPLATE_PRESETS.map((preset) => [preset.key, preset])
);

export const isLandingTemplatePresetKey = (value: unknown): value is string => {
  return typeof value === "string" && LANDING_TEMPLATE_PRESET_MAP.has(value);
}

export const normalizeLandingTemplatePreset = (value: unknown): string => {
  return isLandingTemplatePresetKey(value) ? value : DEFAULT_TEMPLATE_PRESET;
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
  footer: "Footer",
  floating_cta: "Floating CTA",
}

export const LANDING_VARIANTS: Record<LandingSectionKey, string[]> = {
  header: ["default", "centered", "floating", "professional-slate"],
  hero: ["default", "split", "minimal", "cards", "professional-editorial"],
  booking: ["default", "overlay", "compact-dark", "professional-card"],
  promotions: ["default", "grid", "banner", "professional-banner"],
  routes: ["default", "carousel", "cards", "list", "professional-wall"],
  why_choose: ["default", "steps", "grid", "minimal", "professional-stack"],
  get_to_know: ["default", "timeline", "modern", "center", "professional-panel"],
  partners: ["default", "strip", "marquee", "grid-premium", "professional-rail"],
  footer: ["default", "default-no-banner", "centered", "premium", "professional-anchored"],
  floating_cta: ["default", "modern-dark", "minimal-light", "professional-pill"],
}

export const DEFAULT_LANDING_BUILDER_CONTENT: LandingBuilderContent = {
  schema_version: 1,
  page_key: "landing",
  templatePreset: DEFAULT_TEMPLATE_PRESET,
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
    {
      id: "footer",
      section_key: "footer",
      label: LANDING_SECTION_LABELS.footer,
      variant: "default",
      enabled: true,
      display_order: 8,
    },
    {
      id: "floating_cta",
      section_key: "floating_cta",
      label: LANDING_SECTION_LABELS.floating_cta,
      variant: "default",
      enabled: true,
      display_order: 9,
    },
  ],
}

export const LANDING_FIXED_SECTION_KEYS = ["header", "booking", "footer", "floating_cta"] as const;

export type LandingFixedSectionKey = (typeof LANDING_FIXED_SECTION_KEYS)[number];

const LANDING_DEFAULT_SECTION_ORDER = new Map(
  DEFAULT_LANDING_BUILDER_CONTENT.sections.map((section) => [section.section_key, section.display_order])
);

const LANDING_FIXED_SECTION_ORDER = new Map(
  LANDING_FIXED_SECTION_KEYS.map((sectionKey) => [
    sectionKey,
    LANDING_DEFAULT_SECTION_ORDER.get(sectionKey) ?? 0,
  ])
);

const LANDING_MUTABLE_SECTION_ORDER = DEFAULT_LANDING_BUILDER_CONTENT.sections
  .filter((section) => !isLandingFixedSectionKey(section.section_key))
  .map((section) => section.display_order);

const getTemplatePresetSectionDefaults = (preset: string) => {
  return (
    LANDING_TEMPLATE_PRESET_SECTION_DEFAULTS[preset] ??
    LANDING_TEMPLATE_PRESET_SECTION_DEFAULTS[DEFAULT_TEMPLATE_PRESET]
  );
}

export function createLandingBuilderContentFromPreset(
  preset: string
): LandingBuilderContent {
  const normalizedPreset = normalizeLandingTemplatePreset(preset);
  const defaults = getTemplatePresetSectionDefaults(normalizedPreset);

  return {
    schema_version: 1,
    page_key: "landing",
    templatePreset: normalizedPreset,
    sections: DEFAULT_LANDING_BUILDER_CONTENT.sections.map((section, index) => {
      const presetSection = defaults[section.section_key];

      return {
        ...section,
        enabled: presetSection?.enabled ?? section.enabled,
        variant: presetSection?.variant ?? section.variant,
        display_order: index,
      };
    }),
  };
}

export function getLandingBuilderLayoutState(
  builder: LandingBuilderContent
): LandingBuilderLayoutState {
  const templatePreset =
    LANDING_TEMPLATE_PRESETS.find((preset) => preset.key === builder.templatePreset) ??
    LANDING_TEMPLATE_PRESETS.find((preset) => preset.key === DEFAULT_TEMPLATE_PRESET) ??
    LANDING_TEMPLATE_PRESETS[0];
  const visibleSections = builder.sections
    .filter((section) => section.enabled)
    .sort((left, right) => left.display_order - right.display_order);
  const headerSection = visibleSections.find((section) => section.section_key === "header");
  const bookingSection = visibleSections.find((section) => section.section_key === "booking");
  const footerSection = visibleSections.find((section) => section.section_key === "footer");
  const contentSections = visibleSections.filter((section) => section.section_key !== "footer");

  return {
    templatePreset,
    headerSection,
    bookingSection,
    footerSection,
    visibleSections,
    contentSections,
    showNavbarInHero:
      headerSection?.enabled !== false &&
      (headerSection?.variant === "default" || !headerSection?.variant),
    showBookingInHero:
      bookingSection?.enabled !== false &&
      (bookingSection?.variant === "default" || !bookingSection?.variant),
  };
}

const isLandingSectionKey = (value: unknown): value is LandingSectionKey => {
  return typeof value === "string" && LANDING_SECTION_KEYS.includes(value as LandingSectionKey);
}

export function isLandingFixedSectionKey(value: unknown): value is LandingFixedSectionKey {
  return typeof value === "string" && LANDING_FIXED_SECTION_KEYS.includes(value as LandingFixedSectionKey);
}

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

export function getLandingBuilderFixedSections(
  builder: LandingBuilderContent
): LandingBuilderSectionConfig[] {
  return builder.sections
    .filter((section) => isLandingFixedSectionKey(section.section_key))
    .sort((left, right) => left.display_order - right.display_order);
}

export function getLandingBuilderMutableSections(
  builder: LandingBuilderContent
): LandingBuilderSectionConfig[] {
  return builder.sections
    .filter((section) => !isLandingFixedSectionKey(section.section_key))
    .sort((left, right) => left.display_order - right.display_order);
}

export function composeLandingBuilderSectionOrder(
  sections: LandingBuilderSectionConfig[]
): LandingBuilderSectionConfig[] {
  const sectionMap = new Map<LandingSectionKey, LandingBuilderSectionConfig>();
  for (const section of sections) {
    sectionMap.set(section.section_key, section);
  }

  const fixedSections = LANDING_FIXED_SECTION_KEYS.map((sectionKey) => {
    const existing = sectionMap.get(sectionKey);
    const fallbackSection = DEFAULT_LANDING_BUILDER_CONTENT.sections.find(
      (section) => section.section_key === sectionKey
    );

    if (!fallbackSection) {
      throw new Error(`Missing landing fallback section for ${sectionKey}`);
    }

    return {
      ...(existing || fallbackSection),
      display_order: LANDING_FIXED_SECTION_ORDER.get(sectionKey) ?? fallbackSection.display_order,
    };
  });

  const mutableSections = sections
    .filter((section) => !isLandingFixedSectionKey(section.section_key))
    .sort((left, right) => left.display_order - right.display_order)
    .map((section, index) => ({
      ...section,
      display_order: LANDING_MUTABLE_SECTION_ORDER[index] ?? section.display_order,
    }));

  return [...fixedSections, ...mutableSections].sort((left, right) => left.display_order - right.display_order);
}

export function normalizeLandingBuilderContent(value: unknown): LandingBuilderContent {
  if (!value || typeof value !== "object") {
    return DEFAULT_LANDING_BUILDER_CONTENT;
  }

  const candidate = value as Partial<LandingBuilderContent>;
  const templatePreset = normalizeLandingTemplatePreset(candidate.templatePreset);
  const defaults = getTemplatePresetSectionDefaults(templatePreset);
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
    const presetSection = defaults[sectionKey];
    const fallbackSection = DEFAULT_LANDING_BUILDER_CONTENT.sections[index];

    return {
      ...(existing || fallbackSection),
      enabled: existing?.enabled ?? presetSection?.enabled ?? fallbackSection.enabled,
      variant: existing?.variant ?? presetSection?.variant ?? fallbackSection.variant,
      display_order:
        existing?.display_order ?? fallbackSection.display_order,
    };
  });

  if (isLegacyAllEnabledDefault(normalizedSections)) {
    return createLandingBuilderContentFromPreset(templatePreset);
  }

  return {
    schema_version: 1,
    page_key: "landing",
    templatePreset,
    sections: composeLandingBuilderSectionOrder(normalizedSections),
  };
}
