'use client';

import type { IFaq, IThemeSettings } from '@/models';
import { getReadableTextColor } from '@/lib/color-utils';
import { normalizeFaqBuilderContent, type FaqBuilderSectionConfig } from '@/lib/faq-builder';

// Hero variants
import HeroDefault from './templates/hero/HeroDefault';
import HeroMinimal from './templates/hero/HeroMinimal';
import HeroCentered from './templates/hero/HeroCentered';
import HeroGradient from './templates/hero/HeroGradient';
import HeroCompact from './templates/hero/HeroCompact';

// FAQ List variants
import FAQListDefault from './templates/faq-list/FAQListDefault';
import FAQListAccordion from './templates/faq-list/FAQListAccordion';
import FAQListCards from './templates/faq-list/FAQListCards';
import FAQListCompact from './templates/faq-list/FAQListCompact';
import FAQListMinimal from './templates/faq-list/FAQListMinimal';

interface FAQPageBuilderProps {
  faqPageContent: unknown | null;
  faqs: IFaq[];
  categories: string[];
  themeSettings: IThemeSettings | null;
}

export default function FAQPageBuilder({
  faqPageContent,
  faqs,
  categories,
  themeSettings,
}: FAQPageBuilderProps) {
  const primaryColor = themeSettings?.primaryColor || themeSettings?.primary || '#0052CC';
  const secondaryColor = themeSettings?.secondaryColor || themeSettings?.secondary || '#00A3E0';
  const surfaceColor = themeSettings?.surface || '#FFFFFF';

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

    switch (section_key) {
      case 'hero':
        switch (variant) {
          case 'minimal':
            return (
              <HeroMinimal
                key="hero"
                title={heroTitle}
                description={heroDescription}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
              />
            );
          case 'centered':
            return (
              <HeroCentered
                key="hero"
                title={heroTitle}
                description={heroDescription}
                primaryColor={primaryColor}
                textOnPrimary={textOnPrimary}
              />
            );
          case 'gradient':
            return (
              <HeroGradient
                key="hero"
                title={heroTitle}
                description={heroDescription}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
                textOnPrimary={textOnPrimary}
              />
            );
          case 'compact':
            return (
              <HeroCompact
                key="hero"
                title={heroTitle}
                description={heroDescription}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
              />
            );
          case 'default':
          default:
            return (
              <HeroDefault
                key="hero"
                title={heroTitle}
                description={heroDescription}
                primaryColor={primaryColor}
                textOnPrimary={textOnPrimary}
              />
            );
        }

      case 'faq_list':
        switch (variant) {
          case 'accordion':
            return (
              <FAQListAccordion
                key="faq_list"
                faqs={faqs}
                categories={categories}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
              />
            );
          case 'cards':
            return (
              <FAQListCards
                key="faq_list"
                faqs={faqs}
                categories={categories}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
              />
            );
          case 'compact':
            return (
              <FAQListCompact
                key="faq_list"
                faqs={faqs}
                categories={categories}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
              />
            );
          case 'minimal':
            return (
              <FAQListMinimal
                key="faq_list"
                faqs={faqs}
                categories={categories}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
              />
            );
          case 'default':
          default:
            return (
              <FAQListDefault
                key="faq_list"
                faqs={faqs}
                categories={categories}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
              />
            );
        }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF8FC]">
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
