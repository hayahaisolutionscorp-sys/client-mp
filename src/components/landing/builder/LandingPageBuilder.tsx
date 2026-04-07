'use client';

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
import RoutesCarousel from "./templates/routes/RoutesCarousel";
import RoutesModernGrid from "./templates/routes/RoutesModernGrid";
import RoutesMinimalList from "./templates/routes/RoutesMinimalList";
import BookingOverlay from "./templates/booking/BookingOverlay";
import BookingBanner from "./templates/booking/BookingBanner";
import BookingCard from "./templates/booking/BookingCard";
import BookingPremiumDark from "./templates/booking/BookingPremiumDark";
import BookingProfessional from "./templates/booking/BookingProfessional";
import PromotionsGrid from "./templates/promotions/PromotionsGrid";
import PromotionsBanner from "./templates/promotions/PromotionsBanner";
import WhyChooseSteps from "./templates/why-choose/WhyChooseSteps";
import WhyChooseGrid from "./templates/why-choose/WhyChooseGrid";
import WhyChooseMinimal from "./templates/why-choose/WhyChooseMinimal";
import WhyChooseDefault from "./templates/why-choose/WhyChooseDefault";
import GetToKnowTimeline from "./templates/get-to-know/GetToKnowTimeline";
import GetToKnowModern from "./templates/get-to-know/GetToKnowModern";
import GetToKnowCenter from "./templates/get-to-know/GetToKnowCenter";
import GetToKnowDefault from "./templates/get-to-know/GetToKnowDefault";
import PartnersStrip from "./templates/partners/PartnersStrip";
import PartnersMarquee from "./templates/partners/PartnersMarquee";
import PartnersGridPremium from "./templates/partners/PartnersGridPremium";
import PartnersDefault from "./templates/partners/PartnersDefault";
import FooterCentered from "./templates/footer/FooterCentered";
import FooterPremium from "./templates/footer/FooterPremium";
import dynamic from 'next/dynamic';

