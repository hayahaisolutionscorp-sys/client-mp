import dynamic from 'next/dynamic';
const FAQ = dynamic(() => import('@/components/faq/FAQ'));
const FAQHeroSection = dynamic(() => import('@/components/faq/FAQHeroSection'));
import { getPageMetadata } from '@/services/content/seo.service';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('faq');

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

export default async function FAQPage() {

  const theme = await getThemeSettings();
  const backgroundColor = theme?.primaryColor || theme?.primary || 'oklch(34.38% 0.118 262.34)';

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF8FC]">
      <main className="flex-grow pt-25 md:pt-10">
        <FAQHeroSection backgroundColor={backgroundColor} />

        <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
          <FAQ
            themeColor={backgroundColor}
          />
        </div>
      </main>
    </div>
  );
}
