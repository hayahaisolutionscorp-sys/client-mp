import Hero from '@/components/landing/Hero';
import LandingPageBuilder from '@/components/landing/builder/LandingPageBuilder';
import Footer from '@/components/Footer';
import nextDynamic from 'next/dynamic';
import WebSiteSchema from '@/components/seo/WebSiteSchema';

const Promos = nextDynamic(() => import('@/components/landing/Promos'), { ssr: true });
const PopularRoutes = nextDynamic(() => import('@/components/landing/PopularRoutes'), { ssr: true });
const WhyChooseUs = nextDynamic(() => import('@/components/landing/WhyChooseUs'), { ssr: true });


import { getPageMetadata } from '@/services/content/seo.service';
import { getLandingBuilderContent } from '@/services/content/landing-builder.service';
import { getLandingPageData } from '@/services/content/landing-page.service';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

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
    return (
      <>
        <WebSiteSchema />
        <LandingPageBuilder config={builderConfig} landingData={landingData} />
      </>
    );
  }

  return (
    <>
      <WebSiteSchema />
      <div className="bg-[var(--surface-alt)]">
        <Hero
          heroSectionOverride={landingData.heroSection}
          headerSectionOverride={landingData.headerSection}
          portsOverride={landingData.ports}
          bookingRoutesOverride={landingData.bookingRoutes}
          tripSearchEnabledOverride={true}
        />

        <div className="bg-[var(--surface-alt)]">
          <Promos promosOverride={landingData.promotions as any} />
          <PopularRoutes routesOverride={landingData.routes as any} />
          <WhyChooseUs
            reasonsOverride={landingData.whyChooseReasons}
            sectionOverride={landingData.whyChooseSection}
            themeSettingsOverride={landingData.themeSettings}
            brandingConfigOverride={landingData.brandingConfig}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
