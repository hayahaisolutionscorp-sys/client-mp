import { ICabinType } from '@/models';
import { CABIN_TYPES_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import cabinTypesData from '@/data/cabin-types.json';

export async function getAllCabinTypes(): Promise<ICabinType[] | undefined> {
  // const cached = fetchItem<ICabinType[]>('cabin-types');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(CABIN_TYPES_API);
  //   cacheItem('cabin-types', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return cabinTypesData as any as ICabinType[];
}

