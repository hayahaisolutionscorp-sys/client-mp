import { IFaq } from '@/models';
import { FAQS_API } from 'constants/api';
// import { cacheItem, fetchItem } from 'helpers/cache.helpers';
// import axios from '@/services/core/axios';

// import faqsData from '@/data/faqs.json';

export async function getFaqs(): Promise<IFaq[]> {
  try {
    const res = await fetch(FAQS_API, {
      next: { tags: ['faqs'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return (data as IFaq[]).filter(f => f.is_active).sort((a, b) => a.display_order - b.display_order);
    }

    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

// export async function getFaqsByShippingLineId(
//   shippingLineId: number
// ): Promise<IFaq[] | undefined> {
//   // try {
//   //   const { data } = await axios.get(`${FAQ_API}/shippingLine/${shippingLineId}`);
//   //   return data;
//   // } catch (e) {
//   //   console.error(e);
//   //   return undefined;
//   // }
//
//   await new Promise(resolve => setTimeout(resolve, 100));
//   return (faqsData as IFaq[]).filter(f => f.shippingLineId === shippingLineId);
// }
//
// export async function getFaqsByCategoryAndShippingLineId(
//   category: string,
//   shippingLineId: number
// ): Promise<IFaq[] | undefined> {
//   // try {
//   //   const { data } = await axios.get(`${FAQ_API}`, { params: { category, shippingLineId } });
//   //   return data;
//   // } catch (e) {
//   //   console.error(e);
//   //   return undefined;
//   // }
//
//   await new Promise(resolve => setTimeout(resolve, 100));
//   return (faqsData as IFaq[]).filter(f => f.shippingLineId === shippingLineId && f.category === category);
// }