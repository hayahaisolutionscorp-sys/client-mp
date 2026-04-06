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
};

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
};

export const LANDING_VARIANT_KEYS: Record<LandingSectionKey, string[]> = {
  header: ["default", "centered", "floating", "professional-slate"],
  hero: ["default", "split", "minimal", "cards", "professional-editorial"],
  booking: ["default", "overlay", "banner", "card", "compact-dark", "professional-card"],
  promotions: ["default", "grid", "banner", "professional-banner"],
  routes: ["default", "carousel", "cards", "list", "professional-wall"],
  why_choose: ["default", "steps", "grid", "minimal", "professional-stack"],
  get_to_know: ["default", "timeline", "modern", "center", "professional-panel"],
  partners: ["default", "strip", "marquee", "grid-premium", "professional-rail"],
  footer: ["default", "default-no-banner", "centered", "premium", "professional-anchored"],
  floating_cta: ["default", "modern-dark", "minimal-light", "professional-pill"],
};
