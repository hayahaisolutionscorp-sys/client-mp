import { IFaq } from '@/models';
import { FAQS_API } from 'constants/api';
import { IS_CLIENT } from '../config';
import { DEFAULT_FAQ_BUILDER_CONTENT, type FaqBuilderContent } from '@/lib/faq-builder';

import faqsData from '@/data/faqs.json';

export interface IFaqPage {
  id: string;
  page_type: string;
  title: string;
  content: FaqBuilderContent | null;
  seo_config: Record<string, unknown> | null;
  header_config: Record<string, unknown> | null;
  show_in_footer: boolean;
  slug: string;
  created_at: string | null;
  updated_at: string | null;
}

const FALLBACK_FAQ_PAGE: IFaqPage = {
  id: 'faq-fallback',
  page_type: 'faq',
  title: 'Frequently Asked Questions',
  content: DEFAULT_FAQ_BUILDER_CONTENT,
  seo_config: null,
  header_config: null,
  show_in_footer: false,
  slug: 'faq',
  created_at: null,
  updated_at: null
};

export async function getFaqPage(): Promise<IFaqPage> {
  // For now, always return fallback until backend endpoint is implemented
  return FALLBACK_FAQ_PAGE;
}

export async function getFaqs(): Promise<IFaq[]> {
  try {
    if (!IS_CLIENT) {
      return (faqsData as unknown as IFaq[])
        .filter((f) => f.is_active)
        .sort((a, b) => a.display_order - b.display_order);
    }

    const res = await fetch(FAQS_API, {
      next: { tags: ['faqs'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return (data as IFaq[]).filter((f) => f.is_active).sort((a, b) => a.display_order - b.display_order);
    }

    return [];
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching FAQs:', e);
    }
    return [];
  }
}
