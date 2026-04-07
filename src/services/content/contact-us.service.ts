import { IContactInformation } from '@/models';
import { CONTACT_INFORMATION_API, CONTACT_US_HERO_API, SEO_API } from 'constants/api';
import { IS_BUILD_TIME } from '../config';

import contactInformationData from '@/data/contact-information.json';
import contactUsHeroData from '@/data/contact-us-hero.json';
import { DEFAULT_CONTACT_BUILDER_CONTENT, type ContactBuilderContent } from '@/lib/contact-builder';

export interface IContactUsHero {
  id: string;
  page_id: string;
  type: string;
  bg_type: 'image' | 'video' | null;
  bg_url: string | null;
  bg_alt: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  display_order?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface IContactSection extends IContactUsHero {}

export interface IContactPage {
  id: string;
  page_type: string;
  title: string;
  content: ContactBuilderContent | null;
  seo_config: Record<string, unknown> | null;
  header_config: Record<string, unknown> | null;
  show_in_footer: boolean;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

const FALLBACK_CONTACT_PAGE: IContactPage = {
  id: 'contact-us-fallback',
  page_type: 'contact',
  title: 'Contact Us',
  content: DEFAULT_CONTACT_BUILDER_CONTENT,
  seo_config: null,
  header_config: null,
  show_in_footer: false,
  slug: 'contact-us',
  created_at: null,
  updated_at: null,
};

export async function getContactPage(): Promise<IContactPage> {
  if (IS_BUILD_TIME) {
    return FALLBACK_CONTACT_PAGE;
  }

  try {
    const res = await fetch(`${SEO_API}/contact-us`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (typeof window === 'undefined') {
        console.error('Error fetching contact-us page:', `${res.status} ${res.statusText}`);
      }
      return FALLBACK_CONTACT_PAGE;
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching contact-us page:', e);
    }
    return FALLBACK_CONTACT_PAGE;
  }
}

export async function getContactUs(): Promise<IContactInformation[]> {
  try {
    if (IS_BUILD_TIME) {
      return (contactInformationData as IContactInformation[]).sort(
        (left, right) => (left.display_order || 0) - (right.display_order || 0)
      );
    }

    const res = await fetch(CONTACT_INFORMATION_API, {
      cache: 'no-store',
    });

    if (res.ok) {
      const { data } = await res.json();
      return (data as IContactInformation[]).sort(
        (left, right) => (left.display_order || 0) - (right.display_order || 0)
      );
    }

    return [];
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching contact information:', e);
    }
    return (contactInformationData as IContactInformation[]).sort(
      (left, right) => (left.display_order || 0) - (right.display_order || 0)
    );
  }
}

export async function getContactUsHero(): Promise<IContactUsHero | undefined> {
  try {
    if (IS_BUILD_TIME) {
      return contactUsHeroData as IContactUsHero;
    }

    const res = await fetch(CONTACT_US_HERO_API, {
      cache: 'no-store',
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return undefined;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching contact-us hero section:', e);
    }
    return undefined;
  }
}

export async function getContactSections(): Promise<IContactSection[]> {
  const fallbackSections = [contactUsHeroData as IContactSection];

  try {
    if (IS_BUILD_TIME) {
      return fallbackSections;
    }

    const res = await fetch(`${SEO_API}/contact-us/page-sections`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (typeof window === 'undefined') {
        console.error('Error fetching contact-us sections:', `${res.status} ${res.statusText}`);
      }
      return fallbackSections;
    }

    const { data } = await res.json();
    return (data as IContactSection[]).sort(
      (left, right) => (left.display_order || 0) - (right.display_order || 0)
    );
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching contact-us sections:', e);
    }
    return fallbackSections;
  }
}
