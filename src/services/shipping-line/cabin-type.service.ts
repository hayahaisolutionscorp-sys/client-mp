import { ICabinType } from '@/models';
import { CABIN_TYPES_API } from 'constants/api';

export async function getAllCabinTypes(): Promise<ICabinType[] | undefined> {
  const response = await fetch(CABIN_TYPES_API);

  if (!response.ok) {
    throw new Error('Failed to fetch cabin-types');
  }

  return response.json();
}

