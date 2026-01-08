
import { ABOUT_US_SECTION_API, ABOUT_US_CORE_VALUES_API } from 'constants/api';
import { ICoreValue } from '@/models';

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
  created_at: string;
  updated_at: string | null;
}

export async function getAboutUsSection(sectionType: string): Promise<IAboutUsSection | undefined> {
  const cacheKey = `about-us-${sectionType.replace('_', '-')}`;

  try {
    const res = await fetch(`${ABOUT_US_SECTION_API}/${sectionType}`, {
      next: { tags: [cacheKey], revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch about-us section ${sectionType}`);
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    console.error(`Error fetching about-us section ${sectionType}:`, e);
    return undefined;
  }
}

export async function getCoreValues(): Promise<ICoreValue[]> {
  const cacheKey = 'about-us-core-values';

  try {
    const res = await fetch(ABOUT_US_CORE_VALUES_API, {
      next: { tags: [cacheKey], revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch about-us core values`);
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    console.error(`Error fetching about-us core values:`, e);
    return [];
  }
}



