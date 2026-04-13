import { IHeaderSection } from '@/models';
import { HEADER_SECTION_API } from 'constants/api';
import { IS_BUILD_TIME, SHOULD_FETCH_REMOTE_WHITELABEL } from '../config';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

import headerSectionsData from '@/data/header-sections.json';

export async function getHeadersSections(): Promise<IHeaderSection | undefined> {
  try {
    if (IS_BUILD_TIME) {
      return headerSectionsData[0] as IHeaderSection | undefined;
    }

    if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
      return headerSectionsData[0] as IHeaderSection | undefined;
    }

    const res = await fetchWithTimeout(HEADER_SECTION_API, {
      next: { tags: ['header-sections'], revalidate: 3600 },
      timeoutMs: 12_000,
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return headerSectionsData[0] as IHeaderSection | undefined;
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching header sections:', e);
    }
    return headerSectionsData[0] as IHeaderSection | undefined;
  }
}
