import PressList from '@/components/press/PressList';
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { getPress } from '@/services/content/press.service';

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
  const theme = await getThemeSettings();
  const press = await getPress();
  return <PressList themeSettings={theme} press={press} />;
}
