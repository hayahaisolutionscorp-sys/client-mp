import { IFooterSection } from '@/models';
import { FOOTER_SECTION_API } from 'constants/api';
import { SHOULD_FETCH_REMOTE_WHITELABEL } from '../config';

import footerSectionsData from '@/data/footer-sections.json';

export async function getFooterSections(): Promise<IFooterSection | undefined> {
  try {
    if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
      return footerSectionsData as IFooterSection;
    }

    const isBrowser = typeof window !== 'undefined';
    const res = await fetch(
      FOOTER_SECTION_API,
      isBrowser
        ? { cache: 'no-store' }
        : { next: { tags: ['footer-sections'], revalidate: 3600 } }
    );

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return footerSectionsData as IFooterSection;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching footer sections:', e);
    }
    return footerSectionsData as IFooterSection;
  }
}