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

export const FAQ_SECTION_KEYS = ["hero", "faq_list"] as const;

export type FaqSectionKey = (typeof FAQ_SECTION_KEYS)[number];

export type FaqBuilderSectionConfig = SectionedBuilderSectionConfig<FaqSectionKey>;
export type FaqBuilderContent = SectionedBuilderContent<"faq", FaqSectionKey>;

export const FAQ_SECTION_LABELS: Record<FaqSectionKey, string> = {
  hero: "Hero Banner",
  faq_list: "FAQ List",
};

export const FAQ_VARIANTS: Record<FaqSectionKey, string[]> = {
  hero: ["default", "minimal", "centered", "gradient", "compact", "glassmorphic", "boarding-pass", "island-premium"],
  faq_list: ["default", "accordion", "cards", "compact", "minimal", "glassmorphic", "boarding-pass", "island-premium"],
};

const FAQ_SECTION_DEFINITIONS = FAQ_SECTION_KEYS.map((sectionKey) => ({
  section_key: sectionKey,
  label: FAQ_SECTION_LABELS[sectionKey],
  variant_values: FAQ_VARIANTS[sectionKey],
}))

const FAQ_TEMPLATE_PRESET_SECTION_DEFAULTS: Record<
  string,
  Partial<Record<FaqSectionKey, SectionedBuilderPresetSectionDefaults>>
> = {
  default: {
    hero: { enabled: true, variant: "default" },
    faq_list: { enabled: true, variant: "default" },
  },
  "rounded-modern": {
    hero: { enabled: true, variant: "centered" },
    faq_list: { enabled: true, variant: "accordion" },
  },
  professional: {
    hero: { enabled: true, variant: "centered" },
    faq_list: { enabled: true, variant: "accordion" },
  },
  "editorial-sharp": {
    hero: { enabled: true, variant: "minimal" },
    faq_list: { enabled: true, variant: "minimal" },
  },
  "maritime-elite": {
    hero: { enabled: true, variant: "gradient" },
    faq_list: { enabled: true, variant: "accordion" },
  },
  glassmorphic: {
    hero: { enabled: true, variant: "glassmorphic" },
    faq_list: { enabled: true, variant: "glassmorphic" },
  },
  "boarding-pass": {
    hero: { enabled: true, variant: "boarding-pass" },
    faq_list: { enabled: true, variant: "boarding-pass" },
  },
  "island-premium": {
    hero: { enabled: true, variant: "island-premium" },
    faq_list: { enabled: true, variant: "island-premium" },
  },
};

export const DEFAULT_FAQ_BUILDER_CONTENT = createSectionedBuilderContent("faq", FAQ_SECTION_DEFINITIONS);

export function createFaqBuilderContentFromPreset(preset: string): FaqBuilderContent {
  const normalizedPreset = normalizeLandingTemplatePreset(preset);
  return createSectionedBuilderContentFromPreset(
    "faq",
    FAQ_SECTION_DEFINITIONS,
    FAQ_TEMPLATE_PRESET_SECTION_DEFAULTS[normalizedPreset] ?? FAQ_TEMPLATE_PRESET_SECTION_DEFAULTS.default
  );
}

export function replaceFaqBuilderSectionOrder(sections: FaqBuilderSectionConfig[]): FaqBuilderSectionConfig[] {
  return replaceSectionedBuilderSectionOrder(sections);
}

export function normalizeFaqBuilderContent(value: unknown): FaqBuilderContent {
  return normalizeSectionedBuilderContent(value, "faq", FAQ_SECTION_DEFINITIONS);
}
