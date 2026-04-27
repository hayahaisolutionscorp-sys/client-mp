import {
  createSectionedBuilderContent,
  createSectionedBuilderContentFromPreset,
  normalizeSectionedBuilderContent,
  replaceSectionedBuilderSectionOrder,
  type SectionedBuilderContent,
  type SectionedBuilderPresetSectionDefaults,
  type SectionedBuilderSectionConfig,
} from "./sectioned-builder";
import { normalizeLandingTemplatePreset } from "./landing-builder";

export const LOGIN_SECTION_KEYS = ["hero", "form", "sidebar", "footer"] as const;

export type LoginSectionKey = (typeof LOGIN_SECTION_KEYS)[number];
export type LoginPageVariant = "split-right" | "split-left" | "rounded-canvas" | "brand-immersive" | "glassmorphic-blur" | "boarding-pass" | "island-premium";
export type LoginLayoutVariant = LoginPageVariant;

export interface LoginPageLayoutConfig {
  label: string;
  description: string;
  shell: "split" | "canvas" | "immersive";
  sidebarVariant: "default" | "image" | "testimonial" | "gradient";
  formMode: "default" | "canvas" | "immersive";
  splitDirection?: "left" | "right";
}

export type LoginBuilderSectionConfig = SectionedBuilderSectionConfig<LoginSectionKey>;
export type LoginBuilderContent = SectionedBuilderContent<"login", LoginSectionKey> & {
  page_variant: LoginPageVariant;
  layout_variant?: LoginPageVariant;
};
type LoginPresetDefaults = Partial<Record<LoginSectionKey, SectionedBuilderPresetSectionDefaults>> & {
  page_variant: LoginPageVariant;
};

export const LOGIN_SECTION_LABELS: Record<LoginSectionKey, string> = {
  hero: "Hero Banner",
  form: "Login Form",
  sidebar: "Sidebar",
  footer: "Footer Note",
};

export const LOGIN_LAYOUT_VARIANTS: { value: LoginLayoutVariant; label: string; description: string }[] = [
  {
    value: "split-right",
    label: "Split Right",
    description: "Form on the left with the image panel on the right.",
  },
  {
    value: "split-left",
    label: "Split Left",
    description: "Branded panel on the left with the form on the right.",
  },
  {
    value: "rounded-canvas",
    label: "Rounded Canvas",
    description: "Soft, centered login canvas tuned for the Rounded Modern preset.",
  },
  {
    value: "brand-immersive",
    label: "Brand Immersive",
    description: "Full-bleed branded composition with a cinematic login stage.",
  },
  {
    value: "glassmorphic-blur",
    label: "Glassmorphic Blur",
    description: "Floating glass card over a softly blurred vibrant background.",
  },
  {
    value: "boarding-pass",
    label: "Boarding Pass",
    description: "Mobile-first ticket-stub card with perforated rails and monospace details.",
  },
  {
    value: "island-premium",
    label: "Island Premium",
    description: "Warm coastal login canvas with soft gradients and a mobile-first form card.",
  },
];

export const LOGIN_PAGE_LAYOUTS: Record<LoginPageVariant, LoginPageLayoutConfig> = {
  "split-right": {
    label: "Split Right",
    description: "Form on the left with the image panel on the right.",
    shell: "split",
    sidebarVariant: "image",
    formMode: "default",
    splitDirection: "right",
  },
  "split-left": {
    label: "Split Left",
    description: "Branded panel on the left with the form on the right.",
    shell: "split",
    sidebarVariant: "gradient",
    formMode: "default",
    splitDirection: "left",
  },
  "rounded-canvas": {
    label: "Rounded Canvas",
    description: "Soft, centered login canvas tuned for the Rounded Modern preset.",
    shell: "canvas",
    sidebarVariant: "testimonial",
    formMode: "canvas",
  },
  "brand-immersive": {
    label: "Brand Immersive",
    description: "Full-bleed branded composition with a cinematic login stage.",
    shell: "immersive",
    sidebarVariant: "gradient",
    formMode: "immersive",
  },
  "glassmorphic-blur": {
    label: "Glassmorphic Blur",
    description: "Floating glass card over a softly blurred vibrant background.",
    shell: "canvas",
    sidebarVariant: "gradient",
    formMode: "canvas",
  },
  "boarding-pass": {
    label: "Boarding Pass",
    description: "Mobile-first ticket-stub card with perforated rails and monospace details.",
    shell: "canvas",
    sidebarVariant: "testimonial",
    formMode: "canvas",
  },
  "island-premium": {
    label: "Island Premium",
    description: "Warm coastal login canvas with soft gradients and a mobile-first form card.",
    shell: "canvas",
    sidebarVariant: "testimonial",
    formMode: "canvas",
  },
};

export const LOGIN_VARIANTS: Record<LoginSectionKey, string[]> = {
  hero: ["default", "minimal", "split", "editorial", "modern", "readable", "glassmorphic", "boarding-pass", "island-premium"],
  form: ["default", "rounded", "compact", "elevated", "simple", "spacious", "glassmorphic", "boarding-pass", "island-premium"],
  sidebar: ["default", "image", "testimonial", "gradient", "minimal", "clean", "glassmorphic", "boarding-pass", "island-premium"],
  footer: ["default", "minimal", "compact", "inline", "glassmorphic", "boarding-pass", "island-premium"],
};

