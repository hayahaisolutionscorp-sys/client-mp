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
import HeroConcierge from './templates/hero/HeroConcierge';
import HeroGlassmorphicAbout from './templates/hero/HeroGlassmorphicAbout';
import WelcomeDefault from './templates/welcome/WelcomeDefault';
import WelcomeSpotlight from './templates/welcome/WelcomeSpotlight';
import WelcomeHighlight from './templates/welcome/WelcomeHighlight';
import WelcomeQuote from './templates/welcome/WelcomeQuote';
import WelcomeSideAccent from './templates/welcome/WelcomeSideAccent';
import WelcomeGlassmorphic from './templates/welcome/WelcomeGlassmorphic';
import OurStoryDefault from './templates/our-story/OurStoryDefault';
import OurStoryTimeline from './templates/our-story/OurStoryTimeline';
import OurStoryMilestone from './templates/our-story/OurStoryMilestone';
import OurStoryNarrative from './templates/our-story/OurStoryNarrative';
import OurStoryJourney from './templates/our-story/OurStoryJourney';
import OurStoryConcierge from './templates/our-story/OurStoryConcierge';
import OurStoryGlassmorphic from './templates/our-story/OurStoryGlassmorphic';
import OurExpertiseDefault from './templates/our-expertise/OurExpertiseDefault';
import OurExpertiseChecklist from './templates/our-expertise/OurExpertiseChecklist';
import OurExpertiseGrid from './templates/our-expertise/OurExpertiseGrid';
import OurExpertiseShowcase from './templates/our-expertise/OurExpertiseShowcase';
import OurExpertiseBadges from './templates/our-expertise/OurExpertiseBadges';
import OurExpertiseGlassmorphic from './templates/our-expertise/OurExpertiseGlassmorphic';
import CoreValuesDefault from './templates/core-values/CoreValuesDefault';
import CoreValuesPillars from './templates/core-values/CoreValuesPillars';
import CoreValuesIconGrid from './templates/core-values/CoreValuesIconGrid';
import CoreValuesTimeline from './templates/core-values/CoreValuesTimeline';
import CoreValuesAccordion from './templates/core-values/CoreValuesAccordion';
import CoreValuesCompact from './templates/core-values/CoreValuesCompact';
import CoreValuesGlassmorphic from './templates/core-values/CoreValuesGlassmorphic';
import HeroBoardingPassAbout from './templates/hero/HeroBoardingPassAbout';
import WelcomeBoardingPass from './templates/welcome/WelcomeBoardingPass';
import OurStoryBoardingPass from './templates/our-story/OurStoryBoardingPass';
import OurExpertiseBoardingPass from './templates/our-expertise/OurExpertiseBoardingPass';
import CoreValuesBoardingPass from './templates/core-values/CoreValuesBoardingPass';
import CTASection from './CTASection';
import { useThemeSettings as useThemeSettingsHook } from '@/hooks/theme-settings';
import { useBranding as useBrandingHook } from '@/hooks/branding';
import { brandRadiusScopeStyle } from '@/lib/branding/brand-radius';
import { formatCssFontStack } from '@/lib/theme-document';
import Media from '@/components/landing/Media';

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
  const contextThemeSettings = useThemeSettingsHook();
  const contextBranding = useBrandingHook();
  const resolvedThemeSettings = themeSettings ?? contextThemeSettings ?? null;
  const resolvedBranding = branding ?? contextBranding ?? null;

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

  const sectionAnimationsRaw = resolvedBranding?.colors?.sectionAnimations;
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
  const theme = createBuilderTheme((resolvedBranding ?? {}) as IBrandingConfig);
  const bodyFontStack = formatCssFontStack(theme.fontFamily);
  const titleFontStack = formatCssFontStack(theme.fontFamilyTitle, theme.fontFamily);
  const primaryColor = resolvedThemeSettings?.primary || theme.primary;
  const surfaceColor = resolvedThemeSettings?.surface || theme.surface;
  const surfaceAltColor = resolvedThemeSettings?.surfaceAlt || theme.surfaceAlt;
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
  const renderAboutMedia = (content: IAboutUsSection | undefined, className: string) => {
    if (!content?.bg_url) return null;
    return (
      <Media
        src={content.bg_url}
        type={(content.bg_type?.toLowerCase() as 'image' | 'video' | 'youtube') || 'image'}
        alt={content.bg_alt || content.title || ''}
        className={className}
        autoPlay
        loop
        muted
        playsInline
        playing
      />
    );
  };

  const heroEnabled = orderedSections.some((section) => section.section_key === 'hero');

  return (
    <div
      className="wl-brand-radius-scope"
      style={{
        backgroundColor: surfaceAltColor,
        color: textOnSurfaceAlt,
        fontFamily: bodyFontStack,
        '--primary-color': primaryColor,
        '--font-title': titleFontStack,
        '--font-body': bodyFontStack,
        ...brandRadiusScopeStyle(resolvedBranding),
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
              if (section.variant === 'island-premium') {
                sectionContent = (
                  <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#fff8ec] p-5 shadow-[0_28px_90px_-55px_rgba(8,47,73,0.5)] md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                      <div className="flex flex-col justify-center py-6">
                        <h1 className="text-4xl font-semibold leading-tight md:text-5xl" style={{ color: textOnSurface, fontFamily: 'var(--font-title)' }}>
                          {hero?.title || aboutPage?.title || 'About Us'}
                        </h1>
                        <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: mutedOnSurface }}>
                          {hero?.description || hero?.subtitle}
                        </p>
                      </div>
                      {hero?.bg_url ? (
                        <div className="relative min-h-[280px] overflow-hidden rounded-[1.75rem] bg-cyan-50">
                          {renderAboutMedia(hero, 'h-full w-full object-cover')}
                          <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/35 to-transparent" />
                        </div>
                      ) : null}
                    </div>
                  </section>
                );
              }
              else if (section.variant === 'split') {
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
              else if (section.variant === 'concierge') {
                sectionContent = (
                  <HeroConcierge
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
              else if (section.variant === 'glassmorphic') {
                sectionContent = (
                  <HeroGlassmorphicAbout
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                  />
                );
              }
              else if (section.variant === 'boarding-pass') {
                sectionContent = (
                  <HeroBoardingPassAbout
                    key={section.id}
                    hero={hero ?? null}
                    aboutPageTitle={aboutPage?.title || 'About Us'}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
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
              if (section.variant === 'island-premium') {
                sectionContent = (
                  <section className="grid gap-5 rounded-[2rem] bg-white p-6 shadow-[0_24px_80px_-55px_rgba(8,47,73,0.45)] md:grid-cols-[0.8fr_1.2fr] md:p-8">
                    {welcome?.bg_url ? (
                      <div className="min-h-64 overflow-hidden rounded-[1.5rem] bg-cyan-50">
                        {renderAboutMedia(welcome, 'h-full w-full object-cover')}
                      </div>
                    ) : null}
                    <div className="flex flex-col justify-center">
                      <h2 className="text-3xl font-semibold" style={{ color: textOnSurface }}>{welcome?.title || 'Welcome'}</h2>
                      <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm leading-7" style={{ color: mutedOnSurface }}>{welcome?.description}</p>
                    </div>
                  </section>
                );
              }
              else if (section.variant === 'spotlight' || section.variant === 'glass') {
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
              else if (section.variant === 'glassmorphic') {
                sectionContent = (
                  <WelcomeGlassmorphic
                    key={section.id}
                    content={welcome ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }
              else if (section.variant === 'boarding-pass') {
                sectionContent = (
                  <WelcomeBoardingPass
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
              else if (section.variant === 'island-premium') {
                sectionContent = (
                  <section className="grid gap-5 rounded-[2rem] bg-[#fff8ec] p-5 md:grid-cols-[0.8fr_1.2fr] md:p-8">
                    <div className="overflow-hidden rounded-[1.5rem] bg-white">
                      {ourStory?.bg_url ? (
                        <div className="h-52">{renderAboutMedia(ourStory, 'h-full w-full object-cover')}</div>
                      ) : null}
                      <div className="p-5">
                        <h2 className="text-3xl font-semibold" style={{ color: textOnSurface }}>{ourStory?.title || 'Our Story'}</h2>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap rounded-[1.5rem] bg-white p-5 text-sm leading-7" style={{ color: mutedOnSurface }}>{ourStory?.description}</p>
                  </section>
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
              else if (section.variant === 'concierge') {
                sectionContent = (
                  <OurStoryConcierge
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
              else if (section.variant === 'glassmorphic') {
                sectionContent = (
                  <OurStoryGlassmorphic
                    key={section.id}
                    content={ourStory ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }
              else if (section.variant === 'boarding-pass') {
                sectionContent = (
                  <OurStoryBoardingPass
                    key={section.id}
                    content={ourStory ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
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
              else if (section.variant === 'island-premium') {
                sectionContent = (
                  <section className="rounded-[2rem] bg-white p-6 md:p-8">
                    <div className="grid gap-6 md:grid-cols-[1fr_0.8fr]">
                      <div>
                        <h2 className="text-3xl font-semibold" style={{ color: textOnSurface }}>{ourExpertise?.title || 'Our Expertise'}</h2>
                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7" style={{ color: mutedOnSurface }}>{ourExpertise?.description}</p>
                      </div>
                      {ourExpertise?.bg_url ? (
                        <div className="min-h-56 overflow-hidden rounded-[1.5rem] bg-cyan-50">
                          {renderAboutMedia(ourExpertise, 'h-full w-full object-cover')}
                        </div>
                      ) : null}
                    </div>
                  </section>
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
              else if (section.variant === 'glassmorphic') {
                sectionContent = (
                  <OurExpertiseGlassmorphic
                    key={section.id}
                    content={ourExpertise ?? null}
                    primaryColor={primaryColor}
                    textColor={textOnSurface}
                    mutedColor={mutedOnSurface}
                    surfaceColor={surfaceColor}
                  />
                );
              }
              else if (section.variant === 'boarding-pass') {
                sectionContent = (
                  <OurExpertiseBoardingPass
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
              if (section.variant === 'island-premium') {
                sectionContent = (
                  <section className="rounded-[2rem] bg-[#fff8ec] p-5 md:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">Core values</p>
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      {coreValues.slice(0, 6).map((value) => (
                        <article key={value.id} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                          {value.icon_url ? <img src={value.icon_url} alt={value.icon_alt || value.title} className="mb-4 h-10 w-10 object-contain" /> : null}
                          <h3 className="text-lg font-semibold" style={{ color: textOnSurface }}>{value.title}</h3>
                          <p className="mt-2 text-sm leading-6" style={{ color: mutedOnSurface }}>{value.description}</p>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              }
              else if (section.variant === 'pillars') {
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
              else if (section.variant === 'glassmorphic') {
                sectionContent = (
                  <CoreValuesGlassmorphic
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
              else if (section.variant === 'boarding-pass') {
                sectionContent = (
                  <CoreValuesBoardingPass
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
