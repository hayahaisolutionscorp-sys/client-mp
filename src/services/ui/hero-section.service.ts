import { HERO_SECTION_API } from 'constants/api';
import { SHOULD_FETCH_REMOTE_WHITELABEL } from '../config';

import heroSectionData from '@/data/hero-sections.json';

export interface IHeroSection {
  id: string;
  page_id: string;
  type: string;
  bg_type: 'video' | 'image' | 'youtube';
  bg_url: string;
  bg_alt: string;
  title: string;
  subtitle: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export async function getHeroSections(): Promise<IHeroSection | undefined> {
  try {
    if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
      return heroSectionData as IHeroSection;
    }

    const res = await fetch(HERO_SECTION_API, {
      next: { tags: ['hero-sections'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return heroSectionData as IHeroSection;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching hero sections:', e);
    }
    return heroSectionData as IHeroSection;
  }
}
