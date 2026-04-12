import { MetadataRoute } from 'next';
import { getPress } from '@/services/content/press.service';
import { getBrandingConfig } from '@/services/ui/branding.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NODE_ENV === 'development') {
    return [];
  }

  const branding = await getBrandingConfig();
  const baseUrl = branding?.domain_name
    ? `https://${branding.domain_name}.com`
    : process.env.NEXT_PUBLIC_BASE_URL || 'https://www.hayahai.com';

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
    { path: '/about-us', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/contact-us', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/press', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: '/privacy-policy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/schedule-and-fares', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/booking/destination', priority: 0.9, changeFrequency: 'daily' as const }
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority
  }));

  let pressRoutes: MetadataRoute.Sitemap = [];
  try {
    const pressReleases = await getPress();
    if (pressReleases) {
      pressRoutes = pressReleases.map((press) => ({
        url: `${baseUrl}/press/${press.slug || press.id}`,
        lastModified: new Date(press.publish_date),
        changeFrequency: 'weekly' as const,
        priority: 0.7
      }));
    }
  } catch (error) {
    console.error('Failed to fetch press releases for sitemap:', error);
  }

  return [...staticRoutes, ...pressRoutes];
}
