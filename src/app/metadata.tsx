import type { Metadata } from 'next';
import { getGlobalMetadata } from '@/services/content/seo.service';
import { getBrandingConfig } from '@/services/ui/branding.service';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobalMetadata();
  const branding = await getBrandingConfig();
  const brandName = branding?.brand_name || 'HayahAI';
  const title = typeof seo.title === 'string' ? { default: seo.title, template: `%s | ${seo.title}` } : seo.title;
  const description = seo.description || 'HayahAI Marketplace';

  return {
    ...(process.env.NODE_ENV === 'production' ? { metadataBase: new URL('https://www.hayahai.com') } : {}),

    title: {
      default: (title as any).default || 'HayahAI',
      template: (title as any).template || '%s | HayahAI'
    },

    description: description,

    applicationName: brandName,
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    keywords: seo.keywords || ['next.js', 'react', 'seo', 'ferry', 'booking', 'philippines'],
    creator: 'HayahAI Team',
    publisher: brandName,

    robots: seo.robots || {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },

    alternates: seo.alternates || {
      canonical: '/'
    },

    openGraph: seo.openGraph || {
      title: (title as any).default || 'HayahAI',
      description: description,
      url: '/',
      siteName: 'HayahAI',
      images: [
        {
          url: '/og.png',
          width: 1200,
          height: 630,
          alt: 'HayahAI preview'
        }
      ],
      locale: 'en_US',
      type: 'website'
    },

    twitter: seo.twitter || {
      card: 'summary_large_image',
      title: (title as any).default || 'HayahAI',
      description: description,
      images: ['/og.png']
    },

    icons: branding?.favicon_url
      ? {
          icon: branding.favicon_url,
          apple: branding.favicon_url
        }
      : seo.icons || {
          icon: '/favicon.ico',
          apple: '/apple-touch-icon.png'
        },

    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: brandName
      // startupImage: [], // Can add startup images here if available
    }

    // manifest: "/manifest.json", // Handled by src/app/manifest.ts
  };
}
