import { IHeroSection } from '@/models';
import { HERO_SECTION_API } from 'constants/api';

export async function getHeroSections(): Promise<IHeroSection[] | undefined> {
  try {
    const response = await fetch(HERO_SECTION_API);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch hero sections: ${response.status} ${response.statusText}`);
    }

    const data: IHeroSection[] = await response.json();
    return data;

  } catch (e) {
    console.error('Error fetching hero sections:', e);
    throw e;
  }
}

export async function getHeroSectionByShippingLineId(
  shippingLineId: number
): Promise<IHeroSection | undefined> { 
  try {
    const response = await fetch(`${HERO_SECTION_API}/${shippingLineId}`);

    if (!response.ok) {
        throw new Error(`Error fetching hero section by shipping line id: ${response.statusText}`);
    }

    const heroSection: IHeroSection = await response.json();
    return heroSection;

  } catch (e) {
    console.error(e);
    throw e;
  }
}