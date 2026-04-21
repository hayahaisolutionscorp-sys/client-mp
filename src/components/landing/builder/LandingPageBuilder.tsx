'use client';

import { useState, useEffect, type CSSProperties } from "react";
import Hero from "@/components/landing/Hero";
import Footer from "@/components/Footer";
import SubscribeBanner from "@/components/landing/SubscribeBanner";
import Promos from "@/components/landing/Promos";
import PopularRoutes from "@/components/landing/PopularRoutes";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import GetToKnowUs from "@/components/landing/GetToKnowUs";
import OurPartners from "@/components/landing/OurPartners";
import BuilderLandingHeader from "./BuilderLandingHeader";
import HeroSplit from "./templates/hero/HeroSplit";
import HeroMinimal from "./templates/hero/HeroMinimal";
import HeroCards from "./templates/hero/HeroCards";
import HeroProfessional from "./templates/hero/HeroProfessional";
import HeroGlassmorphic from "./templates/hero/HeroGlassmorphic";
import HeroBoardingPass from "./templates/hero/HeroBoardingPass";
import RoutesCarousel from "./templates/routes/RoutesCarousel";
import RoutesModernGrid from "./templates/routes/RoutesModernGrid";
import RoutesMinimalList from "./templates/routes/RoutesMinimalList";
import RoutesGlassmorphic from "./templates/routes/RoutesGlassmorphic";
import BookingOverlay from "./templates/booking/BookingOverlay";
import BookingBanner from "./templates/booking/BookingBanner";
import BookingCard from "./templates/booking/BookingCard";
import BookingPremiumDark from "./templates/booking/BookingPremiumDark";
import BookingProfessional from "./templates/booking/BookingProfessional";
import BookingHorizontal from "./templates/booking/BookingHorizontal";
import BookingGlassmorphic from "./templates/booking/BookingGlassmorphic";
import BookingGlassmorphicOverlay from "./templates/booking/BookingGlassmorphicOverlay";
import BookingBoardingPass from "./templates/booking/BookingBoardingPass";
import PromotionsBoardingPass from "./templates/promotions/PromotionsBoardingPass";
import RoutesBoardingPass from "./templates/routes/RoutesBoardingPass";
import WhyChooseBoardingPass from "./templates/why-choose/WhyChooseBoardingPass";
import GetToKnowBoardingPass from "./templates/get-to-know/GetToKnowBoardingPass";
import PartnersBoardingPass from "./templates/partners/PartnersBoardingPass";
import FooterBoardingPass from "./templates/footer/FooterBoardingPass";
import HeroConcierge from "./templates/hero/HeroConcierge";
import WhyChooseConcierge from "./templates/why-choose/WhyChooseConcierge";
import RoutesEditorialGrid from "./templates/routes/RoutesEditorialGrid";
import PromotionsConcierge from "./templates/promotions/PromotionsConcierge";
import PromotionsGrid from "./templates/promotions/PromotionsGrid";
import PromotionsBanner from "./templates/promotions/PromotionsBanner";
import PromotionsGlassmorphic from "./templates/promotions/PromotionsGlassmorphic";
import WhyChooseSteps from "./templates/why-choose/WhyChooseSteps";
import WhyChooseGrid from "./templates/why-choose/WhyChooseGrid";
import WhyChooseMinimal from "./templates/why-choose/WhyChooseMinimal";
import WhyChooseDefault from "./templates/why-choose/WhyChooseDefault";
import WhyChooseGlassmorphic from "./templates/why-choose/WhyChooseGlassmorphic";
import GetToKnowTimeline from "./templates/get-to-know/GetToKnowTimeline";
import GetToKnowModern from "./templates/get-to-know/GetToKnowModern";
import GetToKnowCenter from "./templates/get-to-know/GetToKnowCenter";
import GetToKnowDefault from "./templates/get-to-know/GetToKnowDefault";
import GetToKnowGlassmorphic from "./templates/get-to-know/GetToKnowGlassmorphic";
import PartnersStrip from "./templates/partners/PartnersStrip";
import PartnersMarquee from "./templates/partners/PartnersMarquee";
import PartnersGridPremium from "./templates/partners/PartnersGridPremium";
import PartnersDefault from "./templates/partners/PartnersDefault";
import PartnersGlassmorphic from "./templates/partners/PartnersGlassmorphic";
import FooterCentered from "./templates/footer/FooterCentered";
import FooterPremium from "./templates/footer/FooterPremium";
import FooterProfessional from "./templates/footer/FooterProfessional";
import FooterGlassmorphic from "./templates/footer/FooterGlassmorphic";
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false });
import { createBuilderTheme } from "./theme";
import { AnimatedSection } from "@/components/whitelabel/AnimatedSection";
import type { LandingBuilderContent } from "@/lib/landing-builder";
import {
  getLandingBuilderLayoutState,
  normalizeLandingBuilderContent,
} from "@/lib/landing-builder";
import {
  brandRadiusScopeStyle,
  resolveBrandCornerRadiusClass,
} from "@/lib/branding/brand-radius";
import { formatCssFontStack } from "@/lib/theme-document";
import type { LandingPreviewPayload } from "@/lib/preview/landing-preview";
import type { LandingPageData } from "@/services/content/landing-page.service";
import type { IBrandingConfig } from "@/models";

