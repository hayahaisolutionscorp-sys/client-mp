import { ABOUT_US_SECTION_API, ABOUT_US_CORE_VALUES_API, SEO_API } from 'constants/api';
import { ICoreValue } from '@/models';
import { IS_BUILD_TIME } from '../config';

import aboutUsSectionsData from '@/data/about-us-sections.json';
import aboutUsCoreValuesData from '@/data/about-us-core-values.json';
import { DEFAULT_ABOUT_BUILDER_CONTENT, type AboutBuilderContent } from '@/lib/about-builder';

export interface IAboutUsSection {
  id: string;
  page_id: string;
  type: string;
  bg_type: string | null;
  bg_url: string | null;
  bg_alt: string | null;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

type AboutUsSectionType = 'hero' | 'welcome' | 'our_story' | 'our_expertise';

export interface IAboutPage {
  id: string;
  page_type: string;
  title: string;
  content: AboutBuilderContent | null;
  seo_config: Record<string, unknown> | null;
  header_config: Record<string, unknown> | null;
  show_in_footer: boolean;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

export async function getAboutPage(): Promise<IAboutPage> {
  if (IS_BUILD_TIME) {
    return {
      id: 'about-us-fallback',
      page_type: 'about',
      title: 'About Us',
      content: DEFAULT_ABOUT_BUILDER_CONTENT,
      seo_config: null,
      header_config: null,
      show_in_footer: false,
      slug: 'about-us',
      created_at: null,
      updated_at: null,
    };
  }

  try {
    const res = await fetch(`${SEO_API}/about-us`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch about-us page');
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching about-us page:', e);
    }

    return {
      id: 'about-us-fallback',
      page_type: 'about',
      title: 'About Us',
      content: DEFAULT_ABOUT_BUILDER_CONTENT,
      seo_config: null,
      header_config: null,
      show_in_footer: false,
      slug: 'about-us',
      created_at: null,
      updated_at: null,
    };
  }
}

export async function getAboutUsSection(sectionType: AboutUsSectionType): Promise<IAboutUsSection | undefined> {
  try {
    if (IS_BUILD_TIME) {
      const sections = aboutUsSectionsData as Record<string, IAboutUsSection>;
      return sections[sectionType];
    }

    const res = await fetch(`${ABOUT_US_SECTION_API}/${sectionType}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch about-us section ${sectionType}`);
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error(`Error fetching about-us section ${sectionType}:`, e);
    }
    return undefined;
  }
}

export async function getCoreValues(): Promise<ICoreValue[]> {
  try {
    if (IS_BUILD_TIME) {
      return (aboutUsCoreValuesData as ICoreValue[])
        .filter((value) => value.is_active)
        .sort((left, right) => left.display_order - right.display_order);
    }

    const res = await fetch(ABOUT_US_CORE_VALUES_API, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch about-us core values`);
    }

    const { data } = await res.json();
    return (data as ICoreValue[])
      .filter((value) => value.is_active)
      .sort((left, right) => left.display_order - right.display_order);
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error(`Error fetching about-us core values:`, e);
    }
    return (aboutUsCoreValuesData as ICoreValue[])
      .filter((value) => value.is_active)
      .sort((left, right) => left.display_order - right.display_order);
  }
}
