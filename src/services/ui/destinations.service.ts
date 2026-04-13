import { DESTINATIONS_API } from 'constants/api';
import { SHOULD_FETCH_REMOTE_WHITELABEL } from '../config';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

import destinationsData from '@/data/destinations.json';

export interface IDestination {
  id: string;
  route: string;
  image_url: string;
  image_alt: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string | null;
}

export interface IDestinationsResponse {
  message: string;
  data: IDestination[];
}

export async function getDestinations(): Promise<IDestination[]> {
  try {
    if (!SHOULD_FETCH_REMOTE_WHITELABEL) {
      return destinationsData as IDestination[];
    }

    const isBrowser = typeof window !== 'undefined';
    const isDevSsr =
      !isBrowser && process.env.NODE_ENV === 'development';
    const res = await fetchWithTimeout(
      DESTINATIONS_API,
      {
        ...(isBrowser || isDevSsr
          ? { cache: 'no-store' as RequestCache }
          : { next: { tags: ['destinations'], revalidate: 3600 } }),
        timeoutMs: 12_000,
      }
    );

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }

    return destinationsData as IDestination[];
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching destinations:', e);
    }
    return destinationsData as IDestination[];
  }
}
