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

export const PRESS_SECTION_KEYS = ["hero", "press_list"] as const;

export type PressSectionKey = (typeof PRESS_SECTION_KEYS)[number];

export type PressBuilderSectionConfig = SectionedBuilderSectionConfig<PressSectionKey>;
export type PressBuilderContent = SectionedBuilderContent<"press", PressSectionKey>;

export const PRESS_SECTION_LABELS: Record<PressSectionKey, string> = {
  hero: "Hero Banner",
  press_list: "Article List",
};

export const PRESS_VARIANTS: Record<PressSectionKey, string[]> = {
  hero: ["default", "centered", "minimal"],
  press_list: ["default", "cards", "minimal", "compact"],
};

const PRESS_SECTION_DEFINITIONS = PRESS_SECTION_KEYS.map((sectionKey) => ({
  section_key: sectionKey,
  label: PRESS_SECTION_LABELS[sectionKey],
  variant_values: PRESS_VARIANTS[sectionKey],
}))

const PRESS_TEMPLATE_PRESET_SECTION_DEFAULTS: Record<
  string,
  Partial<Record<PressSectionKey, SectionedBuilderPresetSectionDefaults>>
> = {
  default: {
    hero: { enabled: true, variant: "default" },
    press_list: { enabled: true, variant: "default" },
  },
  "rounded-modern": {
    hero: { enabled: true, variant: "centered" },
    press_list: { enabled: true, variant: "cards" },
  },
  professional: {
    hero: { enabled: true, variant: "centered" },
    press_list: { enabled: true, variant: "cards" },
  },
  "editorial-sharp": {
    hero: { enabled: true, variant: "minimal" },
    press_list: { enabled: true, variant: "compact" },
  },
  "maritime-elite": {
    hero: { enabled: true, variant: "centered" },
    press_list: { enabled: true, variant: "cards" },
  },
};

export const DEFAULT_PRESS_BUILDER_CONTENT = createSectionedBuilderContent("press", PRESS_SECTION_DEFINITIONS);

export function createPressBuilderContentFromPreset(preset: string): PressBuilderContent {
  const normalizedPreset = normalizeLandingTemplatePreset(preset);
  return createSectionedBuilderContentFromPreset(
    "press",
    PRESS_SECTION_DEFINITIONS,
    PRESS_TEMPLATE_PRESET_SECTION_DEFAULTS[normalizedPreset] ?? PRESS_TEMPLATE_PRESET_SECTION_DEFAULTS.default
  );
}

export function replacePressBuilderSectionOrder(sections: PressBuilderSectionConfig[]): PressBuilderSectionConfig[] {
  return replaceSectionedBuilderSectionOrder(sections);
}

export function normalizePressBuilderContent(value: unknown): PressBuilderContent {
  return normalizeSectionedBuilderContent(value, "press", PRESS_SECTION_DEFINITIONS);
}
