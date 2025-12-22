import { IAboutUs } from '@/models';
import { ABOUT_US_API } from 'constants/api';

import aboutUsData from '@/data/about-us.json';

export async function getAboutUs(): Promise<IAboutUs[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return aboutUsData as IAboutUs[];
}

export async function getAboutUsByShippingLineId(shippingLineId: number): Promise<IAboutUs | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (aboutUsData as IAboutUs[]).find(a => a.shippingLineId === shippingLineId);
}

