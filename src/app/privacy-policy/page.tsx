import PrivacyPolicyContent from "@/components/privacy-policy/PrivacyPolicyContent";
import { getPageMetadata } from '@/services/content/seo.service';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageMetadata('privacy-policy');
  return {
    title: seo.title as any,
    description: seo.description,
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
