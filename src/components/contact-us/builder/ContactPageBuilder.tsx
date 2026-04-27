'use client';

import { useState, useEffect } from 'react';
import type { IContactInformation, IThemeSettings, IBrandingConfig } from '@/models';
import type { IContactPage, IContactSection } from '@/services/content/contact-us.service';
import { getReadableTextColor } from '@/lib/color-utils';
import { normalizeContactBuilderContent, type ContactBuilderSectionConfig } from '@/lib/contact-builder';
import { cn } from '@/lib/utils';
import { AnimatedSection } from '@/components/whitelabel/AnimatedSection';
import { createBuilderTheme } from '@/components/landing/builder/theme';
import { useThemeSettings as useThemeSettingsHook } from '@/hooks/theme-settings';
import { useBranding as useBrandingHook } from '@/hooks/branding';
import { brandRadiusScopeStyle } from '@/lib/branding/brand-radius';
import Media from '@/components/landing/Media';

// Hero variants
import HeroDefault from './templates/hero/HeroDefault';
import HeroMinimal from './templates/hero/HeroMinimal';
import HeroCentered from './templates/hero/HeroCentered';
import HeroGradient from './templates/hero/HeroGradient';
import HeroSplit from './templates/hero/HeroSplit';
import HeroConcierge from './templates/hero/HeroConcierge';
import HeroGlassmorphicContact from './templates/hero/HeroGlassmorphicContact';
import HeroBoardingPassContact from './templates/hero/HeroBoardingPassContact';

