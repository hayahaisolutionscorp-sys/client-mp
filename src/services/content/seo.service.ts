import { SEO_API } from 'constants/api';
// import axios from '@/services/core/axios';
import seoData from '@/data/seo.json';

export interface SeoMetadata {
    title: string | { template: string; default: string };
    description: string;
    openGraph?: any;
    icons?: any;
    manifest?: any;
}

export async function getGlobalMetadata(): Promise<SeoMetadata> {
    // try {
    //   const { data } = await axios.get(`${SEO_API}/global`);
    //   return data;
    // } catch (e) {
    //   console.error(e);
    // }

    await new Promise(resolve => setTimeout(resolve, 100));
    return seoData.global as any as SeoMetadata;
}

export async function getPageMetadata(pageKey: 'landing' | 'find-trips' | 'faq' | 'press' | 'terms' | 'about-us' | 'contact-us' | 'privacy-policy' | 'route'): Promise<SeoMetadata> {
    // try {
    //   const { data } = await axios.get(`${SEO_API}/pages/${pageKey}`);
    //   return data;
    // } catch (e) {
    //   console.error(e);
    // }

    await new Promise(resolve => setTimeout(resolve, 100));
    const pageData = seoData.pages[pageKey];
    return pageData as any as SeoMetadata;
}
