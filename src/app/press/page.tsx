import { PressPageContent } from '@/components/press/PressPageContent';
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { getPress, getPressPage, getPressSections } from '@/services/content/press.service';
import { getBrandingConfig } from '@/services/ui/branding.service';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('press');

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

export default async function PressPage() {
  const [theme, branding, pressPage, pressSections, press] = await Promise.all([
    getThemeSettings(),
    getBrandingConfig(),
    getPressPage(),
    getPressSections(),
    getPress(),
  ]);

  return (
    <PressPageContent
      themeSettings={theme ?? null}
      press={press}
      branding={branding ?? null}
      pressPage={pressPage}
      sections={pressSections}
    />
  );
}
