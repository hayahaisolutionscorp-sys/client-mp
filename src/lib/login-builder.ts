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
export type LoginPageVariant = "split-right" | "split-left" | "rounded-canvas" | "brand-immersive";
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
};

export const LOGIN_VARIANTS: Record<LoginSectionKey, string[]> = {
  hero: ["default", "minimal", "split", "editorial"],
  form: ["default", "rounded", "compact", "elevated"],
  sidebar: ["default", "image", "testimonial", "gradient"],
  footer: ["default", "minimal"],
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
};

function normalizeLoginPageVariant(value: unknown): LoginPageVariant {
  if (value === "editorial-stack") return "split-right";
  if (
    value === "split-left" ||
    value === "split-right" ||
    value === "rounded-canvas" ||
    value === "brand-immersive"
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
