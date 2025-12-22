import { IContactUs } from '@/models';
import { CONTACT_US_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import contactUsData from '@/data/contact-us.json';

export async function getContactUs(): Promise<IContactUs[] | undefined> {
  // const cached = fetchItem<IContactUs[]>('contact-us');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(CONTACT_US_API);
  //   cacheItem('contact-us', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return contactUsData as IContactUs[];
}

export async function getContactUsByShippingLineId(
  shippingLineId: number
): Promise<IContactUs | undefined> {
  // try {
  //   const { data } = await axios.get(`${CONTACT_US_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (contactUsData as IContactUs[]).find(c => c.shippingLineId === shippingLineId);
}