const ChatWidget = dynamic(() => import('@/components/chat/ChatWidget'), { ssr: false });
import { createBuilderTheme } from "./theme";
import type { LandingBuilderContent } from "@/lib/landing-builder";
import {
  getLandingBuilderLayoutState,
  normalizeLandingBuilderContent,
} from "@/lib/landing-builder";
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
  const builder = normalizeLandingBuilderContent(config);
  const layout = getLandingBuilderLayoutState(builder);
  const templatePreset = layout.templatePreset;

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
  const theme = createBuilderTheme(landingBranding);
  const cornerRadiusClass =
    landingBranding?.colors?.cornerRadiusClass ||
    templatePreset?.tokens.radiusClass ||
    "rounded-2xl";

  return (
    <>
    <div
      className={templatePreset ? `${templatePreset.tokens.surfaceClass} ${cornerRadiusClass}` : cornerRadiusClass}
      style={{ 
        fontFamily: templatePreset?.tokens.fontFamily || theme.fontFamily,
        background: theme.surface,
        '--font-title': templatePreset?.tokens.fontFamilyTitle || theme.fontFamilyTitle,
        '--font-body': templatePreset?.tokens.fontFamily || theme.fontFamily
      } as any}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        h1, h2, h3, h4, h5, h6, .brand-title {
          font-family: var(--font-title), var(--font-body) !important;
        }
      ` }} />

      {layout.contentSections.map((section) => {
        switch (section.section_key) {
          case "header":
            // The real default homepage navbar is rendered inside Hero.
            // For non-default variants, always render the standalone header
            // even when the hero section is present.
            if (section.variant === "default") {
              return null;
            }

            return (
              <BuilderLandingHeader 
                key={section.id} 
                variant={section.variant} 
                theme={theme} 
                headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
              />
            );
          case "hero":
            if (section.variant === "minimal") {
              return (
                <HeroMinimal
                  key={section.id}
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
            if (section.variant === "cards") {
              return (
                <HeroCards
                  key={section.id}
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
            }
            if (section.variant === "professional-editorial") {
              return (
                <HeroProfessional
                  key={section.id}
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={layout.showNavbarInHero}
                  headerSectionOverride={previewPayload?.headerConfig ?? landingData?.headerSection}
                />
              );
            }
            if (section.variant === "split") {
              return (
                <HeroSplit
                  key={section.id}
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
            return (
              <Hero
                key={section.id}
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
          case "booking":
            if (section.variant === "banner") {
              return (
                <BookingBanner
                  key={section.id}
                  theme={theme}
                  ports={landingData?.ports ?? []}
                  routes={landingData?.bookingRoutes ?? []}
                />
              );
            }
            if (section.variant === "card") {
              return (
                <BookingCard
                  key={section.id}
                  theme={theme}
                  ports={landingData?.ports ?? []}
                  routes={landingData?.bookingRoutes ?? []}
                />
              );
            }
            if (section.variant === "overlay") {
              return (
                <BookingOverlay
                  key={section.id}
                  theme={theme}
                  ports={landingData?.ports ?? []}
                  routes={landingData?.bookingRoutes ?? []}
                />
              );
            }
            if (section.variant === "compact-dark") {
              return (
                <BookingPremiumDark
                  key={section.id}
                  theme={theme}
                  ports={landingData?.ports ?? []}
                  routes={landingData?.bookingRoutes ?? []}
                />
              );
            }
            if (section.variant === "professional-card") {
              return (
                <BookingProfessional
                  key={section.id}
                  theme={theme}
                  ports={landingData?.ports ?? []}
                  routes={landingData?.bookingRoutes ?? []}
                />
              );
            }
            // default booking search is rendered inside Hero
            return null;
          case "promotions":
            if (section.variant === "grid" || section.variant === "professional-banner") {
              return <PromotionsGrid key={section.id} promos={(promotions as any) ?? []} theme={theme} />;
            }
            if (section.variant === "banner") {
              return <PromotionsBanner key={section.id} promos={(promotions as any) ?? []} theme={theme} />;
            }
            return <Promos key={section.id} promosOverride={promotions as any} />;
          case "routes":
            if (section.variant === "carousel") {
              return <RoutesCarousel key={section.id} routes={(routes as any) ?? []} theme={theme} />;
            }
            if (section.variant === "cards" || section.variant === "professional-wall") {
              return <RoutesModernGrid key={section.id} routes={(routes as any) ?? []} theme={theme} />;
            }
            if (section.variant === "list") {
              return <RoutesMinimalList key={section.id} routes={(routes as any) ?? []} theme={theme} />;
            }
            return <PopularRoutes key={section.id} routesOverride={routes as any} />;
          case "why_choose":
            if (section.variant === "steps" || section.variant === "professional-stack") {
              return <WhyChooseSteps key={section.id} section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            }
            if (section.variant === "grid") {
              return <WhyChooseGrid key={section.id} section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            }
            if (section.variant === "minimal") {
              return <WhyChooseMinimal key={section.id} section={whyChooseSection as any} reasons={(whyChooseReasons as any) ?? []} theme={theme} />;
            }
            return (
              <WhyChooseDefault
                key={section.id}
                section={whyChooseSection as any}
                reasons={(whyChooseReasons as any) ?? []}
                theme={theme}
              />
            );
          case "get_to_know":
            if (section.variant === "timeline" && getToKnowMain && getToKnowMission && getToKnowVision) {
              return <GetToKnowTimeline key={section.id} main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            }
            if ((section.variant === "modern" || section.variant === "professional-panel") && getToKnowMain && getToKnowMission && getToKnowVision) {
                return <GetToKnowModern key={section.id} main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            }
            if (section.variant === "center" && getToKnowMain && getToKnowMission && getToKnowVision) {
                return <GetToKnowCenter key={section.id} main={getToKnowMain as any} mission={getToKnowMission as any} vision={getToKnowVision as any} theme={theme} />;
            }
            return (
              <GetToKnowDefault
                key={section.id}
                main={getToKnowMain as any}
                mission={getToKnowMission as any}
                vision={getToKnowVision as any}
                theme={theme}
              />
            );
          case "partners":
            if (section.variant === "strip" || section.variant === "professional-rail") {
              return <PartnersStrip key={section.id} partners={(partners as any) ?? []} theme={theme} />;
            }
            if (section.variant === "marquee") {
                return <PartnersMarquee key={section.id} partners={(partners as any) ?? []} theme={theme} />;
            }
            if (section.variant === "grid-premium") {
                return <PartnersGridPremium key={section.id} partners={(partners as any) ?? []} theme={theme} />;
            }
            return (
                <PartnersDefault key={section.id} partners={(partners as any) ?? []} theme={theme} />
            );
          default:
            return null;
        }
      })}
    </div>

    {/* Footer Area: Footer variants include their own SubscribeBanner internally */}
    <div id="Resources" className="w-full">
    {layout.footerSection ? (
        <>
          {layout.footerSection.variant === "centered" && <FooterCentered key={layout.footerSection.id} theme={theme} />}
          {layout.footerSection.variant === "premium" && <FooterPremium key={layout.footerSection.id} theme={theme} />}
          {layout.footerSection.variant === "professional-anchored" && <FooterPremium key={layout.footerSection.id} theme={theme} />}
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
    </>
  );
}
