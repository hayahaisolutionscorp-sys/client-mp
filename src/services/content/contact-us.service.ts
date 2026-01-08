import { IContactInformation, IContactUs } from '@/models';
import { CONTACT_INFORMATION_API, CONTACT_US_API } from 'constants/api';
// import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import contactUsData from '@/data/contact-us.json';

export async function getContactUs(): Promise<IContactInformation[]> {
  try {
    const res = await fetch(CONTACT_INFORMATION_API, {
      next: { tags: ['contact-us'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
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


  return (contactUsData as IContactUs[]).find(c => c.shippingLineId === shippingLineId);
}