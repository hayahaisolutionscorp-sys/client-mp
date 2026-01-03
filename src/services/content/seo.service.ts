import { SEO_API } from 'constants/api';

import seoData from '@/data/seo.json';


export interface SeoMetadata {
    title: string | { template: string; default: string };
    description: string;
    keywords?: string[];
    robots?: any;
    alternates?: any;
    openGraph?: any;
    twitter?: any;
    icons?: any;
    manifest?: any;
}

export async function getGlobalMetadata(): Promise<SeoMetadata> {
    try {
        const res = await fetch(`${SEO_API}/global`, {
            next: { tags: ['seo-global'], revalidate: 3600 }
        });

        if (res.ok) {
            const { data } = await res.json();
            return data;
        }

    } catch (e) {
        console.error(e);
    }

    return seoData.global as any as SeoMetadata;
}

export async function getPageMetadata(pageKey: 'home' | 'find-trips' | 'faq' | 'press' | 'terms' | 'about-us' | 'contact-us' | 'privacy-policy' | 'route'): Promise<SeoMetadata> {

    try {
        const res = await fetch(`${SEO_API}/${pageKey}`, {
            next: { tags: [pageKey], revalidate: 3600 }
        });

        if (res.ok) {
            const { data } = await res.json();
            const config = data.seo_config;


            const metadata: SeoMetadata = {
                title: config.title,
                description: config.description,
                keywords: config.keywords,
                robots: config.robots,
                alternates: {
                    canonical: config.canonical_url,
                },
                openGraph: {
                    title: config.og_title,
                    description: config.og_description,
                    url: config.og_url,
                    type: config.og_type,
                    siteName: config.og_site_name,
                    images: config.og_image ? [{ url: config.og_image }] : undefined,
                    locale: config.locale,
                },
                twitter: {
                    card: config.twitter_card,
                    title: config.twitter_title,
                    description: config.twitter_description,
                    images: config.twitter_image ? [config.twitter_image] : undefined,
                },
            };


            return metadata;
        }

    } catch (e) {
        console.error(e);
    }

    // Fallback if API fails or returns error
    const pageData = (seoData.pages as any)[pageKey];
    return {
        title: pageData?.title || 'Ayahay',
        description: pageData?.description || 'Ayahay Marketplace',
    } as SeoMetadata;
}