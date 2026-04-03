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

export const ABOUT_SECTION_KEYS = ["hero", "welcome", "our_story", "our_expertise", "core_values"] as const;

export type AboutSectionKey = (typeof ABOUT_SECTION_KEYS)[number];

export type AboutBuilderSectionConfig = SectionedBuilderSectionConfig<AboutSectionKey>;
export type AboutBuilderContent = SectionedBuilderContent<"about", AboutSectionKey>;

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

const ABOUT_SECTION_DEFINITIONS = ABOUT_SECTION_KEYS.map((sectionKey) => ({
  section_key: sectionKey,
  label: ABOUT_SECTION_LABELS[sectionKey],
  variant_values: ABOUT_VARIANTS[sectionKey],
}))

const ABOUT_TEMPLATE_PRESET_SECTION_DEFAULTS: Record<
  string,
  Partial<Record<AboutSectionKey, SectionedBuilderPresetSectionDefaults>>
> = {
  default: {
    hero: { enabled: true, variant: "default" },
    welcome: { enabled: true, variant: "default" },
    our_story: { enabled: true, variant: "default" },
    our_expertise: { enabled: true, variant: "default" },
    core_values: { enabled: true, variant: "default" },
  },
  "rounded-modern": {
    hero: { enabled: true, variant: "split" },
    welcome: { enabled: true, variant: "spotlight" },
    our_story: { enabled: true, variant: "journey" },
    our_expertise: { enabled: true, variant: "grid" },
    core_values: { enabled: true, variant: "compact" },
  },
  professional: {
    hero: { enabled: true, variant: "split" },
    welcome: { enabled: true, variant: "highlight" },
    our_story: { enabled: true, variant: "narrative" },
    our_expertise: { enabled: true, variant: "showcase" },
    core_values: { enabled: true, variant: "pillars" },
  },
  "editorial-sharp": {
    hero: { enabled: true, variant: "minimal" },
    welcome: { enabled: true, variant: "quote" },
    our_story: { enabled: true, variant: "timeline" },
    our_expertise: { enabled: true, variant: "checklist" },
    core_values: { enabled: true, variant: "accordion" },
  },
};

export const DEFAULT_ABOUT_BUILDER_CONTENT = createSectionedBuilderContent("about", ABOUT_SECTION_DEFINITIONS);

export function createAboutBuilderContentFromPreset(preset: string): AboutBuilderContent {
  const normalizedPreset = normalizeLandingTemplatePreset(preset);
  return createSectionedBuilderContentFromPreset(
    "about",
    ABOUT_SECTION_DEFINITIONS,
    ABOUT_TEMPLATE_PRESET_SECTION_DEFAULTS[normalizedPreset] ?? ABOUT_TEMPLATE_PRESET_SECTION_DEFAULTS.default
  );
}

export function replaceAboutBuilderSectionOrder(sections: AboutBuilderSectionConfig[]): AboutBuilderSectionConfig[] {
  return replaceSectionedBuilderSectionOrder(sections);
}

export function normalizeAboutBuilderContent(value: unknown): AboutBuilderContent {
  return normalizeSectionedBuilderContent(value, "about", ABOUT_SECTION_DEFINITIONS);
}
