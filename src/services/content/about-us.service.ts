import { ABOUT_US_SECTION_API, ABOUT_US_CORE_VALUES_API } from 'constants/api';
import { ICoreValue } from '@/models';
import { IS_CLIENT } from '../config';

import aboutUsSectionsData from '@/data/about-us-sections.json';
import aboutUsCoreValuesData from '@/data/about-us-core-values.json';

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

export async function getAboutUsSection(sectionType: AboutUsSectionType): Promise<IAboutUsSection | undefined> {
  const cacheKey = `about-us-${sectionType.replace('_', '-')}`;

  try {
    if (!IS_CLIENT) {
      const sections = aboutUsSectionsData as Record<string, IAboutUsSection>;
      return sections[sectionType];
    }

    const res = await fetch(`${ABOUT_US_SECTION_API}/${sectionType}`, {
      next: { tags: [cacheKey], revalidate: 3600 },
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
  const cacheKey = 'about-us-core-values';

  try {
    if (!IS_CLIENT) {
      return aboutUsCoreValuesData as ICoreValue[];
    }

    const res = await fetch(ABOUT_US_CORE_VALUES_API, {
      next: { tags: [cacheKey], revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch about-us core values`);
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error(`Error fetching about-us core values:`, e);
    }
    return [];
  }
}
