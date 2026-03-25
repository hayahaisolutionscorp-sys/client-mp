import Hero from '@/components/landing/Hero';
import LandingPageBuilder from '@/components/landing/builder/LandingPageBuilder';
import Footer from '@/components/Footer';
import SubscribeBanner from '@/components/landing/SubscribeBanner';
import dynamic from 'next/dynamic';

const Promos = dynamic(() => import('@/components/landing/Promos'), { ssr: true });
const PopularRoutes = dynamic(() => import('@/components/landing/PopularRoutes'), { ssr: true });
const WhyChooseUs = dynamic(() => import('@/components/landing/WhyChooseUs'), { ssr: true });


import { getPageMetadata } from '@/services/content/seo.service';
import { getLandingBuilderContent } from '@/services/content/landing-builder.service';
import { getLandingPageData } from '@/services/content/landing-page.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('home');

  return {
    title: seo?.title,
    description: seo?.description,
    keywords: seo?.keywords,
    robots: seo?.robots,
    alternates: seo?.alternates,
    openGraph: seo?.openGraph ? {
      title: seo.openGraph.title || seo.title,
      description: seo.openGraph.description || seo.description,
      images: seo.openGraph.images,
      type: seo.openGraph.type,
      siteName: seo.openGraph.siteName,
      locale: seo.openGraph.locale,
      url: seo.openGraph.url,
    } : undefined,
    twitter: seo?.twitter,
  };
}

export default async function Home() {
  const [builderConfig, landingData] = await Promise.all([
    getLandingBuilderContent(),
    getLandingPageData(),
  ]);

  if (builderConfig) {
    return <LandingPageBuilder config={builderConfig} landingData={landingData} />;
  }

  return (
    <>
      <div className="bg-[#EEF8FC]">
        <Hero
          heroSectionOverride={landingData.heroSection}
          headerSectionOverride={landingData.headerSection}
          portsOverride={landingData.ports}
          bookingRoutesOverride={landingData.bookingRoutes}
          tripSearchEnabledOverride={true}
        />

        <div className="bg-[#EEF8FC]">
          <Promos promosOverride={landingData.promotions as any} />
          <PopularRoutes routesOverride={landingData.routes as any} />
          <WhyChooseUs
            reasonsOverride={landingData.whyChooseReasons}
            sectionOverride={landingData.whyChooseSection}
            getToKnowMainOverride={landingData.getToKnowMain}
            getToKnowMissionOverride={landingData.getToKnowMission}
            getToKnowVisionOverride={landingData.getToKnowVision}
            partnersOverride={landingData.partners as any}
            themeSettingsOverride={landingData.themeSettings}
            brandingConfigOverride={landingData.brandingConfig}
          />
        </div>
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
