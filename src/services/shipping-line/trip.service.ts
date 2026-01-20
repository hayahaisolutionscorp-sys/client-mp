import { isEmpty } from 'lodash';
import { TRIP_API } from 'constants/api';
import { getAllShippingLines, getShippingLineServer } from './shipping-line.service';
import { getPort, getPorts } from './port.service';
import { getRateTableById } from '../booking/rate-table.service';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';
import { toPhilippinesTime } from 'helpers/date.helpers';
import axios from '@/services/core/axios';

import { getAllCabinTypes } from './cabin-type.service';
import { getAllShippingLinesServer } from './shipping-line.service';
import { SearchAvailableTrips } from '@/types/trip/trip-management';
import { PaginatedRequest, PaginatedResponse } from '@/types/common/pagination';
import { IPort, ITrip, ICabinType, IShippingLine } from '@/models';

import tripsData from '@/data/trips.json';
import portsData from '@/data/ports.json';
import shippingLinesData from '@/data/shipping-lines.json';

export async function getTripsDestinationByPortId(portId: number): Promise<IPort[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  // Return all other ports as potential destinations
  return (portsData as IPort[]).filter(p => p.id !== portId);
}

export async function getTrips(tripIds: number[]): Promise<ITrip[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (tripsData as any as ITrip[]).filter(t => tripIds.includes(t.id));
}

export async function getAvailableTrips(
  shippingLineId: number | undefined,
  searchQuery: SearchAvailableTrips,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<ITrip> | undefined> {
  // try {
  //   const { data } = await axios.get(TRIP_API, {
  //     params: {
  //       shippingLineId,
  //       ...searchQuery,
  //       ...pagination
  //     }
  //   });
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  // Simulate search
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredTrips = tripsData as any as ITrip[];



  if (searchQuery.srcPortId) {
    filteredTrips = filteredTrips.filter(t => t.srcPortId === Number(searchQuery.srcPortId));
  }

  if (searchQuery.destPortId) {
    filteredTrips = filteredTrips.filter(t => t.destPortId === Number(searchQuery.destPortId));
  }

  const dateToFilter = searchQuery.filterSpecificDate || searchQuery.departureDate;

  if (dateToFilter) {
    const searchDatePH = toPhilippinesTime(dateToFilter as string, 'YYYY-MM-DD');

    filteredTrips = filteredTrips.filter(t => {
      const tripDatePH = toPhilippinesTime(t.departureDateIso, 'YYYY-MM-DD');
      return tripDatePH === searchDatePH;
    });
  }

  // Enrich with associated entities
  filteredTrips = filteredTrips.map(trip => {
    const srcPort = (portsData as IPort[]).find(p => p.id === trip.srcPortId);
    const destPort = (portsData as IPort[]).find(p => p.id === trip.destPortId);
    const shippingLine = (shippingLinesData as IShippingLine[]).find(s => s.id === trip.shippingLineId);
    return { ...trip, srcPort, destPort, shippingLine };
  });

  return {
    data: filteredTrips,
    total: filteredTrips.length
  };
}

export async function fetchAssociatedEntitiesToTrips(trips: ITrip[]): Promise<void> {
  // No-op for local JSON as we enrich in getAvailableTrips or assuming data is complete enough
}

export async function fetchAssociatedEntitiesToTrip(trip: ITrip): Promise<void> {
  // No-op
}

export async function getScheduleAndFares(
  departureDateISO?: string,
  shippingLineId?: number,
  srcPortId?: number,
  destPortId?: number,
  retryCount = 0
): Promise<ITrip[]> {
  // try {
  //   const { data } = await axios.get(`${TRIP_API}/schedule`, {
  //     params: {
  //       departureDate: departureDateISO,
  //       shippingLineId
  //     }
  //   });
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return [];
  // }

  await new Promise(resolve => setTimeout(resolve, 500));
  let filteredTrips = tripsData as any as ITrip[];

  if (departureDateISO) {
    const searchDatePH = toPhilippinesTime(departureDateISO, 'YYYY-MM-DD');

    filteredTrips = filteredTrips.filter(t => {
      const tripDatePH = toPhilippinesTime(t.departureDateIso, 'YYYY-MM-DD');
      return tripDatePH === searchDatePH;
    });
  }



  if (srcPortId) {
    filteredTrips = filteredTrips.filter(t => t.srcPortId === srcPortId);
  }

  if (destPortId) {
    filteredTrips = filteredTrips.filter(t => t.destPortId === destPortId);
  }

  // Enrich with associated entities
  filteredTrips = filteredTrips.map(trip => {
    const srcPort = (portsData as IPort[]).find(p => p.id === trip.srcPortId);
    const destPort = (portsData as IPort[]).find(p => p.id === trip.destPortId);
    const shippingLine = (shippingLinesData as IShippingLine[]).find(s => s.id === trip.shippingLineId);
    return { ...trip, srcPort, destPort, shippingLine };
  });

  return filteredTrips;
}

export async function fetchFilters(): Promise<Filters | undefined> {
  try {
    const [fetchedCabinTypes, fetchedShippingLines] = await Promise.all([
      getAllCabinTypes(),
      getAllShippingLinesServer()
    ]);
    const uniqueCabinTypes = Array.from(new Map(fetchedCabinTypes?.map((type) => [type.name, type])).values()) || [];
    const filteredShippingLines =
      fetchedShippingLines?.filter((line) => !line.name.toLowerCase().includes('ayahay')) || [];
    return {
      cabinTypes: uniqueCabinTypes,
      shippingLines: filteredShippingLines
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching filters:', error.message);
    } else {
      console.error('Unknown error fetching filters:', error);
    }
  }
}

// TODO: Move
export interface Filters {
  cabinTypes: ICabinType[];
  shippingLines: IShippingLine[];
}

type TripCache = { [tripId: number]: ITrip };

