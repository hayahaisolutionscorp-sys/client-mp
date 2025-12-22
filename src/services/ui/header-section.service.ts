import { IHeaderSection } from '@/models';
import { HEADER_SECTION_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import headerSectionsData from '@/data/header-sections.json';

export async function getHeadersSections(): Promise<IHeaderSection[] | undefined> {
  // const cached = fetchItem<IHeaderSection[]>('header-sections');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(HEADER_SECTION_API);
  //   cacheItem('header-sections', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return headerSectionsData as IHeaderSection[];
}

export async function getHeaderSectionByShippingLineId(
  shippingLineId: number
): Promise<IHeaderSection | undefined> {
  // try {
  //   const { data } = await axios.get(`${HEADER_SECTION_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (headerSectionsData as IHeaderSection[]).find(h => h.shippingLineId === shippingLineId);
}