import type { Metadata } from "next";
import { getGlobalMetadata } from '@/services/content/seo.service';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobalMetadata();
  return {
    metadataBase: new URL('https://ayahay.com'),
    title: seo.title as any, // Type assertion if needed or match interface
    description: seo.description,
    openGraph: seo.openGraph,
    icons: seo.icons || { icon: '/assets/images/ayahay.ico' },
  };
}
