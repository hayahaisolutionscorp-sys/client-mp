import { IPort } from '@/models';
import { PORTS_API, SHIPPING_LINE_API, TENANT_PORTS_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';
import type { IRoute } from '@/models/shipping-line/route.model';
import { IS_CLIENT } from 'constants/api';

import portsData from '@/data/ports.json';

let routesLookupPromise: Promise<IRoute[]> | null = null;

async function getRoutesForDestinationLookup(): Promise<IRoute[]> {
  if (!routesLookupPromise) {
    routesLookupPromise = fetch('/api/routes?tenantId=1')
      .then(async (res) => {
        if (!res.ok) {
          return [];
        }

        const data = await res.json();
        return data?.data ?? data ?? [];
      })
      .catch(() => []);
  }

  return routesLookupPromise;
}

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
    if (!IS_CLIENT) {
      // API V2 Server Mode - Fetch distinct provinces/municipalities
      const res = await fetch(TENANT_PORTS_API, {
        next: { tags: ['ports'], revalidate: 3600 }
      });
      if (res.ok) {
        const { data } = await res.json();
        // Map { province, municipality } to IPort
        return data.map((item: any, index: number) => {
          const name = item.municipality && item.province
            ? `${item.municipality}, ${item.province}`
            : (item.municipality || item.province);
          const code = `${item.province}|${item.municipality}`;
          return {
            id: index + 1, // Synthetic ID for dropdown
            name,
            code,
            province: item.province,
            municipality: item.municipality
          } as IPort;
        });
      }
    } else {
      // Client API Mode
      const res = await fetch(PORTS_API, {
        next: { tags: ['ports'], revalidate: 3600 }
      });

      if (res.ok) {
        const { data } = await res.json();
        return data;
      }
    }
  } catch (error) {
    console.error('Failed to fetch ports:', error);
  }
  return portsData as IPort[];
}

export async function getPort(portId: number): Promise<IPort | undefined> {
  const ports = await getPorts();
  return ports?.find((port) => port.id === portId);
}

export async function getDestinationPortsByOrigin(originCode: string): Promise<IPort[]> {
  try {
    const routes = await getRoutesForDestinationLookup();
    const destinations = routes
      .filter((route) => route.src_port_code === originCode)
      .map((route) => ({
        id: route.dest_port_id,
        name: route.dest_port_name,
        code: route.dest_port_code,
      }))
      .filter((port) => port.code && port.name);

    return Array.from(new Map(destinations.map((item) => [item.code, item])).values());
  } catch (error) {
    console.error('Failed to fetch destination ports:', error);
  }
  return [];
}

