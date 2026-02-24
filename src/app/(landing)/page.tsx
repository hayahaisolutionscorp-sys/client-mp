import Hero from '@/components/landing/Hero';
import dynamic from 'next/dynamic';

const Promos = dynamic(() => import('@/components/landing/Promos'), { ssr: true });
const PopularRoutes = dynamic(() => import('@/components/landing/PopularRoutes'), { ssr: true });
const WhyChooseUs = dynamic(() => import('@/components/landing/WhyChooseUs'), { ssr: true });


import { getPageMetadata } from '@/services/content/seo.service';
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
  return (
    <div className="bg-[#EEF8FC]">
      <Hero />

      <div className="bg-[#EEF8FC]">
        <Promos />
        <PopularRoutes />
        <WhyChooseUs />
      </div>
    </div>
  );
}
