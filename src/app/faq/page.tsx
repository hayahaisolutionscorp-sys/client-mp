import FAQPageBuilder from '@/components/faq/builder/FAQPageBuilder';
import FAQSchema from '@/components/seo/FAQSchema';
import { getPageMetadata } from '@/services/content/seo.service';
import { getThemeSettings } from '@/services/ui/theme-settings.service';
import { getFaqPage, getFaqs } from '@/services/content/faq.service';
import { getBrandingConfig } from '@/services/ui/branding.service';
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
  const [theme, faqPage, faqs, branding] = await Promise.all([
    getThemeSettings(),
    getFaqPage(),
    getFaqs(),
    getBrandingConfig(),
  ]);

  const categories = Array.from(new Set(faqs.map((item) => item.category)));

  return (
    <>
      <FAQSchema />
      <FAQPageBuilder
        faqPageContent={faqPage.content}
        faqs={faqs}
        categories={categories}
        themeSettings={theme ?? null}
        branding={branding ?? null}
      />
    </>
  );
}
