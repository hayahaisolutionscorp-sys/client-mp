import { IHeaderSection } from '@/models';
import { HEADER_SECTION_API } from 'constants/api';
import { IS_CLIENT } from '../config';

import headerSectionsData from '@/data/header-sections.json';

export async function getHeadersSections(): Promise<IHeaderSection | undefined> {
  try {
    if (!IS_CLIENT) {
      return headerSectionsData[0] as IHeaderSection | undefined;
    }

    const res = await fetch(HEADER_SECTION_API, {
      // next: { tags: ['header-sections'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return undefined;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching header sections:', e);
    }
    return undefined;
  }
}