import { IFooterSection } from '@/models';
import { FOOTER_SECTION_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import footerSectionsData from '@/data/footer-sections.json';

export async function getFooterSections(): Promise<IFooterSection[] | undefined> {
  // const cached = fetchItem<IFooterSection[]>('footer-sections');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(FOOTER_SECTION_API);
  //   cacheItem('footer-sections', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return footerSectionsData as IFooterSection[];
}

export async function getFooterSectionByShippingLineId(
  shippingLineId: number
): Promise<IFooterSection | undefined> {
  // try {
  //   const { data } = await axios.get(`${FOOTER_SECTION_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (footerSectionsData as IFooterSection[]).find(f => f.shippingLineId === shippingLineId);
}