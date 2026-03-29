import { IPort } from '@/models';
import { PORTS_API, SHIPPING_LINE_API, TENANT_PORTS_API } from 'constants/api';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import axios from '@/services/core/axios';
import { IS_CLIENT } from 'constants/api';

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
  return [];
}

export async function getPort(portId: number): Promise<IPort | undefined> {
  const ports = await getPorts();
  return ports?.find((port) => port.id === portId);
}

export async function getDestinationPortsByOrigin(originCode: string): Promise<IPort[]> {
  try {
    if (!IS_CLIENT) {
      // Format is province|municipality
      const [province, municipality] = originCode.split('|');
      if (!province || !municipality) return [];

      const res = await fetch(`${TENANT_PORTS_API}/${province}-${municipality}/trips`, {
        next: { tags: ['ports', `ports-${originCode}`], revalidate: 300 }
      });

      if (res.ok) {
        const { data } = await res.json();
        // Return destination province/municipality pairs mapped to IPort
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
      const res = await fetch(`${PORTS_API}/${originCode}/trips`, {
        next: { tags: ['ports', `ports-${originCode}`], revalidate: 300 } // shorter revalidate for dynamic nature
      });

      if (res.ok) {
        const { data } = await res.json();
        // The API returns distinct objects: { destination_port_name, destination_port_code }
        // We need to map them to IPort interface if possible, or usually we need the IDs to match the selected object in dropdowns.
        // However, the dropdowns uses IPort which has id, name, code.
        // The API response shown by user:
        // { "destination_port_name": "Talisay, Cebu", "destination_port_code": "TLSY" }
        // It is missing 'id'.
        // Strategy: The SearchBox.tsx has "ports" (all ports). We can filter "ports" based on the codes returned here.

        const destinations: any[] = [];

        data.forEach((item: any) => {
          // Add direct destination
          destinations.push({
            name: item.destination_port_name,
            code: item.destination_port_code,
          });

          // Add 2-hop destinations if they exist
          if (item.next_destinations && Array.isArray(item.next_destinations)) {
            item.next_destinations.forEach((next: any) => {
              destinations.push({
                name: next.destination_port_name,
                code: next.destination_port_code,
              });
            });
          }
        });

        // Deduplicate by code
        const uniqueDestinations = Array.from(new Map(destinations.map((item) => [item.code, item])).values());

        return uniqueDestinations;
      }
    }
  } catch (error) {
    console.error('Failed to fetch destination ports:', error);
  }
  return [];
}