const LOGIN_SECTION_DEFINITIONS = LOGIN_SECTION_KEYS.map((sectionKey) => ({
  section_key: sectionKey,
  label: LOGIN_SECTION_LABELS[sectionKey],
  variant_values: LOGIN_VARIANTS[sectionKey],
}));

const LOGIN_TEMPLATE_PRESET_SECTION_DEFAULTS: Record<string, LoginPresetDefaults> = {
  default: {
    page_variant: "split-right",
    hero: { enabled: true, variant: "default" },
    form: { enabled: true, variant: "default" },
    sidebar: { enabled: true, variant: "image" },
    footer: { enabled: true, variant: "default" },
  },
  "rounded-modern": {
    page_variant: "rounded-canvas",
    hero: { enabled: true, variant: "split" },
    form: { enabled: true, variant: "rounded" },
    sidebar: { enabled: true, variant: "image" },
    footer: { enabled: true, variant: "minimal" },
  },
  professional: {
    page_variant: "split-right",
    hero: { enabled: true, variant: "minimal" },
    form: { enabled: true, variant: "elevated" },
    sidebar: { enabled: true, variant: "testimonial" },
    footer: { enabled: true, variant: "minimal" },
  },
  "editorial-sharp": {
    page_variant: "split-right",
    hero: { enabled: true, variant: "minimal" },
    form: { enabled: true, variant: "compact" },
    sidebar: { enabled: true, variant: "testimonial" },
    footer: { enabled: true, variant: "minimal" },
  },
  "maritime-elite": {
    page_variant: "brand-immersive",
    hero: { enabled: true, variant: "split" },
    form: { enabled: true, variant: "elevated" },
    sidebar: { enabled: true, variant: "gradient" },
    footer: { enabled: true, variant: "minimal" },
  },
  glassmorphic: {
    page_variant: "glassmorphic-blur",
    hero: { enabled: true, variant: "glassmorphic" },
    form: { enabled: true, variant: "glassmorphic" },
    sidebar: { enabled: true, variant: "glassmorphic" },
    footer: { enabled: true, variant: "glassmorphic" },
  },
  "boarding-pass": {
    page_variant: "boarding-pass",
    hero: { enabled: true, variant: "boarding-pass" },
    form: { enabled: true, variant: "boarding-pass" },
    sidebar: { enabled: true, variant: "boarding-pass" },
    footer: { enabled: true, variant: "boarding-pass" },
  },
  "island-premium": {
    page_variant: "island-premium",
    hero: { enabled: true, variant: "island-premium" },
    form: { enabled: true, variant: "island-premium" },
    sidebar: { enabled: true, variant: "island-premium" },
    footer: { enabled: true, variant: "island-premium" },
  },
};

function normalizeLoginPageVariant(value: unknown): LoginPageVariant {
  if (value === "editorial-stack") return "split-right";
  if (
    value === "split-left" ||
    value === "split-right" ||
    value === "rounded-canvas" ||
    value === "brand-immersive" ||
    value === "glassmorphic-blur" ||
    value === "boarding-pass" ||
    value === "island-premium"
  ) {
    return value;
  }
  return "split-right";
}

export const DEFAULT_LOGIN_BUILDER_CONTENT: LoginBuilderContent = {
  ...createSectionedBuilderContent("login", LOGIN_SECTION_DEFINITIONS),
  page_variant: "split-right",
};

export function createLoginBuilderContentFromPreset(preset: string): LoginBuilderContent {
  const normalizedPreset = normalizeLandingTemplatePreset(preset);
  const presetDefaults = LOGIN_TEMPLATE_PRESET_SECTION_DEFAULTS[normalizedPreset] ?? LOGIN_TEMPLATE_PRESET_SECTION_DEFAULTS.default;
  return {
    ...createSectionedBuilderContentFromPreset(
      "login",
      LOGIN_SECTION_DEFINITIONS,
      presetDefaults
    ),
    page_variant: presetDefaults.page_variant,
  };
}

export function replaceLoginBuilderSectionOrder(sections: LoginBuilderSectionConfig[]): LoginBuilderSectionConfig[] {
  return replaceSectionedBuilderSectionOrder(sections);
}

export function getLoginPageLayout(variant: LoginLayoutVariant): LoginPageLayoutConfig {
  return LOGIN_PAGE_LAYOUTS[variant] ?? LOGIN_PAGE_LAYOUTS["split-right"];
}

export function normalizeLoginBuilderContent(value: unknown): LoginBuilderContent {
  const candidate = value as { page_variant?: unknown; layout_variant?: unknown } | null;
  const normalized = normalizeSectionedBuilderContent(value, "login", LOGIN_SECTION_DEFINITIONS) as LoginBuilderContent;
  const layoutVariant = normalizeLoginPageVariant(candidate?.page_variant ?? candidate?.layout_variant);

  return {
    ...normalized,
    page_variant: layoutVariant,
    layout_variant: layoutVariant,
  };
}
