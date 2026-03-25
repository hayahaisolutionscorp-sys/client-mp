import Hero from "@/components/landing/Hero";
import Promos from "@/components/landing/Promos";
import PopularRoutes from "@/components/landing/PopularRoutes";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import GetToKnowUs from "@/components/landing/GetToKnowUs";
import OurPartners from "@/components/landing/OurPartners";
import BuilderLandingHeader from "./BuilderLandingHeader";
import type { LandingBuilderContent } from "@/lib/landing-builder";
import { normalizeLandingBuilderContent } from "@/lib/landing-builder";
import type { LandingPreviewPayload } from "@/lib/preview/landing-preview";

interface LandingPageBuilderProps {
  config: LandingBuilderContent;
  previewPayload?: LandingPreviewPayload | null;
}

export default async function LandingPageBuilder({ config, previewPayload }: LandingPageBuilderProps) {
  const builder = normalizeLandingBuilderContent(config);
  const headerConfig = builder.sections.find((section) => section.section_key === "header");
  const bookingConfig = builder.sections.find((section) => section.section_key === "booking");
  const visibleSections = builder.sections
    .filter((section) => section.enabled)
    .sort((left, right) => left.display_order - right.display_order);
  const hasHeroSection = visibleSections.some((section) => section.section_key === "hero");
  const shouldShowDefaultHeaderInHero = headerConfig?.enabled !== false && headerConfig?.variant === "default";
  const shouldShowBookingInHero = bookingConfig?.enabled === true;

  const sections = previewPayload?.sections ?? [];
  const heroSection = sections.find((section) => section.type === "hero") ?? null;
  const whyChooseSection = sections.find((section) => section.type === "why_choose") ?? null;
  const getToKnowMain = sections.find((section) => section.type === "get_to_know") ?? null;
  const getToKnowMission = sections.find((section) => section.type === "get_to_know_mission") ?? null;
  const getToKnowVision = sections.find((section) => section.type === "get_to_know_vision") ?? null;

  return (
    <div className="bg-[#EEF8FC]">
      {visibleSections.map((section) => {
        switch (section.section_key) {
          case "header":
            // The real default homepage navbar is rendered inside Hero.
            // Avoid rendering a second standalone header unless a future non-default
            // header variant is intentionally introduced without Hero.
            if (section.variant === "default" || hasHeroSection) {
              return null;
            }

            return <BuilderLandingHeader key={section.id} variant={section.variant} />;
          case "hero":
            return (
              <Hero
                key={section.id}
                heroSectionOverride={heroSection}
                forceHomeNavbar={Boolean(previewPayload)}
                showNavbar={shouldShowDefaultHeaderInHero}
                showBookingSearch={shouldShowBookingInHero}
              />
            );
          case "booking":
            return null;
          case "promotions":
            return <Promos key={section.id} promosOverride={previewPayload?.promotions ?? null} />;
          case "routes":
            return <PopularRoutes key={section.id} routesOverride={previewPayload?.routes ?? null} />;
          case "why_choose":
            return (
              <WhyChooseUs
                key={section.id}
                reasonsOverride={previewPayload?.whyChooseCards as any}
                sectionOverride={whyChooseSection as any}
                getToKnowMainOverride={getToKnowMain as any}
                getToKnowMissionOverride={getToKnowMission as any}
                getToKnowVisionOverride={getToKnowVision as any}
                partnersOverride={previewPayload?.partners ?? null}
              />
            );
          case "get_to_know":
            return (
              <GetToKnowUs
                key={section.id}
                mainDataOverride={getToKnowMain as any}
                missionDataOverride={getToKnowMission as any}
                visionDataOverride={getToKnowVision as any}
              />
            );
          case "partners":
            return (
              <section key={section.id} id="Partner" className="bg-white px-6 py-10">
                <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
                  <h1 className="font-bold text-center text-customText text-2xl sm:text-3xl lg:text-4xl">
                    Our Partners
                  </h1>
                  <div className="mt-5">
                    <OurPartners partnersOverride={previewPayload?.partners ?? null} />
                  </div>
                </div>
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
