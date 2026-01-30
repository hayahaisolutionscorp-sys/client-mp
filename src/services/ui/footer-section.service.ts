import { IFooterSection } from '@/models';
import { FOOTER_SECTION_API } from 'constants/api';
import { IS_CLIENT } from '../config';

import footerSectionsData from '@/data/footer-sections.json';

export async function getFooterSections(): Promise<IFooterSection | undefined> {
  try {
    if (!IS_CLIENT) {
      return footerSectionsData as IFooterSection;
    }

    const res = await fetch(FOOTER_SECTION_API, {
      next: { tags: ['footer-sections'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return undefined;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching footer sections:', e);
    }
    return undefined;
  }
}