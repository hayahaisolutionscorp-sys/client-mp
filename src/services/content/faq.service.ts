import { IFaq } from '@/models';
import { FAQ_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import faqsData from '@/data/faqs.json';

export async function getFaqs(): Promise<IFaq[] | undefined> {
  // const cached = fetchItem<IFaq[]>('faqs');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(FAQ_API);
  //   cacheItem('faqs', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return faqsData as IFaq[];
}

export async function getFaqsByShippingLineId(
  shippingLineId: number
): Promise<IFaq[] | undefined> {
  // try {
  //   const { data } = await axios.get(`${FAQ_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (faqsData as IFaq[]).filter(f => f.shippingLineId === shippingLineId);
}

export async function getFaqsByCategoryAndShippingLineId(
  category: string,
  shippingLineId: number
): Promise<IFaq[] | undefined> {
  // try {
  //   const { data } = await axios.get(`${FAQ_API}`, { params: { category, shippingLineId } });
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (faqsData as IFaq[]).filter(f => f.shippingLineId === shippingLineId && f.category === category);
}