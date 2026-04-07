import Image from 'next/image';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';

import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { createBuilderTheme } from '@/components/landing/builder/theme';
import { getReadableTextColor } from '@/lib/color-utils';
import { normalizeAboutBuilderContent, type AboutSectionKey } from '@/lib/about-builder';
import type { IBrandingConfig, IThemeSettings, ICoreValue } from '@/models';
import type { IAboutUsSection } from '@/services/content/about-us.service';

type AboutRenderableSectionKey =
  | 'hero'
  | 'welcome'
  | 'our_story'
  | 'our_expertise'
  | 'core_values';

const RENDERABLE_SECTION_KEYS = new Set<AboutRenderableSectionKey>([
  'hero',
  'welcome',
  'our_story',
  'our_expertise',
  'core_values',
]);

const SECTION_HEADINGS: Record<Exclude<AboutRenderableSectionKey, 'hero' | 'core_values'>, string> = {
  welcome: 'Welcome',
  our_story: 'Our Story',
  our_expertise: 'Our Expertise',
};

function renderRichText(content?: string | null) {
  return {
    __html: DOMPurify.sanitize(content || ''),
  };
}

function AboutTextSection({
  heading,
  title,
  description,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: {
  heading: string;
  title?: string | null;
  description?: string | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}) {
  if (!title && !description) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-8 shadow-sm md:p-10"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <p
        className="text-xs font-bold uppercase tracking-[0.24em]"
        style={{ color: primaryColor }}
      >
        {heading}
      </p>
      {title ? <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>{title}</h2> : null}
      {description ? (
        <div
          className="prose mt-5 max-w-none"
          style={{ color: mutedColor }}
          dangerouslySetInnerHTML={renderRichText(description)}
        />
      ) : null}
    </section>
  );
}

function AboutSpotlightSection({
  heading,
  title,
  description,
  primaryColor,
  textColor,
  mutedColor,
  surfaceColor,
}: {
  heading: string;
  title?: string | null;
  description?: string | null;
  primaryColor: string;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
}) {
  if (!title && !description) {
    return null;
  }

  return (
    <section
      className="rounded-[28px] border border-slate-200 p-0 shadow-sm overflow-hidden"
      style={{ backgroundColor: surfaceColor, color: textColor }}
    >
      <div
        className="px-8 py-5 text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 45%, #ffffff))` }}
      >
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">{heading}</p>
      </div>
      <div className="px-8 py-8 md:px-10">
        {title ? <h2 className="text-3xl font-bold" style={{ color: textColor }}>{title}</h2> : null}
        {description ? (
          <div
            className="prose mt-5 max-w-none"
            style={{ color: mutedColor }}
            dangerouslySetInnerHTML={renderRichText(description)}
          />
        ) : null}
      </div>
    </section>
  );
}

export interface AboutPageContentProps {
  aboutPage: { title: string; content: unknown | null } | null;
  sections: IAboutUsSection[];
  coreValues: ICoreValue[];
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

export function AboutPageContent({
  aboutPage,
  sections,
  coreValues,
  themeSettings,
  branding,
}: AboutPageContentProps) {
  const builderConfig = normalizeAboutBuilderContent(aboutPage?.content);
  const theme = createBuilderTheme((branding ?? {}) as IBrandingConfig);
  const primaryColor = themeSettings?.primary || theme.primary;
  const surfaceColor = themeSettings?.surface || theme.surface;
  const surfaceAltColor = themeSettings?.surfaceAlt || theme.surfaceAlt;
  const textOnSurface = getReadableTextColor(surfaceColor);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAltColor);
  const mutedOnSurface = textOnSurface === '#f8fafc' ? '#cbd5e1' : '#64748b';
  const mutedOnSurfaceAlt = textOnSurfaceAlt === '#f8fafc' ? '#cbd5e1' : '#64748b';
  const textOnPrimary = getReadableTextColor(primaryColor);
  const orderedSections = builderConfig.sections.filter(
    (section): section is (typeof builderConfig.sections)[number] & { section_key: AboutRenderableSectionKey } =>
      section.enabled && RENDERABLE_SECTION_KEYS.has(section.section_key as AboutRenderableSectionKey)
  );

  const sectionByType = new Map(sections.map((section) => [section.type, section]));
  const hero = sectionByType.get('hero');
  const sectionMap: Record<'welcome' | 'our_story' | 'our_expertise', IAboutUsSection | undefined> = {
    welcome: sectionByType.get('welcome'),
    our_story: sectionByType.get('our_story'),
    our_expertise: sectionByType.get('our_expertise'),
  };
  const heroEnabled = orderedSections.some((section) => section.section_key === 'hero');

