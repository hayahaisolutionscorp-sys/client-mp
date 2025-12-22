import { IThumbnail } from '@/models';
import { THUMBNAIL_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import thumbnailsData from '@/data/thumbnails.json';

export async function getThumbnails(): Promise<IThumbnail[] | undefined> {
  // const cached = fetchItem<IThumbnail[]>('thumbnails');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(THUMBNAIL_API);
  //   cacheItem('thumbnails', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return thumbnailsData as IThumbnail[];
}

export async function getThumbnailsByShippingLineId(location: string, shippingLineId: number): Promise<IThumbnail[]> {
  // try {
  //   const { data } = await axios.get(`${THUMBNAIL_API}/shippingLine/${shippingLineId}`, { params: { location } });
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return [];
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (thumbnailsData as IThumbnail[]).filter(t => t.shippingLineId === shippingLineId && t.location === location);
}
