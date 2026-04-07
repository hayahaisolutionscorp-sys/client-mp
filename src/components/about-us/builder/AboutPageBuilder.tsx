'use client';

import { createBuilderTheme } from '@/components/landing/builder/theme';
import { getReadableTextColor } from '@/lib/color-utils';
import { normalizeAboutBuilderContent, type AboutSectionKey } from '@/lib/about-builder';
import type { IBrandingConfig, IThemeSettings, ICoreValue } from '@/models';
import type { IAboutUsSection } from '@/services/content/about-us.service';

import HeroDefault from './templates/hero/HeroDefault';
import HeroSplit from './templates/hero/HeroSplit';
import HeroMinimal from './templates/hero/HeroMinimal';
import HeroOverlay from './templates/hero/HeroOverlay';
import HeroCards from './templates/hero/HeroCards';
import HeroCentered from './templates/hero/HeroCentered';
import WelcomeDefault from './templates/welcome/WelcomeDefault';
import WelcomeSpotlight from './templates/welcome/WelcomeSpotlight';
import WelcomeHighlight from './templates/welcome/WelcomeHighlight';
import WelcomeQuote from './templates/welcome/WelcomeQuote';
import WelcomeSideAccent from './templates/welcome/WelcomeSideAccent';
import OurStoryDefault from './templates/our-story/OurStoryDefault';
import OurStoryTimeline from './templates/our-story/OurStoryTimeline';
import OurStoryMilestone from './templates/our-story/OurStoryMilestone';
import OurStoryNarrative from './templates/our-story/OurStoryNarrative';
import OurStoryJourney from './templates/our-story/OurStoryJourney';
import OurExpertiseDefault from './templates/our-expertise/OurExpertiseDefault';
import OurExpertiseChecklist from './templates/our-expertise/OurExpertiseChecklist';
import OurExpertiseGrid from './templates/our-expertise/OurExpertiseGrid';
import OurExpertiseShowcase from './templates/our-expertise/OurExpertiseShowcase';
import OurExpertiseBadges from './templates/our-expertise/OurExpertiseBadges';
import CoreValuesDefault from './templates/core-values/CoreValuesDefault';
import CoreValuesPillars from './templates/core-values/CoreValuesPillars';
import CoreValuesIconGrid from './templates/core-values/CoreValuesIconGrid';
import CoreValuesTimeline from './templates/core-values/CoreValuesTimeline';
import CoreValuesAccordion from './templates/core-values/CoreValuesAccordion';
import CoreValuesCompact from './templates/core-values/CoreValuesCompact';
import CTASection from './CTASection';