  return (
    <div
      className=""
      style={{
        backgroundColor: surfaceAltColor,
        color: textOnSurfaceAlt,
        '--primary-color': primaryColor,
      } as React.CSSProperties}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        {!heroEnabled ? (
          <div className="rounded-[28px] px-8 py-10 shadow-sm" style={{ backgroundColor: surfaceColor }}>
            <h1 className="text-4xl font-bold" style={{ color: textOnSurface }}>{aboutPage?.title || 'About Us'}</h1>
          </div>
        ) : null}

        {orderedSections.map((section) => {
          switch (section.section_key as AboutSectionKey) {
            case 'hero':
              if (section.variant === 'split') {
                return (
                  <section
                    key={section.id}
                    className="rounded-[32px] overflow-hidden border border-slate-200 shadow-xl"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <div className="grid md:grid-cols-2">
                      <div className="px-8 py-10 md:px-10 md:py-12 flex flex-col justify-center">
                        <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
                          About Us
                        </p>
                        <h1 className="mt-4 text-4xl font-bold md:text-5xl" style={{ color: textOnSurface }}>
                          {hero?.title || aboutPage?.title || 'About Us'}
                        </h1>
                        {hero?.description ? (
                          <div
                            className="prose mt-5 max-w-none"
                            style={{ color: mutedOnSurface }}
                            dangerouslySetInnerHTML={renderRichText(hero.description)}
                          />
                        ) : null}
                      </div>
                      <div className="relative min-h-[280px] md:min-h-[420px] bg-slate-100">
                        {hero?.bg_url ? (
                          <Image
                            src={hero.bg_url}
                            alt={hero.bg_alt || hero.title || 'About Us'}
                            fill
                            priority
                            className="object-cover"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                      </div>
                    </div>
                  </section>
                );
              }

              if (section.variant === 'minimal') {
                return (
                  <section
                    key={section.id}
                    className="rounded-[28px] border border-slate-200 px-8 py-10 md:px-10 md:py-12 shadow-sm"
                    style={{ backgroundColor: surfaceColor }}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: primaryColor }}>
                      About Us
                    </p>
                    <h1 className="mt-4 text-4xl font-bold md:text-5xl" style={{ color: textOnSurface }}>
                      {hero?.title || aboutPage?.title || 'About Us'}
                    </h1>
                    {hero?.description ? (
                      <div
                        className="prose mt-5 max-w-none"
                        style={{ color: mutedOnSurface }}
                        dangerouslySetInnerHTML={renderRichText(hero.description)}
                      />
                    ) : null}
                  </section>
                );
              }

              return (
                <section
                  key={section.id}
                  className="relative min-h-[360px] overflow-hidden rounded-[32px] bg-slate-900 shadow-xl"
                >
                  {hero?.bg_url ? (
                    <Image
                      src={hero.bg_url}
                      alt={hero.bg_alt || hero.title || 'About Us'}
                      fill
                      priority
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
                  <div className="relative flex min-h-[360px] items-end px-8 py-10 md:px-12">
                    <div className="max-w-3xl text-white">
                      <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
                        About Us
                      </p>
                      <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                        {hero?.title || aboutPage?.title || 'About Us'}
                      </h1>
                      {hero?.description ? (
                        <div
                          className="prose prose-invert mt-5 max-w-none text-white/90"
                          dangerouslySetInnerHTML={renderRichText(hero.description)}
                        />
                      ) : null}
                    </div>
                  </div>
                </section>
              );
            case 'welcome':
            case 'our_story':
            case 'our_expertise': {
              const sectionKey = section.section_key as keyof typeof SECTION_HEADINGS;
              const content = sectionMap[sectionKey];

              if (section.section_key === 'welcome' && section.variant === 'spotlight') {
                return (
                  <AboutSpotlightSection
                    key={section.id}
                    heading={SECTION_HEADINGS[sectionKey]}
                    title={content?.title}
                    description={content?.description}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.section_key === 'our_story' && section.variant === 'timeline') {
                return (
                  <section
                    key={section.id}
                    className="rounded-[28px] border border-slate-200 p-8 shadow-sm md:p-10"
                    style={{ backgroundColor: surfaceColor, color: textOnSurface }}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
                      Our Story
                    </p>
                    <div className="mt-6 flex gap-5">
                      <div className="relative w-6 shrink-0">
                        <span className="absolute left-2 top-0 h-3 w-3 rounded-full" style={{ backgroundColor: primaryColor }} />
                        <span className="absolute left-[11px] top-3 h-[calc(100%-6px)] w-px bg-slate-200" />
                      </div>
                      <div className="pb-2">
                        <h2 className="text-2xl font-bold md:text-3xl" style={{ color: textOnSurface }}>
                          {content?.title || 'Our Journey'}
                        </h2>
                        {content?.description ? (
                          <div
                            className="prose mt-4 max-w-none"
                            style={{ color: mutedOnSurface }}
                            dangerouslySetInnerHTML={renderRichText(content.description)}
                          />
                        ) : null}
                      </div>
                    </div>
                  </section>
                );
              }

              if (section.section_key === 'our_expertise' && section.variant === 'checklist') {
                const expertiseHighlights = [
                  'Reliable operations',
                  'Experienced teams',
                  'Customer-first service',
                ];

                return (
                  <section
                    key={section.id}
                    className="rounded-[28px] border border-slate-200 p-8 shadow-sm md:p-10"
                    style={{ backgroundColor: surfaceColor, color: textOnSurface }}
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
                      Our Expertise
                    </p>
                    <h2 className="mt-4 text-3xl font-bold" style={{ color: textOnSurface }}>
                      {content?.title || 'What We Do Best'}
                    </h2>
                    {content?.description ? (
                      <div
                        className="prose mt-5 max-w-none"
                        style={{ color: mutedOnSurface }}
                        dangerouslySetInnerHTML={renderRichText(content.description)}
                      />
                    ) : null}
                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      {expertiseHighlights.map((highlight) => (
                        <div
                          key={highlight}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold"
                          style={{ backgroundColor: surfaceAltColor, color: textOnSurfaceAlt }}
                        >
                          {highlight}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              return (
                <AboutTextSection
                  key={section.id}
                  heading={SECTION_HEADINGS[sectionKey]}
                  title={content?.title}
                  description={content?.description}
                  primaryColor={primaryColor}
                  textColor={textOnSurface}
                  mutedColor={mutedOnSurface}
                  surfaceColor={surfaceColor}
                />
              );
            }
            case 'core_values':
              if (coreValues.length === 0) {
                return null;
              }

              if (section.variant === 'pillars') {
                return (
                  <section key={section.id} className="rounded-[28px] px-6 py-10 shadow-sm md:px-8" style={{ backgroundColor: surfaceColor }}>
                    <div className="mb-8 text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
                        What We Stand For
                      </p>
                      <h2 className="mt-4 text-3xl font-bold" style={{ color: textOnSurface }}>Our Core Values</h2>
                    </div>
                    <div className="grid gap-5 md:grid-cols-3">
                      {coreValues.map((value, index) => (
                        <div
                          key={value.id}
                          className="rounded-2xl border border-slate-200 p-6"
                          style={{ backgroundColor: surfaceAltColor, color: textOnSurfaceAlt }}
                        >
                          <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                            style={{ backgroundColor: primaryColor, color: textOnPrimary }}
                          >
                            {index + 1}
                          </span>
                          <h3 className="mt-4 text-xl font-semibold">{value.title}</h3>
                          <p className="mt-3 text-sm" style={{ color: mutedOnSurfaceAlt }}>{value.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              }

              return (
                <section key={section.id} className="rounded-[28px] px-6 py-10 shadow-sm md:px-8" style={{ backgroundColor: surfaceColor }}>
                  <div className="mb-8 text-center">
                    <p
                      className="text-xs font-bold uppercase tracking-[0.24em]"
                      style={{ color: primaryColor }}
                    >
                      What We Stand For
                    </p>
                    <h2 className="mt-4 text-3xl font-bold" style={{ color: textOnSurface }}>Our Core Values</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-3">
                    {coreValues.map((value) => (
                      <Card key={value.id} className="overflow-hidden border-slate-200 shadow-sm" style={{ backgroundColor: surfaceAltColor }}>
                        <CardContent className="p-6">
                          <div className="mb-4 flex justify-center">
                            <img
                              src={value.icon_url}
                              alt={value.icon_alt || value.title}
                              className="h-16 w-16 object-contain"
                            />
                          </div>
                          <h3 className="text-center text-xl font-semibold" style={{ color: textOnSurfaceAlt }}>{value.title}</h3>
                          <p className="mt-3 text-center" style={{ color: textOnSurfaceAlt === '#f8fafc' ? '#cbd5e1' : '#475569' }}>{value.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              );
            default:
              return null;
          }
        })}

        <section
          className="rounded-[28px] px-8 py-10 text-center text-white shadow-lg"
          style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, color: textOnPrimary }}
        >
          <h2 className="text-2xl font-semibold md:text-3xl">Ready to work with us?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base" style={{ color: textOnPrimary === '#f8fafc' ? '#e2e8f0' : '#334155' }}>
            Reach out to our team and we&apos;ll help you move passengers, cargo, and operations with less friction.
          </p>
          <Link href="/contact-us" className="mt-6 inline-flex">
            <Button variant="default" className="px-6 py-3 text-sm font-semibold">
              Get in touch
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
