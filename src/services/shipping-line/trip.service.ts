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

export async function getTrips(tripIds: (number | string)[]): Promise<ITrip[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return (tripsData as any as ITrip[]).filter(t => tripIds.includes(t.id)); // Lint error here likely persists if t.id is string|number vs tripIds array element type mismatch in includes?
}

export async function getAvailableTrips(
  shippingLineId: number | undefined,
  searchQuery: SearchAvailableTrips,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<ITrip> | undefined> {
  try {
    const params = new URLSearchParams();

    if (shippingLineId) params.append('shippingLineId', shippingLineId.toString());
    if (searchQuery.origin_code) params.append('origin_code', searchQuery.origin_code);
    if (searchQuery.destination_code) params.append('destination_code', searchQuery.destination_code);
    if (searchQuery.passengerCount !== undefined) params.append('passenger_count', searchQuery.passengerCount.toString());
    if (searchQuery.vehicleCount !== undefined) params.append('vehicle_count', searchQuery.vehicleCount.toString());
    if (searchQuery.departureDate) params.append('departure_date', searchQuery.departureDate.split('T')[0]);
    if (pagination.page) params.append('page', pagination.page.toString());
    if (searchQuery.sort) params.append('sort', searchQuery.sort);

    // Add other params if needed by API, matching the curl or existing logic where applicable
    if (searchQuery.srcPortId && !searchQuery.origin_code) params.append('srcPortId', searchQuery.srcPortId.toString());
    if (searchQuery.destPortId && !searchQuery.destination_code) params.append('destPortId', searchQuery.destPortId.toString());

    const res = await fetch(`${TRIP_API}?${params.toString()}`, {
      next: { tags: ['trips'], revalidate: 3600 }
    });

    if (res.ok) {
      const responseData = await res.json();
      const rawTrips = responseData.data || [];

      const mappedTrips: ITrip[] = rawTrips.map((t: any) => {
        const firstSegment = t.segments?.[0] || {};
        return {
          id: t.id,
          referenceNo: firstSegment.reference_number || '',
          shipId: firstSegment.ship_id || 0,
          shipName: firstSegment.ship_name,
          shippingLineId: 0, // API doesn't return this top-level yet
          srcPortId: 0,
          srcPortName: t.origin_name,
          destPortId: 0,
          destPortName: t.destination_name,
          departureDateIso: t.total_departure_time,
          arrivalTimeDateIso: t.total_arrival_time,
          status: 'scheduled',
          rateTableId: firstSegment.rate_table_id || 0,
          allowOnlineBooking: true,
          seatSelection: firstSegment.is_seat_can_be_selected || false,
          availableVehicleCapacity: 0,
          vehicleCapacity: 0,
          bookingStartDateIso: firstSegment.booking_start_date || '',
          bookingCutOffDateIso: firstSegment.booking_cut_off_date || '',
          availableCabins: [],
          availableSeatTypes: [],
          meals: []
        };
      });

      return {
        data: mappedTrips,
        total: mappedTrips.length
      };
    }
    return {
      data: [],
      total: 0
    };
  } catch (e) {
    console.error(e);
    return undefined;
  }
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
  page?: number,
  limit?: number,
  retryCount = 0
): Promise<PaginatedResponse<ITrip>> {
  try {
    const params = new URLSearchParams();
    if (departureDateISO) params.append('departureDateISO', departureDateISO);
    if (shippingLineId) params.append('shippingLineId', shippingLineId.toString());
    if (srcPortId) params.append('srcPortId', srcPortId.toString());
    if (destPortId) params.append('destPortId', destPortId.toString());
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());

    const res = await fetch(`${TRIP_API}/schedule-and-fares?${params.toString()}`, {
      next: { tags: ['schedule-and-fares'], revalidate: 3600 }
    });

    if (res.ok) {
      return await res.json();
    }

    return {
      data: [],
      total: 0
    };
  } catch (e) {
    console.error(e);
    return {
      data: [],
      total: 0
    };
  }
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
    if (typeof window === 'undefined') {
      if (error instanceof Error) {
        console.error('Error fetching filters:', error.message);
      } else {
        console.error('Unknown error fetching filters:', error);
      }
    }
  }
}

// TODO: Move
export interface Filters {
  cabinTypes: ICabinType[];
  shippingLines: IShippingLine[];
}

type TripCache = { [tripId: number]: ITrip };

