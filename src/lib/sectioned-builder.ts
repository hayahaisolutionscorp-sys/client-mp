export interface SectionedBuilderDefinition<SectionKey extends string> {
  section_key: SectionKey;
  label: string;
  variant_values: readonly string[];
}

export interface SectionedBuilderSectionConfig<SectionKey extends string> {
  id: SectionKey;
  section_key: SectionKey;
  label: string;
  variant: string;
  enabled: boolean;
  display_order: number;
}

export interface SectionedBuilderContent<PageKey extends string, SectionKey extends string> {
  schema_version: 1;
  page_key: PageKey;
  sections: SectionedBuilderSectionConfig<SectionKey>[];
}

export interface SectionedBuilderPresetSectionDefaults {
  enabled: boolean;
  variant: string;
}

const getDefaultVariant = (variantValues: readonly string[]) => variantValues[0] ?? "default";

export function createSectionedBuilderContent<PageKey extends string, SectionKey extends string>(
  pageKey: PageKey,
  definitions: readonly SectionedBuilderDefinition<SectionKey>[]
): SectionedBuilderContent<PageKey, SectionKey> {
  return {
    schema_version: 1,
    page_key: pageKey,
    sections: definitions.map((definition, index) => ({
      id: definition.section_key,
      section_key: definition.section_key,
      label: definition.label,
      variant: getDefaultVariant(definition.variant_values),
      enabled: true,
      display_order: index,
    })),
  };
}

export function createSectionedBuilderContentFromPreset<PageKey extends string, SectionKey extends string>(
  pageKey: PageKey,
  definitions: readonly SectionedBuilderDefinition<SectionKey>[],
  presetSections: Partial<Record<SectionKey, SectionedBuilderPresetSectionDefaults>>
): SectionedBuilderContent<PageKey, SectionKey> {
  return {
    schema_version: 1,
    page_key: pageKey,
    sections: definitions.map((definition, index) => {
      const presetSection = presetSections[definition.section_key];

      return {
        id: definition.section_key,
        section_key: definition.section_key,
        label: definition.label,
        variant: presetSection?.variant ?? getDefaultVariant(definition.variant_values),
        enabled: presetSection?.enabled ?? true,
        display_order: index,
      };
    }),
  };
}

export function replaceSectionedBuilderSectionOrder<SectionKey extends string>(
  sections: SectionedBuilderSectionConfig<SectionKey>[]
): SectionedBuilderSectionConfig<SectionKey>[] {
  return sections.map((section, index) => ({ ...section, display_order: index }));
}

export function normalizeSectionedBuilderContent<PageKey extends string, SectionKey extends string>(
  value: unknown,
  pageKey: PageKey,
  definitions: readonly SectionedBuilderDefinition<SectionKey>[]
): SectionedBuilderContent<PageKey, SectionKey> {
  const defaultContent = createSectionedBuilderContent(pageKey, definitions);

  if (!value || typeof value !== "object") {
    return defaultContent;
  }

  const definitionMap = new Map(definitions.map((definition) => [definition.section_key, definition]));
  const candidate = value as Partial<SectionedBuilderContent<PageKey, SectionKey>>;
  const sectionMap = new Map<SectionKey, SectionedBuilderSectionConfig<SectionKey>>();

  if (Array.isArray(candidate.sections)) {
    for (const section of candidate.sections) {
      if (!section || typeof section !== "object") continue;

      const sectionKey = (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).section_key;
      const definition = definitionMap.get(sectionKey as SectionKey);
      if (!definition) continue;

      const variantValue =
        typeof (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).variant === "string" &&
        definition.variant_values.includes(
          (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).variant!
        )
          ? (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).variant!
          : getDefaultVariant(definition.variant_values);

      sectionMap.set(sectionKey as SectionKey, {
        id: sectionKey as SectionKey,
        section_key: sectionKey as SectionKey,
        label: definition.label,
        variant: variantValue,
        enabled:
          typeof (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).enabled === "boolean"
            ? (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).enabled!
            : true,
        display_order:
          typeof (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).display_order === "number"
            ? (section as Partial<SectionedBuilderSectionConfig<SectionKey>>).display_order!
            : defaultContent.sections.find((item) => item.section_key === sectionKey)?.display_order ?? 0,
      });
    }
  }

  const normalizedSections = definitions.map((definition, index) => {
    const existing = sectionMap.get(definition.section_key);
    return {
      ...(existing || defaultContent.sections[index]),
      display_order: existing?.display_order ?? defaultContent.sections[index].display_order,
    };
  });

  return {
    schema_version: 1,
    page_key: pageKey,
    sections: normalizedSections
      .sort((left, right) => left.display_order - right.display_order)
      .map((section, index) => ({ ...section, display_order: index })),
  };
}
