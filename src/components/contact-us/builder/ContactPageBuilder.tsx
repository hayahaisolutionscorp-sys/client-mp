'use client';

import type { IContactInformation, IThemeSettings, IBrandingConfig } from '@/models';
import type { IContactPage, IContactSection } from '@/services/content/contact-us.service';
import { getReadableTextColor } from '@/lib/color-utils';
import { normalizeContactBuilderContent, type ContactBuilderSectionConfig } from '@/lib/contact-builder';

// Hero variants
import HeroDefault from './templates/hero/HeroDefault';
import HeroMinimal from './templates/hero/HeroMinimal';
import HeroCentered from './templates/hero/HeroCentered';
import HeroGradient from './templates/hero/HeroGradient';
import HeroSplit from './templates/hero/HeroSplit';

// Contact Form variants
import ContactFormDefault from './templates/contact-form/ContactFormDefault';
import ContactFormSideBySide from './templates/contact-form/ContactFormSideBySide';
import ContactFormMinimal from './templates/contact-form/ContactFormMinimal';
import ContactFormFloating from './templates/contact-form/ContactFormFloating';
import ContactFormPremium from './templates/contact-form/ContactFormPremium';

interface ContactPageBuilderProps {
  contactPage: IContactPage;
  sections: IContactSection[];
  contactInfo: IContactInformation[];
  themeSettings: IThemeSettings | null;
  branding: IBrandingConfig | null;
}

export default function ContactPageBuilder({
  contactPage,
  sections,
  contactInfo,
  themeSettings,
  branding,
}: ContactPageBuilderProps) {
  const primaryColor = themeSettings?.primaryColor || themeSettings?.primary || '#0052CC';
  const secondaryColor = themeSettings?.secondaryColor || themeSettings?.secondary || '#00A3E0';
  const accentColor = themeSettings?.accent || '#FF6B35';
  const surfaceColor = themeSettings?.surface || '#FFFFFF';
  const surfaceAltColor = themeSettings?.surfaceAlt || '#EEF8FC';

  const textOnSurface = getReadableTextColor(surfaceColor);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAltColor);
  const mutedOnSurface = textOnSurface === '#f8fafc' ? '#cbd5e1' : '#64748b';
  const textOnPrimary = getReadableTextColor(primaryColor);

  const builderConfig = normalizeContactBuilderContent(contactPage?.content);

  const enabledSections = builderConfig.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.display_order - b.display_order);

  const heroSection = sections.find((s) => s.type === 'hero') || sections[0];

  const renderSection = (sectionConfig: ContactBuilderSectionConfig) => {
    const { section_key, variant } = sectionConfig;

    switch (section_key) {
      case 'hero':
        switch (variant) {
          case 'minimal':
            return (
              <HeroMinimal
                key="hero"
                hero={heroSection}
                contactPageTitle={contactPage.title}
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
                hero={heroSection}
                contactPageTitle={contactPage.title}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
              />
            );
          case 'gradient':
            return (
              <HeroGradient
                key="hero"
                hero={heroSection}
                contactPageTitle={contactPage.title}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                textOnPrimary={textOnPrimary}
              />
            );
          case 'split':
            return (
              <HeroSplit
                key="hero"
                hero={heroSection}
                contactPageTitle={contactPage.title}
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
                hero={heroSection}
                contactPageTitle={contactPage.title}
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
              />
            );
        }

      case 'contact_form':
        switch (variant) {
          case 'side-by-side':
            return (
              <ContactFormSideBySide
                key="contact_form"
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
                surfaceAltColor={surfaceAltColor}
                textOnSurfaceAlt={textOnSurfaceAlt}
              />
            );
          case 'minimal':
            return (
              <ContactFormMinimal
                key="contact_form"
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
              />
            );
          case 'floating':
            return (
              <ContactFormFloating
                key="contact_form"
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
              />
            );
          case 'premium':
            return (
              <ContactFormPremium
                key="contact_form"
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
                textOnPrimary={textOnPrimary}
              />
            );
          case 'default':
          default:
            return (
              <ContactFormDefault
                key="contact_form"
                primaryColor={primaryColor}
                textColor={textOnSurface}
                mutedColor={mutedOnSurface}
                surfaceColor={surfaceColor}
              />
            );
        }

      default:
        return null;
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-8 md:px-6 md:py-12">
      {enabledSections.map((sectionConfig) => {
        const element = renderSection(sectionConfig);
        if (!element) return null;
        return (
          <div key={sectionConfig.section_key} id={`section-${sectionConfig.section_key}`}>
            {element}
          </div>
        );
      })}
    </div>
  );
}
