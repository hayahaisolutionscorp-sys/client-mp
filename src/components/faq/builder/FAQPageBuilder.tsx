'use client';

import { useState, useEffect } from 'react';
import type { IFaq, IThemeSettings, IBrandingConfig } from '@/models';
import { getReadableTextColor } from '@/lib/color-utils';
import { normalizeFaqBuilderContent, type FaqBuilderSectionConfig } from '@/lib/faq-builder';
import { cn } from '@/lib/utils';
import { AnimatedSection } from '@/components/whitelabel/AnimatedSection';
import { createBuilderTheme } from '@/components/landing/builder/theme';
import { useThemeSettings as useThemeSettingsHook } from '@/hooks/theme-settings';
import { useBranding as useBrandingHook } from '@/hooks/branding';
import { brandRadiusScopeStyle } from '@/lib/branding/brand-radius';
import TipTapRenderer from '@/components/shared/TipTapRenderer';

// Hero variants
import HeroDefault from './templates/hero/HeroDefault';
import HeroMinimal from './templates/hero/HeroMinimal';
import HeroCentered from './templates/hero/HeroCentered';
import HeroGradient from './templates/hero/HeroGradient';
import HeroCompact from './templates/hero/HeroCompact';
import HeroGlassmorphicFaq from './templates/hero/HeroGlassmorphicFaq';
import HeroBoardingPassFaq from './templates/hero/HeroBoardingPassFaq';

// FAQ List variants
import FAQListDefault from './templates/faq-list/FAQListDefault';
import FAQListAccordion from './templates/faq-list/FAQListAccordion';
import FAQListCards from './templates/faq-list/FAQListCards';
import FAQListCompact from './templates/faq-list/FAQListCompact';
import FAQListMinimal from './templates/faq-list/FAQListMinimal';
import FAQListGlassmorphic from './templates/faq-list/FAQListGlassmorphic';
import FAQListBoardingPass from './templates/faq-list/FAQListBoardingPass';

interface FAQPageBuilderProps {
  faqPageContent: unknown | null;
  faqs: IFaq[];
  categories: string[];
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

export default function FAQPageBuilder({
  faqPageContent,
  faqs,
  categories,
  themeSettings,
  branding,
}: FAQPageBuilderProps) {
  const contextThemeSettings = useThemeSettingsHook();
  const contextBranding = useBrandingHook();
  const resolvedThemeSettings = themeSettings ?? contextThemeSettings ?? null;
  const resolvedBranding = branding ?? contextBranding ?? null;
  const builderTheme = createBuilderTheme((resolvedBranding ?? {}) as IBrandingConfig);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [islandCategory, setIslandCategory] = useState<string>(categories[0] || '');
  const [openIslandFaqs, setOpenIslandFaqs] = useState<Set<number>>(new Set());
  const islandFaqs = islandCategory ? faqs.filter((faq) => faq.category === islandCategory) : faqs;

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

  const fullAnimationCSS = Object.entries(sectionAnimations)
    .filter(([id]) => id.startsWith('faq_'))
    .map(([id, anim]) => getAnimationCSSForSection(id, anim))
    .join("\n");
  const primaryColor =
    resolvedThemeSettings?.primaryColor || resolvedThemeSettings?.primary || builderTheme.primary;
  const secondaryColor =
    resolvedThemeSettings?.secondaryColor || resolvedThemeSettings?.secondary || builderTheme.secondary;
  const surfaceColor = resolvedThemeSettings?.surface || builderTheme.surface;

  const textOnSurface = getReadableTextColor(surfaceColor);
  const mutedOnSurface = textOnSurface === '#f8fafc' ? '#cbd5e1' : '#64748b';
  const textOnPrimary = getReadableTextColor(primaryColor);

  const builderConfig = normalizeFaqBuilderContent(faqPageContent);

  const enabledSections = builderConfig.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.display_order - b.display_order);

  const heroTitle = 'Frequently Asked Questions';
  const heroDescription = 'Find answers to common questions about our maritime travel services';

