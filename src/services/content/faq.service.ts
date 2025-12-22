import { IFaq } from '@/models';
import { FAQ_API } from 'constants/api';

import faqsData from '@/data/faqs.json';

export async function getFaqs(): Promise<IFaq[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return faqsData as IFaq[];
}

export async function getFaqsByShippingLineId(
  shippingLineId: number
): Promise<IFaq[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (faqsData as IFaq[]).filter(f => f.shippingLineId === shippingLineId);
}

export async function getFaqsByCategoryAndShippingLineId(
  category: string,
  shippingLineId: number
): Promise<IFaq[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (faqsData as IFaq[]).filter(f => f.shippingLineId === shippingLineId && f.category === category);
}