interface LandingPageBuilderProps {
  config: LandingBuilderContent;
  previewPayload?: LandingPreviewPayload | null;
  landingData?: LandingPageData | null;
}

export default function LandingPageBuilder({
  config,
  previewPayload,
  landingData,
}: LandingPageBuilderProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'scroll-to-section') {
        const sectionId = event.data?.sectionId;
        const element = document.getElementById(`section-${sectionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Optional: briefly highlight or pulse the section
          setActiveSectionId(sectionId);
          setTimeout(() => setActiveSectionId(null), 2000);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  const builder = normalizeLandingBuilderContent(config);
  const layout = getLandingBuilderLayoutState(builder);
  const templatePreset = layout.templatePreset;

  // When the glassmorphic preset is active, the booking card (variant
  // "glassmorphic-overlay") is rendered as a floating overlay inside the
  // HeroGlassmorphic section rather than as its own standalone section below.
  const heroBuilderSection = layout.contentSections.find((s) => s.section_key === "hero");
  const bookingBuilderSection = layout.bookingSection;
  const renderBookingInsideGlassmorphicHero =
    heroBuilderSection?.variant === "glassmorphic" &&
    bookingBuilderSection?.enabled !== false &&
    bookingBuilderSection?.variant === "glassmorphic-overlay";

  // Boarding-pass preset: the hero is itself a ticket stub and the booking
  // form is rendered INSIDE the hero ticket (no separate section below).
  const renderBookingInsideBoardingPassHero =
    heroBuilderSection?.variant === "boarding-pass" &&
    bookingBuilderSection?.enabled !== false &&
    bookingBuilderSection?.variant === "boarding-pass";

  const sections = previewPayload?.sections ?? [];
  const heroSection = sections.find((section) => section.type === "hero") ?? landingData?.heroSection ?? null;
  const whyChooseSection =
    sections.find((section) => section.type === "why_choose") ?? landingData?.whyChooseSection ?? null;
  const getToKnowMain =
    sections.find((section) => section.type === "get_to_know") ?? landingData?.getToKnowMain ?? null;
  const getToKnowMission =
    sections.find((section) => section.type === "get_to_know_mission") ?? landingData?.getToKnowMission ?? null;
  const getToKnowVision =
    sections.find((section) => section.type === "get_to_know_vision") ?? landingData?.getToKnowVision ?? null;
  const promotions = previewPayload?.promotions ?? landingData?.promotions ?? null;
  const routes = previewPayload?.routes ?? landingData?.routes ?? null;
  const whyChooseReasons = previewPayload?.whyChooseCards ?? landingData?.whyChooseReasons ?? null;
  const partners = previewPayload?.partners ?? landingData?.partners ?? null;
  const baseBranding = landingData?.brandingConfig;
  const previewBranding = previewPayload?.config;
  const effectiveBranding = previewBranding
    ? ({
        ...(baseBranding ?? {}),
        ...previewBranding,
        colors: {
          ...(baseBranding?.colors ?? {}),
          ...(previewBranding.colors ?? {}),
        },
        logo: {
          ...(baseBranding?.logo ?? {}),
          ...(previewBranding.logo ?? {}),
        },
        font_family:
          previewBranding.font_family ||
          previewBranding.fontFamily ||
          baseBranding?.font_family ||
          baseBranding?.fontFamily ||
          "Jost",
        font_family_title:
          previewBranding.font_family_title ||
          previewBranding.fontFamilyTitle ||
          baseBranding?.font_family_title ||
          baseBranding?.fontFamilyTitle ||
          previewBranding.font_family ||
          previewBranding.fontFamily ||
          baseBranding?.font_family ||
          baseBranding?.fontFamily ||
          "Jost",
      } as IBrandingConfig)
    : ((baseBranding ?? {}) as IBrandingConfig);
  const landingBranding = effectiveBranding;
  const builderTheme = createBuilderTheme(landingBranding);
  const theme = {
    ...builderTheme,
    fontStyle: builderTheme.fontFamily,
    fontTitle: builderTheme.fontFamilyTitle,
  };
  const cornerRadiusClass = resolveBrandCornerRadiusClass(
    landingBranding,
    templatePreset?.tokens.radiusClass ?? "rounded-2xl"
  );

  // Whitelabel general typography (theme) must win over template-preset token defaults;
  // otherwise the landing layout preset always pins fonts (e.g. default → Jost) and
  // body/title picks in the editor appear to do nothing.
  const bodyFontStack = formatCssFontStack(
    theme.fontFamily,
    templatePreset?.tokens.fontFamily
  );
  const titleFontStack = formatCssFontStack(
    theme.fontFamilyTitle,
    templatePreset?.tokens.fontFamilyTitle || templatePreset?.tokens.fontFamily
  );

  const sectionAnimationsRaw = landingBranding?.colors?.sectionAnimations;
  let sectionAnimations: Record<string, string> = {};
  
  if (sectionAnimationsRaw) {
    if (typeof sectionAnimationsRaw === 'string') {
      try {
        sectionAnimations = JSON.parse(sectionAnimationsRaw);
      } catch (e) {
        console.error("Error parsing sectionAnimations:", e);
      }
    } else if (typeof sectionAnimationsRaw === 'object') {
      sectionAnimations = sectionAnimationsRaw as Record<string, string>;
    }
  }

  const getAnimationCSSForSection = (sectionId: string, animation: string) => {
    if (!animation || animation === "none") return "";
    
    // Use a unique class for each section's animation
    const scope = `.anim-section-${sectionId}`;
    
    switch (animation) {
      case "smooth-up":
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3, ${scope}:not(.in-view) .brand-title {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3, ${scope}.in-view .brand-title {
            opacity: 0;
            animation: textSmoothUp-${sectionId} 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: 0.2s;
          }
          @keyframes textSmoothUp-${sectionId} {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `;
      case "staggered":
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3, ${scope}:not(.in-view) .brand-title {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3, ${scope}.in-view .brand-title {
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
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3, ${scope}:not(.in-view) .brand-title {
            clip-path: inset(0 100% 0 0);
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3, ${scope}.in-view .brand-title {
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
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3, ${scope}.in-view .brand-title {
            animation: textFloat-${sectionId} 3s ease-in-out infinite;
          }
          @keyframes textFloat-${sectionId} {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `;
      case "zoom-in":
        return `
          ${scope}:not(.in-view) h1, ${scope}:not(.in-view) h2, ${scope}:not(.in-view) h3, ${scope}:not(.in-view) .brand-title {
            opacity: 0;
            animation: none;
          }
          ${scope}.in-view h1, ${scope}.in-view h2, ${scope}.in-view h3, ${scope}.in-view .brand-title {
            opacity: 0;
            animation: textZoom-${sectionId} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes textZoom-${sectionId} {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
        `;
      default:
        return "";
    }
  };

  const fullAnimationCSS = Object.entries(sectionAnimations)
    .map(([id, anim]) => getAnimationCSSForSection(id, anim))
    .join("\n");

  return (
    <>
    <div
      className="wl-brand-radius-scope"
      style={brandRadiusScopeStyle(landingBranding, templatePreset?.tokens.radiusClass ?? "rounded-2xl")}
    >
    <div
      className={templatePreset ? `${templatePreset.tokens.surfaceClass} ${cornerRadiusClass}` : cornerRadiusClass}
      style={{ 
        fontFamily: bodyFontStack,
        background: theme.surface,
        '--font-title': titleFontStack,
        '--font-body': bodyFontStack,
      } as CSSProperties}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .brand-title {
          font-family: var(--font-title), var(--font-body) !important;
        }
        ${fullAnimationCSS}
      ` }} />

      {layout.contentSections.map((section) => {
        let content = null;
        switch (section.section_key) {
          case "header":
            if (section.variant !== "default") {
              content = (
                <BuilderLandingHeader 
                  variant={section.variant} 
                  theme={theme} 
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                />
              );
            }
            break;
          case "hero":
            if (section.variant === "minimal") {
              content = (
                <HeroMinimal
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  showBookingSearch={layout.showBookingInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                />
              );
            } else if (section.variant === "cards") {
              content = (
                <HeroCards
                  variant={section.variant}
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  showBookingSearch={layout.showBookingInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                />
              );
            } else if (section.variant === "professional-editorial") {
              content = (
                <HeroProfessional
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                />
              );
            } else if (section.variant === "split") {
              content = (
                <HeroSplit
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  showBookingSearch={layout.showBookingInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                />
              );
            } else if (section.variant === "concierge") {
              content = (
                <HeroConcierge
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  showBookingSearch={layout.showBookingInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                />
              );
            } else if (section.variant === "glassmorphic") {
              content = (
                <HeroGlassmorphic
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  showBookingSearch={layout.showBookingInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                  bookingSlot={
                    renderBookingInsideGlassmorphicHero ? (
                      <BookingGlassmorphicOverlay
                        theme={theme}
                        ports={landingData?.ports ?? []}
                        routes={landingData?.bookingRoutes ?? []}
                        floatingInHero
                      />
                    ) : null
                  }
                />
              );
            } else if (section.variant === "boarding-pass") {
              content = (
                <HeroBoardingPass
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  showBookingSearch={layout.showBookingInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                  bookingSlot={
                    renderBookingInsideBoardingPassHero ? (
                      <BookingBoardingPass
                        theme={theme}
                        ports={landingData?.ports ?? []}
                        routes={landingData?.bookingRoutes ?? []}
                        floatingInHero
                      />
                    ) : null
                  }
                />
              );
            } else {
              content = (
                <Hero
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  showBookingSearch={layout.showBookingInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                />
              );
            }
            break;
          case "booking":
            if (renderBookingInsideGlassmorphicHero || renderBookingInsideBoardingPassHero) {
              // Booking card is rendered inside the hero (glassmorphic / boarding-pass).
              content = null;
              break;
            }
            if (section.variant === "banner") {
              content = <BookingBanner theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "card") {
              content = <BookingCard theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "overlay") {
              content = <BookingOverlay theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "compact-dark") {
              content = <BookingPremiumDark theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "professional-card") {
              content = <BookingProfessional theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "modern-horizontal") {
              content = <BookingHorizontal theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "glassmorphic") {
              content = <BookingGlassmorphic theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "glassmorphic-overlay") {
              content = <BookingGlassmorphicOverlay theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            } else if (section.variant === "boarding-pass") {
              content = <BookingBoardingPass theme={theme} ports={landingData?.ports ?? []} routes={landingData?.bookingRoutes ?? []} />;
            }
            break;
          case "promotions":
            if (section.variant === "grid" || section.variant === "professional-banner") {
              content = <PromotionsGrid promos={(promotions as any) ?? []} theme={theme} />;
            } else if (section.variant === "concierge-mosaic") {
              content = <PromotionsConcierge promos={(promotions as any) ?? []} theme={theme} />;
            } else if (section.variant === "banner") {
              content = <PromotionsBanner promos={(promotions as any) ?? []} theme={theme} />;
            } else if (section.variant === "glassmorphic") {
              content = <PromotionsGlassmorphic promos={(promotions as any) ?? []} theme={theme} />;
            } else if (section.variant === "boarding-pass") {
              content = <PromotionsBoardingPass promos={(promotions as any) ?? []} theme={theme} />;
            } else {
              content = <Promos promosOverride={promotions as any} />;
            }
            break;
          case "routes":
            if (section.variant === "carousel") {
              content = <RoutesCarousel routes={(routes as any) ?? []} theme={theme} />;
            } else if (section.variant === "cards" || section.variant === "professional-wall") {
              content = <RoutesModernGrid routes={(routes as any) ?? []} theme={theme} />;
            } else if (section.variant === "list") {
              content = <RoutesMinimalList routes={(routes as any) ?? []} theme={theme} />;
            } else if (section.variant === "editorial-grid" || section.variant === "concierge") {
              content = <RoutesEditorialGrid routes={(routes as any) ?? []} theme={theme} />;
            } else if (section.variant === "glassmorphic") {
              content = <RoutesGlassmorphic routes={(routes as any) ?? []} theme={theme} />;
            } else if (section.variant === "boarding-pass") {
              content = <RoutesBoardingPass routes={(routes as any) ?? []} theme={theme} />;
            } else {
              content = <PopularRoutes routesOverride={routes as any} />;
            }
            break;
          case "why_choose":
            if (section.variant === "steps" || section.variant === "professional-stack") {
              content = <WhyChooseSteps section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            } else if (section.variant === "grid") {
              content = <WhyChooseGrid section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            } else if (section.variant === "minimal") {
              content = <WhyChooseMinimal section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            } else if (section.variant === "concierge") {
              content = <WhyChooseConcierge section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            } else if (section.variant === "glassmorphic") {
              content = <WhyChooseGlassmorphic section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            } else if (section.variant === "boarding-pass") {
              content = <WhyChooseBoardingPass section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            } else {
              content = <WhyChooseDefault section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            }
            break;
          case "get_to_know":
            if (section.variant === "timeline" && getToKnowMain && getToKnowMission && getToKnowVision) {
              content = <GetToKnowTimeline main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            } else if ((section.variant === "modern" || section.variant === "professional-panel") && getToKnowMain && getToKnowMission && getToKnowVision) {
              content = <GetToKnowModern main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            } else if (section.variant === "center" && getToKnowMain && getToKnowMission && getToKnowVision) {
              content = <GetToKnowCenter main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            } else if (section.variant === "glassmorphic" && getToKnowMain && getToKnowMission && getToKnowVision) {
              content = <GetToKnowGlassmorphic main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            } else if (section.variant === "boarding-pass" && getToKnowMain) {
              content = <GetToKnowBoardingPass main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            } else {
              content = <GetToKnowDefault main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            }
            break;
          case "partners":
            if (section.variant === "strip" || section.variant === "professional-rail") {
              content = <PartnersStrip partners={(partners as any) ?? []} theme={theme} />;
            } else if (section.variant === "marquee") {
              content = <PartnersMarquee partners={(partners as any) ?? []} theme={theme} />;
            } else if (section.variant === "grid-premium") {
              content = <PartnersGridPremium partners={(partners as any) ?? []} theme={theme} />;
            } else if (section.variant === "glassmorphic") {
              content = <PartnersGlassmorphic partners={(partners as any) ?? []} theme={theme} />;
            } else if (section.variant === "boarding-pass") {
              content = <PartnersBoardingPass partners={(partners as any) ?? []} theme={theme} />;
            } else {
              content = <PartnersDefault partners={(partners as any) ?? []} theme={theme} />;
            }
            break;
        }
        if (!content) return null;

        const animationStyle = sectionAnimations[section.section_key];
        const animationClass = animationStyle && animationStyle !== "none" ? `anim-section-${section.section_key}` : "";
        const isFocused = activeSectionId === section.section_key;

        return (
          <AnimatedSection 
            key={section.id} 
            id={`section-${section.section_key}`} 
            className={cn(
               animationClass,
               isFocused && "ring-4 ring-primary ring-offset-4 ring-opacity-50 transition-all duration-500 rounded-lg relative z-50"
            )}
          >
            {content}
          </AnimatedSection>
        );
      })}
    </div>

    {/* Footer Area: Footer variants include their own SubscribeBanner internally */}
    <div id="section-footer" className="w-full">
    {layout.footerSection ? (
        <>
          {layout.footerSection.variant === "centered" && <FooterCentered key={layout.footerSection.id} theme={theme} />}
          {layout.footerSection.variant === "premium" && <FooterPremium key={layout.footerSection.id} theme={theme} />}
          {layout.footerSection.variant === "professional-anchored" && <FooterProfessional key={layout.footerSection.id} theme={theme} />}
          {layout.footerSection.variant === "glassmorphic" && <FooterGlassmorphic key={layout.footerSection.id} theme={theme} />}
          {layout.footerSection.variant === "boarding-pass" && <FooterBoardingPass key={layout.footerSection.id} theme={theme} />}
          {layout.footerSection.variant === "default" && <Footer key={layout.footerSection.id} />}
          {layout.footerSection.variant === "default-no-banner" && <Footer key={layout.footerSection.id} showSubscribeBanner={false} />}
        </>
      ) : (
        <Footer />
      )}
    </div>
    <ChatWidget 
      tenantId={parseInt(process.env.NEXT_PUBLIC_TENANT_ID || "1", 10)} 
      builderConfigOverride={builder}
    />
    </div>
    </>
  );
}
