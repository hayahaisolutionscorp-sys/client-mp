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

export const CONTACT_SECTION_KEYS = ["hero", "contact_form"] as const;

export type ContactSectionKey = (typeof CONTACT_SECTION_KEYS)[number];

export type ContactBuilderSectionConfig = SectionedBuilderSectionConfig<ContactSectionKey>;
export type ContactBuilderContent = SectionedBuilderContent<"contact", ContactSectionKey>;

export const CONTACT_SECTION_LABELS: Record<ContactSectionKey, string> = {
  hero: "Hero Banner",
  contact_form: "Contact Form",
};

export const CONTACT_VARIANTS: Record<ContactSectionKey, string[]> = {
  hero: ["default", "minimal", "centered", "gradient", "split", "glassmorphic", "boarding-pass"],
  contact_form: ["default", "side-by-side", "minimal", "floating", "premium", "glassmorphic", "boarding-pass"],
};

const CONTACT_SECTION_DEFINITIONS = CONTACT_SECTION_KEYS.map((sectionKey) => ({
  section_key: sectionKey,
  label: CONTACT_SECTION_LABELS[sectionKey],
  variant_values: CONTACT_VARIANTS[sectionKey],
}))

const CONTACT_TEMPLATE_PRESET_SECTION_DEFAULTS: Record<
  string,
  Partial<Record<ContactSectionKey, SectionedBuilderPresetSectionDefaults>>
> = {
  default: {
    hero: { enabled: true, variant: "default" },
    contact_form: { enabled: true, variant: "default" },
  },
  "rounded-modern": {
    hero: { enabled: true, variant: "centered" },
    contact_form: { enabled: true, variant: "side-by-side" },
  },
  professional: {
    hero: { enabled: true, variant: "centered" },
    contact_form: { enabled: true, variant: "side-by-side" },
  },
  "editorial-sharp": {
    hero: { enabled: true, variant: "gradient" },
    contact_form: { enabled: true, variant: "premium" },
  },
  "maritime-elite": {
    hero: { enabled: true, variant: "split" },
    contact_form: { enabled: true, variant: "premium" },
  },
  glassmorphic: {
    hero: { enabled: true, variant: "glassmorphic" },
    contact_form: { enabled: true, variant: "glassmorphic" },
  },
  "boarding-pass": {
    hero: { enabled: true, variant: "boarding-pass" },
    contact_form: { enabled: true, variant: "boarding-pass" },
  },
};

export const DEFAULT_CONTACT_BUILDER_CONTENT = createSectionedBuilderContent("contact", CONTACT_SECTION_DEFINITIONS);

export function createContactBuilderContentFromPreset(preset: string): ContactBuilderContent {
  const normalizedPreset = normalizeLandingTemplatePreset(preset);
  return createSectionedBuilderContentFromPreset(
    "contact",
    CONTACT_SECTION_DEFINITIONS,
    CONTACT_TEMPLATE_PRESET_SECTION_DEFAULTS[normalizedPreset] ?? CONTACT_TEMPLATE_PRESET_SECTION_DEFAULTS.default
  );
}

export function replaceContactBuilderSectionOrder(sections: ContactBuilderSectionConfig[]): ContactBuilderSectionConfig[] {
  return replaceSectionedBuilderSectionOrder(sections);
}

export function normalizeContactBuilderContent(value: unknown): ContactBuilderContent {
  return normalizeSectionedBuilderContent(value, "contact", CONTACT_SECTION_DEFINITIONS);
}
