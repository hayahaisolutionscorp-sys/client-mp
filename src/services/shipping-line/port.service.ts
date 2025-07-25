import { IPort } from '@/models';
import { PORTS_API, SHIPPING_LINE_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';

export async function getAllPorts(): Promise<IPort[]> {
  const response = await fetch(PORTS_API);

  if (!response.ok) {
    throw new Error('Failed to fetch ports');
  }

  return response.json();
}

export async function getPorts(): Promise<IPort[] | undefined> {
  const cachedPorts = fetchItem<IPort[]>('ports');
  if (cachedPorts) return cachedPorts;

  // If white label, only get the ports of the specific shipping line
  const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID;

  const apiUrl = shippingLineId
    ? `${SHIPPING_LINE_API}/${shippingLineId}/ports`
    : PORTS_API;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ports: ${response.statusText}`);
    }
  
    const ports: IPort[] = await response.json();
    cacheItem('ports', ports, 1);

    return ports;

  } catch (error) {
    console.error('Error fetching ports:', error);
    throw error;
  }
}

export async function getPort(portId: number): Promise<IPort | undefined> {
  const ports = await getPorts();
  return ports?.find((port) => port.id === portId);
}

