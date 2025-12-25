import Hero from '@/components/landing/Hero';
import dynamic from 'next/dynamic';

const Promos = dynamic(() => import('@/components/landing/Promos'), { ssr: true });
const PopularRoutes = dynamic(() => import('@/components/landing/PopularRoutes'), { ssr: true });
const WhyChooseUs = dynamic(() => import('@/components/landing/WhyChooseUs'), { ssr: true });


import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('landing');
  return {
    title: seo.title as any,
    description: seo.description,
  };
}

export default async function Home() {
  const shippingLineId = parseInt(process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '3');

  return (
    <div className="bg-[#EEF8FC]">
      <Hero />

      <div className="bg-[#EEF8FC]">
        <Promos />
        <PopularRoutes />
        {shippingLineId === 3 && <WhyChooseUs />}
      </div>
    </div>
  );
}
