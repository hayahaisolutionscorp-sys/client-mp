import { SEO_API } from 'constants/api';
import { IS_BUILD_TIME } from '../config';

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

type PageKey =
    | 'home'
    | 'find-trips'
    | 'faqs'
    | 'faq'
    | 'press-releases'
    | 'press'
    | 'terms-and-conditions'
    | 'terms'
    | 'about-us'
    | 'contact-us'
    | 'privacy-policy'
    | 'route';

// Map legacy page keys to new slugs used in seo.json
const pageKeyMap: Record<string, string> = {
    faq: 'faqs',
    press: 'press-releases',
    terms: 'terms-and-conditions',
};

function buildMetadataFromConfig(config: any): SeoMetadata {
    return {
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
            type: config.og_type || 'website',
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
}

export async function getGlobalMetadata(): Promise<SeoMetadata> {
    return getPageMetadata('home');
}

export async function getPageMetadata(pageKey: PageKey): Promise<SeoMetadata> {
    // Resolve legacy keys to new slugs
    const resolvedKey = pageKeyMap[pageKey] || pageKey;

    try {
        if (IS_BUILD_TIME) {
            const pageData = (seoData.pages as any)[resolvedKey];
            if (pageData) {
                return buildMetadataFromConfig(pageData);
            }
            return {
                title: pageData?.title || 'Ayahay',
                description: pageData?.description || 'Ayahay Marketplace',
            } as SeoMetadata;
        }

        const res = await fetch(`${SEO_API}/${resolvedKey}`, {
            next: { tags: [resolvedKey], revalidate: 3600 },
        });

        if (res.ok) {
            const { data } = await res.json();
            const config = data.seo_config;
            return buildMetadataFromConfig(config);
        }
    } catch (e) {
        if (typeof window === 'undefined') {
            console.error(`Error fetching page metadata for ${pageKey}:`, e);
        }
    }

    // Fallback if API fails or returns error
    const pageData = (seoData.pages as any)[resolvedKey];
    return {
        title: pageData?.title || 'Ayahay',
        description: pageData?.description || 'Ayahay Marketplace',
    } as SeoMetadata;
}
