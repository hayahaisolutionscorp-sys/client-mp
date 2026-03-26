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
import RoutesCarousel from "./templates/routes/RoutesCarousel";
import RoutesModernGrid from "./templates/routes/RoutesModernGrid";
import RoutesMinimalList from "./templates/routes/RoutesMinimalList";
import LandingBookingSection from "./LandingBookingSection";
import BookingOverlay from "./templates/booking/BookingOverlay";
import BookingPremiumDark from "./templates/booking/BookingPremiumDark";
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
import { createBuilderTheme } from "./theme";
import type { LandingBuilderContent } from "@/lib/landing-builder";
import { normalizeLandingBuilderContent } from "@/lib/landing-builder";
import type { LandingPreviewPayload } from "@/lib/preview/landing-preview";
import type { LandingPageData } from "@/services/content/landing-page.service";

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
  const headerConfig = builder.sections.find((section) => section.section_key === "header");
  const bookingConfig = builder.sections.find((section) => section.section_key === "booking");
  const visibleSections = builder.sections
    .filter((section) => section.enabled)
    .sort((left, right) => left.display_order - right.display_order);
  const hasHeroSection = visibleSections.some((section) => section.section_key === "hero");
  const shouldShowDefaultHeaderInHero = headerConfig?.enabled !== false && (headerConfig?.variant === "default" || !headerConfig?.variant);
  const shouldShowBookingInHero = bookingConfig?.enabled !== false && (bookingConfig?.variant === "default" || !bookingConfig?.variant);

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
  const theme = createBuilderTheme((landingData?.brandingConfig ?? {}) as any);

  return (
    <>
    <div className="bg-[#EEF8FC]">
      {visibleSections.map((section) => {
        switch (section.section_key) {
          case "header":
            // The real default homepage navbar is rendered inside Hero.
            // For non-default variants, always render the standalone header
            // even when the hero section is present.
            if (section.variant === "default") {
              return null;
            }

            return <BuilderLandingHeader key={section.id} variant={section.variant} />;
          case "hero":
            if (section.variant === "minimal") {
              return (
                <HeroMinimal
                  key={section.id}
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={shouldShowDefaultHeaderInHero}
                  showBookingSearch={shouldShowBookingInHero}
                  headerSectionOverride={landingData?.headerSection}
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
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={shouldShowDefaultHeaderInHero}
                  showBookingSearch={shouldShowBookingInHero}
                  headerSectionOverride={landingData?.headerSection}
                  portsOverride={landingData?.ports ?? null}
                  bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                  tripSearchEnabledOverride={true}
                />
              );
            }
            if (section.variant === "split") {
              return (
                <HeroSplit
                  key={section.id}
                  heroSectionOverride={heroSection}
                  forceHomeNavbar={Boolean(previewPayload)}
                  showNavbar={shouldShowDefaultHeaderInHero}
                  showBookingSearch={shouldShowBookingInHero}
                  headerSectionOverride={landingData?.headerSection}
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
                showNavbar={shouldShowDefaultHeaderInHero}
                showBookingSearch={shouldShowBookingInHero}
                headerSectionOverride={landingData?.headerSection}
                portsOverride={landingData?.ports ?? null}
                bookingRoutesOverride={landingData?.bookingRoutes ?? null}
                tripSearchEnabledOverride={true}
              />
            );
          case "booking":
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
            // default booking search is rendered inside Hero
            return null;
          case "promotions":
            if (section.variant === "grid") {
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
            if (section.variant === "cards") {
              return <RoutesModernGrid key={section.id} routes={(routes as any) ?? []} theme={theme} />;
            }
            if (section.variant === "list") {
              return <RoutesMinimalList key={section.id} routes={(routes as any) ?? []} theme={theme} />;
            }
            return <PopularRoutes key={section.id} routesOverride={routes as any} />;
          case "why_choose":
            if (section.variant === "steps") {
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
            if (section.variant === "modern" && getToKnowMain && getToKnowMission && getToKnowVision) {
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
            if (section.variant === "strip") {
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
    <div id="Resources" className="w-full lg:pt-56">
      <div className="flex items-center justify-center w-full">
        <SubscribeBanner />
      </div>
      <Footer />
    </div>
    </>
  );
}
