import { IPress } from '@/models';
import { PRESS_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import pressData from '@/data/press.json';

export async function getPress(): Promise<IPress[] | undefined> {
  // const cached = fetchItem<IPress[]>('press');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(PRESS_API);
  //   cacheItem('press', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return pressData as any as IPress[];
}

export async function getPressByShippingLineId(
  shippingLineId: number
): Promise<IPress[] | undefined> {
  // try {
  //   const { data } = await axios.get(`${PRESS_API}/shippingLine/${shippingLineId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  const press = (pressData as any as IPress[]).filter(p => p.shippingLineId === shippingLineId);

  return press
    .filter((item) => item.isPublish)
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
}

export async function getPressById(
  id: number
): Promise<IPress | undefined> {
  // try {
  //   const { data } = await axios.get(`${PRESS_API}/${id}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return (pressData as any as IPress[]).find(p => p.id === id);
}