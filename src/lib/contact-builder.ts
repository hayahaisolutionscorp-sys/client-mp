export const CONTACT_SECTION_KEYS = [
  "hero",
  "contact_info",
  "contact_form",
] as const;

export type ContactSectionKey = (typeof CONTACT_SECTION_KEYS)[number];

export interface ContactBuilderSectionConfig {
  id: ContactSectionKey;
  section_key: ContactSectionKey;
  label: string;
  variant: string;
  enabled: boolean;
  display_order: number;
}

export interface ContactBuilderContent {
  schema_version: 1;
  page_key: "contact";
  sections: ContactBuilderSectionConfig[];
}

export const CONTACT_SECTION_LABELS: Record<ContactSectionKey, string> = {
  hero: "Hero Banner",
  contact_info: "Contact Information",
  contact_form: "Contact Form",
};

export const CONTACT_VARIANTS: Record<ContactSectionKey, string[]> = {
  hero: ["default"],
  contact_info: ["default", "cards"],
  contact_form: ["default"],
};

export const DEFAULT_CONTACT_BUILDER_CONTENT: ContactBuilderContent = {
  schema_version: 1,
  page_key: "contact",
  sections: [
    { id: "hero", section_key: "hero", label: CONTACT_SECTION_LABELS.hero, variant: "default", enabled: true, display_order: 0 },
    { id: "contact_info", section_key: "contact_info", label: CONTACT_SECTION_LABELS.contact_info, variant: "default", enabled: true, display_order: 1 },
    { id: "contact_form", section_key: "contact_form", label: CONTACT_SECTION_LABELS.contact_form, variant: "default", enabled: true, display_order: 2 },
  ],
};

const isContactSectionKey = (value: unknown): value is ContactSectionKey =>
  typeof value === "string" && CONTACT_SECTION_KEYS.includes(value as ContactSectionKey);

export function normalizeContactBuilderContent(value: unknown): ContactBuilderContent {
  if (!value || typeof value !== "object") {
    return DEFAULT_CONTACT_BUILDER_CONTENT;
  }

  const candidate = value as Partial<ContactBuilderContent>;
  const sectionMap = new Map<ContactSectionKey, ContactBuilderSectionConfig>();

  if (Array.isArray(candidate.sections)) {
    for (const section of candidate.sections) {
      if (!section || typeof section !== "object") continue;
      const sectionKey = (section as Partial<ContactBuilderSectionConfig>).section_key;
      if (!isContactSectionKey(sectionKey)) continue;
      const variants = CONTACT_VARIANTS[sectionKey];
      const variant =
        typeof (section as Partial<ContactBuilderSectionConfig>).variant === "string" &&
        variants.includes((section as Partial<ContactBuilderSectionConfig>).variant!)
          ? (section as Partial<ContactBuilderSectionConfig>).variant!
          : "default";
      sectionMap.set(sectionKey, {
        id: sectionKey,
        section_key: sectionKey,
        label: CONTACT_SECTION_LABELS[sectionKey],
        variant,
        enabled:
          typeof (section as Partial<ContactBuilderSectionConfig>).enabled === "boolean"
            ? (section as Partial<ContactBuilderSectionConfig>).enabled!
            : true,
        display_order:
          typeof (section as Partial<ContactBuilderSectionConfig>).display_order === "number"
            ? (section as Partial<ContactBuilderSectionConfig>).display_order!
            : DEFAULT_CONTACT_BUILDER_CONTENT.sections.find((s) => s.section_key === sectionKey)?.display_order ?? 0,
      });
    }
  }

  const normalizedSections = CONTACT_SECTION_KEYS.map((sectionKey, index) => {
    const existing = sectionMap.get(sectionKey);
    return {
      ...(existing || DEFAULT_CONTACT_BUILDER_CONTENT.sections[index]),
      display_order: existing?.display_order ?? DEFAULT_CONTACT_BUILDER_CONTENT.sections[index].display_order,
    };
  });

  return {
    schema_version: 1,
    page_key: "contact",
    sections: normalizedSections
      .sort((a, b) => a.display_order - b.display_order)
      .map((section, index) => ({ ...section, display_order: index })),
  };
}
