import { Metadata } from 'next';
import { getPageMetadata } from '@/services/content/seo.service';
import ScheduleAndFaresClient from './ScheduleAndFaresClient';

import dynamic from 'next/dynamic';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { CalendarIcon } from 'lucide-react';

const ScheduleAndFares = dynamic(() => import('@/components/schedule-and-fares/ScheduleAndFares'), { ssr: false });

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('schedule-and-fares');

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

export default function ScheduleAndFaresPage() {
  return (
    <div className="min-h-screen bg-[#EEF8FC]">
      <div className="container max-w-[1500px] mx-auto pt-8 pb-2 px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Schedule &amp; Fares</h1>
      </div>
      <ScheduleAndFaresClient />
    </div>
  );
}