// Contact Form variants
import ContactFormDefault from './templates/contact-form/ContactFormDefault';
import ContactFormSideBySide from './templates/contact-form/ContactFormSideBySide';
import ContactFormMinimal from './templates/contact-form/ContactFormMinimal';
import ContactFormFloating from './templates/contact-form/ContactFormFloating';
import ContactFormPremium from './templates/contact-form/ContactFormPremium';
import ContactFormGlassmorphic from './templates/contact-form/ContactFormGlassmorphic';
import ContactFormBoardingPass from './templates/contact-form/ContactFormBoardingPass';

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
  const contextThemeSettings = useThemeSettingsHook();
  const contextBranding = useBrandingHook();
  const resolvedThemeSettings = themeSettings ?? contextThemeSettings ?? null;
  const resolvedBranding = branding ?? contextBranding ?? null;
  const builderTheme = createBuilderTheme((resolvedBranding ?? {}) as IBrandingConfig);

  const primaryColor =
    resolvedThemeSettings?.primaryColor || resolvedThemeSettings?.primary || builderTheme.primary;
  const secondaryColor =
    resolvedThemeSettings?.secondaryColor || resolvedThemeSettings?.secondary || builderTheme.secondary;
  const accentColor = resolvedThemeSettings?.accent || builderTheme.accent;
  const surfaceColor = resolvedThemeSettings?.surface || builderTheme.surface;
  const surfaceAltColor = resolvedThemeSettings?.surfaceAlt || builderTheme.surfaceAlt;

  const textOnSurface = getReadableTextColor(surfaceColor);
  const textOnSurfaceAlt = getReadableTextColor(surfaceAltColor);
  const mutedOnSurface = textOnSurface === '#f8fafc' ? '#cbd5e1' : '#64748b';
  const textOnPrimary = getReadableTextColor(primaryColor);

  const builderConfig = normalizeContactBuilderContent(contactPage?.content);

  const enabledSections = builderConfig.sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.display_order - b.display_order);

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

  const fullAnimationCSS = Object.entries(sectionAnimations)
    .filter(([id]) => id.startsWith('contact_'))
    .map(([id, anim]) => getAnimationCSSForSection(id, anim))
    .join("\n");

  const heroSection = sections.find((s) => s.type === 'hero') || sections[0];
  const activeContactInfo = contactInfo.filter((item) => item.is_active).slice(0, 4);
  const heroMedia = heroSection?.bg_url ? (
    <Media
      src={heroSection.bg_url}
      type={(heroSection.bg_type?.toLowerCase() as 'image' | 'video' | 'youtube') || 'image'}
      alt={heroSection.bg_alt || heroSection.title || ''}
      className="h-full w-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      playing
    />
  ) : null;

  const renderSection = (sectionConfig: ContactBuilderSectionConfig) => {
    const { section_key, variant } = sectionConfig;

    let sectionContent = null;
    switch (section_key) {
      case 'hero':
        switch (variant) {
          case 'island-premium':
            sectionContent = (
              <section className="overflow-hidden rounded-[2rem] p-5 shadow-[0_24px_80px_-55px_rgba(8,47,73,0.45)] md:p-8" style={{ backgroundColor: surfaceAltColor }}>
                <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <div>
                    <h1 className="text-4xl font-semibold leading-tight" style={{ color: textOnSurface }}>
                      {heroSection?.title || contactPage.title}
                    </h1>
                    <p className="mt-4 text-sm leading-7" style={{ color: mutedOnSurface }}>
                      {heroSection?.subtitle || heroSection?.description}
                    </p>
                  </div>
                  {heroMedia ? (
                    <div className="relative min-h-72 overflow-hidden rounded-[1.75rem]" style={{ backgroundColor: surfaceColor }}>
                      {heroMedia}
                    </div>
                  ) : activeContactInfo.length > 0 ? (
                    <div className="grid gap-3 rounded-[1.75rem] p-5" style={{ backgroundColor: surfaceColor }}>
                      {activeContactInfo.map((item) => (
                        <a
                          key={item.id}
                          href={item.type === 'email' ? `mailto:${item.value}` : item.type === 'phone' ? `tel:${item.value}` : item.value}
                          className="rounded-[1rem] px-4 py-3 text-sm font-medium transition hover:-translate-y-0.5"
                          style={{ backgroundColor: surfaceAltColor, color: textOnSurface }}
                        >
                          {item.label || item.type}: {item.value}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            );
            break;
          case 'minimal':
            sectionContent = (
              <HeroMinimal key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'centered':
            sectionContent = (
              <HeroCentered key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'gradient':
            sectionContent = (
              <HeroGradient key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} textOnPrimary={textOnPrimary} />
            );
            break;
          case 'split':
            sectionContent = (
              <HeroSplit key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'concierge':
            sectionContent = (
              <HeroConcierge key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'glassmorphic':
            sectionContent = (
              <HeroGlassmorphicContact key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} />
            );
            break;
          case 'boarding-pass':
            sectionContent = (
              <HeroBoardingPassContact key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} />
            );
            break;
          case 'default':
          default:
            sectionContent = (
              <HeroDefault key="hero" hero={heroSection} contactPageTitle={contactPage.title} primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} />
            );
            break;
        }
        break;

      case 'contact_form':
        switch (variant) {
          case 'island-premium':
            sectionContent = (
              <section className="rounded-[2rem] p-5 shadow-[0_24px_80px_-55px_rgba(8,47,73,0.45)] md:p-8" style={{ backgroundColor: surfaceColor }}>
                <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
                  {activeContactInfo.length > 0 ? (
                    <div className="space-y-3">
                      {activeContactInfo.map((item) => (
                        <a
                          key={item.id}
                          href={item.type === 'email' ? `mailto:${item.value}` : item.type === 'phone' ? `tel:${item.value}` : item.value}
                          className="block rounded-[1.25rem] p-4 text-sm transition hover:-translate-y-0.5"
                          style={{ backgroundColor: surfaceAltColor, color: textOnSurface }}
                        >
                          <span className="block text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: primaryColor }}>{item.label || item.type}</span>
                          <span className="mt-1 block">{item.value}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                  <ContactFormDefault key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
                </div>
              </section>
            );
            break;
          case 'side-by-side':
            sectionContent = (
              <ContactFormSideBySide key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} surfaceAltColor={surfaceAltColor} textOnSurfaceAlt={textOnSurfaceAlt} />
            );
            break;
          case 'minimal':
            sectionContent = (
              <ContactFormMinimal key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'floating':
            sectionContent = (
              <ContactFormFloating key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'premium':
            sectionContent = (
              <ContactFormPremium key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} textOnPrimary={textOnPrimary} />
            );
            break;
          case 'glassmorphic':
            sectionContent = (
              <ContactFormGlassmorphic key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'boarding-pass':
            sectionContent = (
              <ContactFormBoardingPass key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
          case 'default':
          default:
            sectionContent = (
              <ContactFormDefault key="contact_form" primaryColor={primaryColor} textColor={textOnSurface} mutedColor={mutedOnSurface} surfaceColor={surfaceColor} />
            );
            break;
        }
        break;

      default:
        sectionContent = null;
        break;
    }

    if (!sectionContent) return null;

    const contactSectionId = `contact_${section_key}`;
    const animationStyle = sectionAnimations[contactSectionId];
    const animationClass = animationStyle && animationStyle !== "none" ? `anim-section-${contactSectionId}` : "";
    const isFocused = activeSectionId === contactSectionId;

    return (
      <AnimatedSection 
        key={section_key} 
        id={`section-${contactSectionId}`}
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
      className="wl-brand-radius-scope mx-auto w-full max-w-[1400px] space-y-8 px-4 py-8 md:px-6 md:py-12"
      style={brandRadiusScopeStyle(resolvedBranding)}
    >
      <style dangerouslySetInnerHTML={{ __html: fullAnimationCSS }} />
      {enabledSections.map((sectionConfig) => renderSection(sectionConfig))}
    </div>
  );
}
