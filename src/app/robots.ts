import { MetadataRoute } from 'next';
import { getBrandingConfig } from '@/services/ui/branding.service';

export default async function robots(): Promise<MetadataRoute.Robots> {
  if (process.env.NODE_ENV === 'development') {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  const branding = await getBrandingConfig();
  const baseUrl = branding?.domain_name
    ? `https://${branding.domain_name}.com`
    : 'https://hayahai.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/register',
          '/profile',
          '/booking/passenger-details',
          '/booking/payment-confirmation',
          '/booking/payment-success',
          '/booking/confirmed/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
