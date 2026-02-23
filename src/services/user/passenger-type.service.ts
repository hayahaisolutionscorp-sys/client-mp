import { IPassengerType } from '@/models';
import { PASSENGER_TYPES_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

export async function getPassengerTypes(): Promise<IPassengerType[] | undefined> {
  const cached = fetchItem<IPassengerType[]>('passenger-types');
  if (cached) return cached;

  try {
    const { data } = await axios.get(PASSENGER_TYPES_API);
    const types = data.data as IPassengerType[];
    cacheItem('passenger-types', types);
    return types;
  } catch (e) {
    console.error('Failed to fetch passenger types:', e);
    return undefined;
  }
}
