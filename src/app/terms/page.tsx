import ContentSidebar from '@/components/shared/ContentSidebar'
import TipTapRenderer from '@/components/shared/TipTapRenderer'
import { getTermsAndConditions } from '@/services/content/terms-and-conditions.service'
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('terms');

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

export default async function TermsPage() {
  const termsData = await getTermsAndConditions();

  return (
    <div className="min-h-screen bg-gradient-to-br sm:px-4 md:px-8 lg:px-10 lg:pb-64">
      <div className="flex flex-col md:flex-row sm:pt-2 md:pt-4 lg:pt-6">
        {/* Sidebar */}
        <ContentSidebar content={termsData?.content} />

        {/* Main Content */}
        <main className="flex-1 px-8">
          <h1 className="mb-8 text-3xl font-bold">{termsData?.title || 'Terms and Conditions'}</h1>
          {termsData?.content && (
            <TipTapRenderer content={termsData.content} />
          )}
        </main>
      </div>
    </div>
  )
}
