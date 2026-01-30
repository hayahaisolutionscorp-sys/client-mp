import { IPress } from '@/models';
import { PRESS_RELEASES_API } from 'constants/api';
// import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';
import { IS_CLIENT } from '../config';

import pressData from '@/data/press.json';

export async function getPress(): Promise<IPress[]> {
  try {
    if (!IS_CLIENT) {
      return pressData.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        publish_date: p.publishedDate,
        slug: p.id,
        display_order: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: null,
        // map other properties if needed or allow partial if interface was looser, but sticking to required
      })) as IPress[];
    }

    const res = await fetch(PRESS_RELEASES_API, {
      next: { tags: ['press-releases'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return (data as IPress[]).filter(p => p.is_active).sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
    }

    return [];
  } catch (e) {
    if (typeof window === 'undefined') {
      console.error('Error fetching press:', e);
    }
    return [];
  }
}



export async function getPressById(
  id: number | string
): Promise<IPress | undefined> {
  const press = await getPress();
  return press.find(p => p.id === id);
}