import { IContactUs } from '@/models';
import { CONTACT_US_API } from 'constants/api';

import contactUsData from '@/data/contact-us.json';

export async function getContactUs(): Promise<IContactUs[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return contactUsData as IContactUs[];
}

export async function getContactUsByShippingLineId(
  shippingLineId: number
): Promise<IContactUs | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (contactUsData as IContactUs[]).find(c => c.shippingLineId === shippingLineId);
}