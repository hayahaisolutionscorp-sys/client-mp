import { MetadataRoute } from 'next';
import { getPress } from '@/services/content/press.service';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://ayahay.com';

    // Static routes
    const routes = [
        '',
        '/about-us',
        '/contact-us',
        '/faq',
        '/login',
        '/register',
        '/press',
        '/privacy-policy',
        '/schedule-and-fares',
        '/terms',
        '/booking/destination',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic routes
    let pressRoutes: MetadataRoute.Sitemap = [];
    try {
        const pressReleases = await getPress();
        if (pressReleases) {
            pressRoutes = pressReleases.map((press) => ({
                url: `${baseUrl}/press/${press.id}`,
                lastModified: new Date(press.publish_date),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
        }
    } catch (error) {
        console.error('Failed to fetch press releases for sitemap:', error);
    }

    return [...routes, ...pressRoutes];
}