  const renderSection = (sectionConfig: FaqBuilderSectionConfig) => {
    const { section_key, variant } = sectionConfig;

    let sectionContent = null;
    switch (section_key) {
      case 'hero':
        switch (variant) {
          case 'island-premium':
            sectionContent = (
              <section className="overflow-hidden rounded-[2rem] p-6 shadow-[0_24px_80px_-55px_rgba(8,47,73,0.45)] md:p-10" style={{ backgroundColor: surfaceAltColor }}>
                <h1 className="text-4xl font-semibold leading-tight" style={{ color: textOnSurface }}>
                  {heroTitle}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7" style={{ color: mutedOnSurface }}>
                  {heroDescription}
                </p>
              </section>
            );
            break;
          case 'minimal':
            sectionContent = (
              <HeroMinimal key="hero" title={heroTitle} description={heroDescription} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'centered':
            sectionContent = (
              <HeroCentered key="hero" title={heroTitle} description={heroDescription} primaryColor={primaryColor} textOnPrimary={textOnPrimary} />
            );
            break;
          case 'gradient':
            sectionContent = (
              <HeroGradient key="hero" title={heroTitle} description={heroDescription} primaryColor={primaryColor} secondaryColor={secondaryColor} textOnPrimary={textOnPrimary} />
            );
            break;
          case 'compact':
            sectionContent = (
              <HeroCompact key="hero" title={heroTitle} description={heroDescription} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'glassmorphic':
            sectionContent = (
              <HeroGlassmorphicFaq key="hero" title={heroTitle} description={heroDescription} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'boarding-pass':
            sectionContent = (
              <HeroBoardingPassFaq key="hero" title={heroTitle} description={heroDescription} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'default':
          default:
            sectionContent = (
              <HeroDefault key="hero" title={heroTitle} description={heroDescription} primaryColor={primaryColor} textOnPrimary={textOnPrimary} />
            );
            break;
        }
        break;

      case 'faq_list':
        switch (variant) {
          case 'island-premium':
            sectionContent = (
              <section className="rounded-[2rem] p-5 shadow-[0_24px_80px_-55px_rgba(8,47,73,0.45)] md:p-8" style={{ backgroundColor: surfaceColor }}>
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h2 className="text-3xl font-semibold" style={{ color: textOnSurface }}>
                      Frequently Asked Questions
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setIslandCategory(category)}
                        className={cn(
                          'rounded-full px-4 py-2 text-sm font-semibold transition',
                          islandCategory === category ? 'text-white' : 'hover:opacity-90'
                        )}
                        style={{
                          backgroundColor: islandCategory === category ? primaryColor : surfaceAltColor,
                          color: islandCategory === category ? textOnPrimary : textOnSurface,
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4">
                  {islandFaqs.map((faq) => {
                    const isOpen = openIslandFaqs.has(faq.id);
                    return (
                      <article key={faq.id} className="overflow-hidden rounded-[1.5rem] border" style={{ borderColor: `${primaryColor}26`, backgroundColor: surfaceAltColor }}>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenIslandFaqs((current) => {
                              const next = new Set(current);
                              if (next.has(faq.id)) next.delete(faq.id);
                              else next.add(faq.id);
                              return next;
                            });
                          }}
                          className="flex w-full items-start justify-between gap-4 p-5 text-left"
                        >
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: primaryColor }}>{faq.category}</p>
                            <h3 className="mt-3 text-lg font-semibold" style={{ color: textOnSurface }}>{faq.question}</h3>
                          </div>
                          <span className="rounded-full px-3 py-1 text-sm font-semibold" style={{ backgroundColor: surfaceColor, color: textOnSurface }}>
                            {isOpen ? '−' : '+'}
                          </span>
                        </button>
                        {isOpen ? (
                          <div className="border-t border-cyan-100 px-5 pb-5 text-sm leading-7" style={{ color: mutedOnSurface }}>
                            <TipTapRenderer content={faq.answer} />
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </section>
            );
            break;
          case 'accordion':
            sectionContent = (
              <FAQListAccordion key="faq_list" faqs={faqs} categories={categories} primaryColor={primaryColor} textColor={textOnSurface} textOnPrimary={textOnPrimary} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'cards':
            sectionContent = (
              <FAQListCards key="faq_list" faqs={faqs} categories={categories} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} />
            );
            break;
          case 'compact':
            sectionContent = (
              <FAQListCompact key="faq_list" faqs={faqs} categories={categories} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} />
            );
            break;
          case 'minimal':
            sectionContent = (
              <FAQListMinimal key="faq_list" faqs={faqs} categories={categories} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} />
            );
            break;
          case 'glassmorphic':
            sectionContent = (
              <FAQListGlassmorphic key="faq_list" faqs={faqs} categories={categories} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'boarding-pass':
            sectionContent = (
              <FAQListBoardingPass key="faq_list" faqs={faqs} categories={categories} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'default':
          default:
            sectionContent = (
              <FAQListDefault key="faq_list" faqs={faqs} categories={categories} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} />
            );
            break;
        }
        break;

      default:
        sectionContent = null;
    }

    if (!sectionContent) return null;

    const faqSectionId = section_key === 'hero' ? 'faq_hero' : 'faq_list';
    const animationStyle = sectionAnimations[faqSectionId];
    const animationClass = animationStyle && animationStyle !== "none" ? `anim-section-${faqSectionId}` : "";
    const isFocused = activeSectionId === faqSectionId;

    return (
      <AnimatedSection 
        key={section_key} 
        id={`section-${faqSectionId}`}
        className={cn(
          animationClass,
          isFocused && "ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all duration-500 rounded-lg relative z-50"
        )}
      >
        {sectionContent}
      </AnimatedSection>
    );
  };

  return (
    <div
      className="wl-brand-radius-scope min-h-screen flex flex-col bg-[var(--surface-alt)]"
      style={brandRadiusScopeStyle(resolvedBranding)}
    >
      <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
      <main className="flex-grow pt-25 md:pt-10">
        <div className="space-y-8">
          {enabledSections.map((sectionConfig) => {
            if (sectionConfig.section_key === 'hero') {
              const element = renderSection(sectionConfig);
              if (!element) return null;
              return <div key={sectionConfig.section_key} id={`section-${sectionConfig.section_key}`}>{element}</div>;
            }
            return null;
          })}
        </div>

        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {enabledSections.map((sectionConfig) => {
            if (sectionConfig.section_key === 'faq_list') {
              const element = renderSection(sectionConfig);
              if (!element) return null;
              return <div key={sectionConfig.section_key} id={`section-${sectionConfig.section_key}`}>{element}</div>;
            }
            return null;
          })}
        </div>
      </main>
    </div>
  );
}
