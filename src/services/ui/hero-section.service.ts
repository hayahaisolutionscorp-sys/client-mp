import { HERO_SECTION_API } from 'constants/api';


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
  created_at: string;
  updated_at: string | null;
}

export async function getHeroSections(): Promise<IHeroSection | undefined> {
  try {
    const res = await fetch(HERO_SECTION_API, {
      next: { tags: ['hero-sections'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return undefined;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}