'use client';

import { useState, useEffect } from 'react';
import { createBuilderTheme } from '@/components/landing/builder/theme';
import { getReadableTextColor } from '@/lib/color-utils';
import { cn } from '@/lib/utils';
import { normalizeAboutBuilderContent, type AboutSectionKey } from '@/lib/about-builder';
import type { IBrandingConfig, IThemeSettings, ICoreValue } from '@/models';
import type { IAboutUsSection } from '@/services/content/about-us.service';
import { AnimatedSection } from '@/components/whitelabel/AnimatedSection';

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
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scroll-to-section') {
        const sectionId = event.data?.sectionId;
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setActiveSectionId(sectionId);
          setTimeout(() => setActiveSectionId(null), 2000);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const sectionAnimationsRaw = branding?.colors?.sectionAnimations;
  let sectionAnimations: Record<string, string> = {};
  if (sectionAnimationsRaw) {
    if (typeof sectionAnimationsRaw === 'string') {
      try { sectionAnimations = JSON.parse(sectionAnimationsRaw); } catch (e) {}
    } else if (typeof sectionAnimationsRaw === 'object') {
      sectionAnimations = sectionAnimationsRaw as Record<string, string>;
    }
  }

  const getAnimationCSSForSection = (sectionId: string, animation: string) => {
    if (!animation || animation === "none") return "";
    const scope = `.anim-section-${sectionId}`;
    
    switch (animation) {
      case "smooth-up":
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            opacity: 0;
            animation: textSmoothUp-${sectionId} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: 0.2s;
          }
          @keyframes textSmoothUp-${sectionId} {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(1); }
          }
        `;
      case "staggered":
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            opacity: 0;
            filter: blur(10px);
            animation: textStaggered-${sectionId} 1s ease-out forwards;
            animation-delay: 0.3s;
          }
          @keyframes textStaggered-${sectionId} {
            0% { opacity: 0; filter: blur(10px); transform: scale(0.98); }
            100% { opacity: 1; filter: blur(0px); transform: scale(1); }
          }
        `;
      case "typewriter":
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            clip-path: inset(0 100% 0 0);
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            clip-path: inset(0 100% 0 0);
            animation: textTypewriterReveal-${sectionId} 3s steps(60, end) forwards;
            animation-delay: 0.2s;
          }
          @keyframes textTypewriterReveal-${sectionId} {
            from { clip-path: inset(0 100% 0 0); }
            to { clip-path: inset(0 0 0 0); }
          }
        `;
      case "floating":
        return `
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            animation: textFloat-${sectionId} 3s ease-in-out infinite;
          }
          @keyframes textFloat-${sectionId} {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `;
      case "zoom-in":
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3 {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3 {
            opacity: 0;
            animation: textZoom-${sectionId} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes textZoom-${sectionId} {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `;
      default: return "";
    }
  };

  const builderConfig = normalizeAboutBuilderContent(aboutPage?.content);
  const theme = createBuilderTheme((branding ?? {}) as IBrandingConfig);
  const primaryColor = themeSettings?.primary || theme.primary;
  const surfaceColor = themeSettings?.surface || theme.surface;
  const surfaceAltColor = themeSettings?.surfaceAlt || theme.surfaceAlt;
  const textOnSurface = getReadableTextColor(surfaceColor);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAltColor);
  const mutedOnSurface = textOnSurface === '#f8fafc' ? '#cbd5e1' : '#64748b';
  const mutedOnSurfaceAlt = textOnSurfaceAlt === '#f8fafc' ? '#cbd5e1' : '#64748b';

  const fullAnimationCSS = Object.entries(sectionAnimations)
    .filter(([id]) => id.startsWith('about_'))
    .map(([id, anim]) => getAnimationCSSForSection(id, anim))
    .join("\n");

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
        ${fullAnimationCSS}
      ` }} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-6 md:py-12">
        {!heroEnabled ? (
          <div className="rounded-[28px] px-8 py-10 shadow-sm" style={{ backgroundColor: surfaceColor }}>
            <h1 className="text-4xl font-bold" style={{ color: textOnSurface }}>{aboutPage?.title || 'About Us'}</h1>
          </div>
        ) : null}

        {orderedSections.map((section) => {
          const sectionKey = section.section_key as AboutSectionKey;
          const aboutSectionId = `about_${sectionKey === 'core_values' ? 'values' : sectionKey === 'our_story' ? 'story' : sectionKey === 'our_expertise' ? 'expertise' : sectionKey}`;
          const animationStyle = sectionAnimations[aboutSectionId];
          const animationClass = animationStyle && animationStyle !== "none" ? `anim-section-${aboutSectionId}` : "";
          const isFocused = activeSectionId === aboutSectionId;

          let sectionContent = null;
          switch (sectionKey) {
            case 'hero':
              if (section.variant === 'split') {
                sectionContent = (
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
              else if (section.variant === 'minimal') {
                sectionContent = (
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
              else if (section.variant === 'overlay' || section.variant === 'panorama') {
                sectionContent = (
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
              else if (section.variant === 'cards') {
                sectionContent = (
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
              else if (section.variant === 'centered') {
                sectionContent = (
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
              else {
                sectionContent = (
                  <HeroDefault
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                  />
                );
              }
              break;

            case 'welcome':
              if (section.variant === 'spotlight' || section.variant === 'glass') {
                sectionContent = (
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
              else if (section.variant === 'highlight') {
                sectionContent = (
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
              else if (section.variant === 'quote') {
                sectionContent = (
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
              else if (section.variant === 'side-accent') {
                sectionContent = (
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
              else {
                sectionContent = (
                  <WelcomeDefault
                    key={section.id}
                    content={welcome ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }
              break;

            case 'our_story':
              if (section.variant === 'timeline' || section.variant === 'chronicle') {
                sectionContent = (
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
              else if (section.variant === 'milestone') {
                sectionContent = (
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
              else if (section.variant === 'narrative') {
                sectionContent = (
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
              else if (section.variant === 'journey') {
                sectionContent = (
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
              else {
                sectionContent = (
                  <OurStoryDefault
                    key={section.id}
                    content={ourStory ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }
              break;

            case 'our_expertise':
              if (section.variant === 'checklist') {
                sectionContent = (
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
              else if (section.variant === 'grid' || section.variant === 'feature-cards') {
                sectionContent = (
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
              else if (section.variant === 'showcase') {
                sectionContent = (
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
              else if (section.variant === 'badges') {
                sectionContent = (
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
              else {
                sectionContent = (
                  <OurExpertiseDefault
                    key={section.id}
                    content={ourExpertise ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }
              break;

            case 'core_values':
              if (section.variant === 'pillars') {
                sectionContent = (
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
              else if (section.variant === 'icon-grid' || section.variant === 'showcase') {
                sectionContent = (
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
              else if (section.variant === 'timeline') {
                sectionContent = (
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
              else if (section.variant === 'accordion') {
                sectionContent = (
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
              else if (section.variant === 'compact') {
                sectionContent = (
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
              else {
                sectionContent = (
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
              }
              break;

            default:
              sectionContent = null;
              break;
          }
          if (!sectionContent) return null;

          return (
            <AnimatedSection 
              key={section.id} 
              id={`section-${aboutSectionId}`}
              className={cn(
                animationClass,
                isFocused && "ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all duration-500 rounded-lg relative z-50"
              )}
            >
              {sectionContent}
            </AnimatedSection>
          );
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
