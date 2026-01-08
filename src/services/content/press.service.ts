import { IPress } from '@/models';
import { PRESS_RELEASES_API } from 'constants/api';
// import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import pressData from '@/data/press.json';

export async function getPress(): Promise<IPress[]> {
  try {
    const res = await fetch(PRESS_RELEASES_API, {
      next: { tags: ['press-releases'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return (data as IPress[]).filter(p => p.is_active).sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime());
    }

    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

// export async function getPressByShippingLineId(
//   shippingLineId: number
// ): Promise<IPress[] | undefined> {
//   // try {
//   //   const { data } = await axios.get(`${PRESS_API}/shippingLine/${shippingLineId}`);
//   //   return data;
//   // } catch (e) {
//   //   console.error(e);
//   //   return undefined;
//   // }
//
//   await new Promise(resolve => setTimeout(resolve, 100));
//   const press = (pressData as any as IPress[]).filter(p => p.shippingLineId === shippingLineId);
//
//   return press
//     .filter((item) => item.isPublish)
//     .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
// }

export async function getPressById(
  id: number
): Promise<IPress | undefined> {
  const press = await getPress();
  return press.find(p => p.id === id);
}