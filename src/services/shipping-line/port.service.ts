import { IPort } from '@/models';
import { PORTS_API, SHIPPING_LINE_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';

import portsData from '@/data/ports.json';

export async function getAllPorts(): Promise<IPort[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return portsData as IPort[];
}

export async function getPorts(): Promise<IPort[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return portsData as IPort[];
}

export async function getPort(portId: number): Promise<IPort | undefined> {
  const ports = await getPorts();
  return ports?.find((port) => port.id === portId);
}

