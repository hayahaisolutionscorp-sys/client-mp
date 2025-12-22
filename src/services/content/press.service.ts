import { IPress } from '@/models';
import { PRESS_API } from 'constants/api';

import pressData from '@/data/press.json';

export async function getPress(): Promise<IPress[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return pressData as any as IPress[];
}

export async function getPressByShippingLineId(
  shippingLineId: number
): Promise<IPress[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const press = (pressData as any as IPress[]).filter(p => p.shippingLineId === shippingLineId);

  return press
    .filter((item) => item.isPublish)
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
}

export async function getPressById(
  id: number
): Promise<IPress | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (pressData as any as IPress[]).find(p => p.id === id);
}