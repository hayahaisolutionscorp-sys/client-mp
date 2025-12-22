import { IHeroSection } from '@/models';
import heroSectionsData from '@/data/hero-sections.json';

export async function getHeroSections(): Promise<IHeroSection[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return heroSectionsData as IHeroSection[];
}

export async function getHeroSectionByShippingLineId(
  shippingLineId: number
): Promise<IHeroSection | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (heroSectionsData as IHeroSection[]).find(h => h.shippingLineId === shippingLineId);
}