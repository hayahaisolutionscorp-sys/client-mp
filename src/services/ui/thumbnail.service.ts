import { IThumbnail } from '@/models';
import { THUMBNAIL_API } from 'constants/api';

import thumbnailsData from '@/data/thumbnails.json';

export async function getThumbnails(): Promise<IThumbnail[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return thumbnailsData as IThumbnail[];
}

export async function getThumbnailsByShippingLineId(location: string, shippingLineId: number): Promise<IThumbnail[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (thumbnailsData as IThumbnail[]).filter(t => t.shippingLineId === shippingLineId && t.location === location);
}