export interface AboutPageBuilderProps {
  aboutPage: { title: string; content: unknown | null } | null;
  sections: IAboutUsSection[];
  coreValues: ICoreValue[];
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

export default function AboutPageBuilder({
  aboutPage,
  sections,
  coreValues,
  themeSettings,
  branding,
}: AboutPageBuilderProps) {
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

  const orderedSections = builderConfig.sections
    .filter((section) => section.enabled)
    .sort((left, right) => left.display_order - right.display_order);

  const sectionByType = new Map(sections.map((section) => [section.type, section]));
  const hero = sectionByType.get('hero');
  const welcome = sectionByType.get('welcome');
  const ourStory = sectionByType.get('our_story');
  const ourExpertise = sectionByType.get('our_expertise');

  const heroEnabled = orderedSections.some((section) => section.section_key === 'hero');

  return (
    <div
      style={{
        backgroundColor: surfaceAltColor,
        color: textOnSurfaceAlt,
        fontFamily: theme.fontFamily,
        '--primary-color': primaryColor,
        '--font-title': theme.fontFamilyTitle,
        '--font-body': theme.fontFamily,
      } as React.CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .brand-title {
          font-family: var(--font-title), var(--font-body) !important;
        }
      ` }} />

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
                  <HeroSplit
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'minimal') {
                return (
                  <HeroMinimal
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'overlay') {
                return (
                  <HeroOverlay
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                  />
                );
              }

              if (section.variant === 'cards') {
                return (
                  <HeroCards
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'centered') {
                return (
                  <HeroCentered
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              return (
                <HeroDefault
                  key={section.id}
                  hero={hero ?? null}
                  aboutPageTitle={aboutPage?.title || 'About Us'}
                  primaryColor={primaryColor}
                  textColor={textOnSurface}
                  mutedColor={mutedOnSurface}
                />
              );

            case 'welcome':
              if (section.variant === 'spotlight') {
                return (
                  <WelcomeSpotlight
                    key={section.id}
                    content={welcome ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'highlight') {
                return (
                  <WelcomeHighlight
                    key={section.id}
                    content={welcome ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'quote') {
                return (
                  <WelcomeQuote
                    key={section.id}
                    content={welcome ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'side-accent') {
                return (
                  <WelcomeSideAccent
                    key={section.id}
                    content={welcome ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              return (
                <WelcomeDefault
                  key={section.id}
                  content={welcome ?? null}
                  primaryColor={primaryColor}
                  textColor={textOnSurface}
                  mutedColor={mutedOnSurface}
                  surfaceColor={surfaceColor}
                />
              );

            case 'our_story':
              if (section.variant === 'timeline') {
                return (
                  <OurStoryTimeline
                    key={section.id}
                    content={ourStory ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'milestone') {
                return (
                  <OurStoryMilestone
                    key={section.id}
                    content={ourStory ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'narrative') {
                return (
                  <OurStoryNarrative
                    key={section.id}
                    content={ourStory ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'journey') {
                return (
                  <OurStoryJourney
                    key={section.id}
                    content={ourStory ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                    surfaceAltColor={surfaceAltColor}
                  />
                );
              }

              return (
                <OurStoryDefault
                  key={section.id}
                  content={ourStory ?? null}
                  primaryColor={primaryColor}
                  textColor={textOnSurface}
                  mutedColor={mutedOnSurface}
                  surfaceColor={surfaceColor}
                />
              );

            case 'our_expertise':
              if (section.variant === 'checklist') {
                return (
                  <OurExpertiseChecklist
                    key={section.id}
                    content={ourExpertise ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                    surfaceAltColor={surfaceAltColor}
                    textOnSurfaceAlt={textOnSurfaceAlt}
                  />
                );
              }

              if (section.variant === 'grid') {
                return (
                  <OurExpertiseGrid
                    key={section.id}
                    content={ourExpertise ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                    surfaceAltColor={surfaceAltColor}
                    textOnSurfaceAlt={textOnSurfaceAlt}
                  />
                );
              }

              if (section.variant === 'showcase') {
                return (
                  <OurExpertiseShowcase
                    key={section.id}
                    content={ourExpertise ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              if (section.variant === 'badges') {
                return (
                  <OurExpertiseBadges
                    key={section.id}
                    content={ourExpertise ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }

              return (
                <OurExpertiseDefault
                  key={section.id}
                  content={ourExpertise ?? null}
                  primaryColor={primaryColor}
                  textColor={textOnSurface}
                  mutedColor={mutedOnSurface}
                  surfaceColor={surfaceColor}
                />
              );

            case 'core_values':
              if (section.variant === 'pillars') {
                return (
                  <CoreValuesPillars
                    key={section.id}
                    coreValues={coreValues}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    textOnPrimary={textOnPrimary}
                    surfaceColor={surfaceColor}
                    surfaceAltColor={surfaceAltColor}
                    textOnSurfaceAlt={textOnSurfaceAlt}
                    mutedOnSurfaceAlt={mutedOnSurfaceAlt}
                  />
                );
              }

              if (section.variant === 'icon-grid') {
                return (
                  <CoreValuesIconGrid
                    key={section.id}
                    coreValues={coreValues}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    surfaceColor={surfaceColor}
                    surfaceAltColor={surfaceAltColor}
                    textOnSurfaceAlt={textOnSurfaceAlt}
                    mutedOnSurfaceAlt={mutedOnSurfaceAlt}
                  />
                );
              }

              if (section.variant === 'timeline') {
                return (
                  <CoreValuesTimeline
                    key={section.id}
                    coreValues={coreValues}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    surfaceColor={surfaceColor}
                    mutedColor={mutedOnSurface}
                  />
                );
              }

              if (section.variant === 'accordion') {
                return (
                  <CoreValuesAccordion
                    key={section.id}
                    coreValues={coreValues}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    surfaceColor={surfaceColor}
                    surfaceAltColor={surfaceAltColor}
                    textOnSurfaceAlt={textOnSurfaceAlt}
                    mutedOnSurfaceAlt={mutedOnSurfaceAlt}
                  />
                );
              }

              if (section.variant === 'compact') {
                return (
                  <CoreValuesCompact
                    key={section.id}
                    coreValues={coreValues}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    surfaceColor={surfaceColor}
                    mutedColor={mutedOnSurface}
                  />
                );
              }

              return (
                <CoreValuesDefault
                  key={section.id}
                  coreValues={coreValues}
                  primaryColor={primaryColor}
                  textColor={textOnSurface}
                  surfaceColor={surfaceColor}
                  surfaceAltColor={surfaceAltColor}
                  textOnSurfaceAlt={textOnSurfaceAlt}
                />
              );

            default:
              return null;
          }
        })}

        <CTASection
          primaryColor={theme.primary}
          secondaryColor={theme.secondary}
          textOnPrimary={textOnPrimary}
        />
      </div>
    </div>
  );
}
