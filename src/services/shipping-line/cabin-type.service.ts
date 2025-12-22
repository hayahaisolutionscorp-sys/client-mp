import { ICabinType } from '@/models';
import { CABIN_TYPES_API } from 'constants/api';

import cabinTypesData from '@/data/cabin-types.json';

export async function getAllCabinTypes(): Promise<ICabinType[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return cabinTypesData as any as ICabinType[];
}

