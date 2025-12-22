import { IAboutUs } from '@/models';
import { ABOUT_US_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import aboutUsData from '@/data/about-us.json';

export async function getAboutUs(): Promise<IAboutUs[] | undefined> {
  // const cached = fetchItem<IAboutUs[]>('about-us');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(ABOUT_US_API);
  //   cacheItem('about-us', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return aboutUsData as IAboutUs[];
}

export async function getAboutUsByShippingLineId(shippingLineId: number): Promise<IAboutUs | undefined> {
  // try {
  //   const { data } = await axios.get(`${ABOUT_US_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (aboutUsData as IAboutUs[]).find(a => a.shippingLineId === shippingLineId);
}

