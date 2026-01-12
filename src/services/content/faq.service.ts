import { IFaq } from '@/models';
import { FAQS_API } from 'constants/api';
import { IS_CLIENT } from '../config';

import faqsData from '@/data/faqs.json';

export async function getFaqs(): Promise<IFaq[]> {
  try {
    if (!IS_CLIENT) {
      return (faqsData as IFaq[]).filter(f => f.is_active).sort((a, b) => a.display_order - b.display_order);
    }

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