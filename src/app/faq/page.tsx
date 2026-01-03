import FAQ from '@/components/faq/FAQ';
import FAQHeroSection from '@/components/faq/FAQHeroSection';
import { getThemeSettingsByShippingLineId } from '@/services';
import { getPageMetadata } from '@/services/content/seo.service';
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
  const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '3';

  let themeSettings = null;
  try {
    const parsedId = parseInt(shippingLineId, 10);
    if (!isNaN(parsedId)) {
      themeSettings = await getThemeSettingsByShippingLineId(parsedId);
    }
  } catch (error) {
    console.error('Error fetching theme settings:', error);
  }

  const backgroundColor = themeSettings?.backgroundColor || '#23abff';

  return (
    <div className="min-h-screen flex flex-col bg-[#EEF8FC]">
      <main className="flex-grow pt-25 md:pt-10">
        <FAQHeroSection backgroundColor={backgroundColor} />

        <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
          <FAQ
            shippingLineId={shippingLineId}
            themeColor={backgroundColor}
          />
        </div>
      </main>
    </div>
  );
}
