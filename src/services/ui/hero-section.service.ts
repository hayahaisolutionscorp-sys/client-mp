import { IHeroSection } from '@/models';
import { HERO_SECTION_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';
import heroSectionsData from '@/data/hero-sections.json';

export async function getHeroSections(): Promise<IHeroSection[] | undefined> {
  // const cached = fetchItem<IHeroSection[]>('hero-sections');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(HERO_SECTION_API);
  //   cacheItem('hero-sections', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return heroSectionsData as IHeroSection[];
}

export async function getHeroSectionByShippingLineId(
  shippingLineId: number
): Promise<IHeroSection | undefined> {
  // try {
  //   const { data } = await axios.get(`${HERO_SECTION_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (heroSectionsData as IHeroSection[]).find(h => h.shippingLineId === shippingLineId);
}