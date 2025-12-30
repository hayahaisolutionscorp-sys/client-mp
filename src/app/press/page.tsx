import PressList from '@/components/press/PressList';
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('press');
  return {
    title: seo.title as any,
    description: seo.description,
  };
}

export default function PressPage() {
  return <PressList />;
}
