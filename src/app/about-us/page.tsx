import { Metadata } from 'next';

import AboutPageBuilder from '@/components/about-us/builder/AboutPageBuilder';
import { AboutPageContent } from '@/components/about-us/AboutPageContent';
import { getAboutPage, getAboutUsSection, getCoreValues } from '@/services/content/about-us.service';
import { getPageMetadata } from '@/services/content/seo.service';
import { getBrandingConfig } from '@/services/ui/branding.service';
import { getThemeSettings } from '@/services/ui/theme-settings.service';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('about-us');

  return {
    title: seo?.title,
    description: seo?.description,
    keywords: seo?.keywords,
    robots: seo?.robots,
    alternates: seo?.alternates,
    openGraph: seo?.openGraph
      ? {
          title: seo.openGraph.title || seo.title,
          description: seo.openGraph.description || seo.description,
          images: seo.openGraph.images,
          type: seo.openGraph.type,
          siteName: seo.openGraph.siteName,
          locale: seo.openGraph.locale,
          url: seo.openGraph.url,
        }
      : undefined,
    twitter: seo?.twitter,
  };
}

export default async function AboutPage() {
  const [aboutPage, hero, welcome, story, expertise, coreValues, themeSettings, branding] =
    await Promise.all([
      getAboutPage(),
      getAboutUsSection('hero'),
      getAboutUsSection('welcome'),
      getAboutUsSection('our_story'),
      getAboutUsSection('our_expertise'),
      getCoreValues(),
      getThemeSettings(),
      getBrandingConfig(),
    ]);

  const sections = [hero, welcome, story, expertise].filter(
    (section): section is NonNullable<typeof section> => Boolean(section)
  );

  // If there's builder configuration, use the new builder
  if (aboutPage?.content && typeof aboutPage.content === 'object' && 'sections' in aboutPage.content) {
    return (
      <AboutPageBuilder
        aboutPage={aboutPage}
        sections={sections}
        coreValues={coreValues}
        themeSettings={themeSettings ?? null}
        branding={branding ?? null}
      />
    );
  }

  // Fallback to old rendering
  return (
    <AboutPageContent
      aboutPage={aboutPage}
      sections={sections}
      coreValues={coreValues}
      themeSettings={themeSettings ?? null}
      branding={branding ?? null}
    />
  );
}
