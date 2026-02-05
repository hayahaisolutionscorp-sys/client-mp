import { IPort } from '@/models';
import { PORTS_API, SHIPPING_LINE_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';

import portsData from '@/data/ports.json';

export async function getAllPorts(): Promise<IPort[]> {
  // const cached = fetchItem<IPort[]>('ports');
  // if (cached) return cached;
  //
  // try {
  //   const { data } = await axios.get(PORTS_API);
  //   cacheItem('ports', data);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return [];
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return portsData as IPort[];
}

export async function getPorts(): Promise<IPort[] | undefined> {
  try {
    const res = await fetch(PORTS_API, {
      next: { tags: ['ports'], revalidate: 3600 }
    });

    if (res.ok) {
      const { data } = await res.json();
      return data;
    }
  } catch (error) {
    console.error('Failed to fetch ports:', error);
  }
  return [];
}

export async function getPort(portId: number): Promise<IPort | undefined> {
  const ports = await getPorts();
  return ports?.find((port) => port.id === portId);
}

