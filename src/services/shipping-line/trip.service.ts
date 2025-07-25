import { isEmpty } from 'lodash';
import { TRIP_API } from 'constants/api';
import { getAllShippingLines, getShippingLineServer } from './shipping-line.service';
import { getPort, getPorts } from './port.service';
import { getRateTableById } from '../booking/rate-table.service';
import { cacheItem, fetchItem } from 'helpers/cache.helpers';

import { getAllCabinTypes } from './cabin-type.service';
import { getAllShippingLinesServer } from './shipping-line.service';
import { SearchAvailableTrips } from '@/types/trip/trip-management';
import { PaginatedRequest, PaginatedResponse } from '@/types/common/pagination';
import { IPort, ITrip, ICabinType, IShippingLine } from '@/models';

export async function getTripsDestinationByPortId(portId: number): Promise<IPort[]> {
  if (!portId) {
    throw new Error('Port ID is required');
  }

  // If white label, only get the ports of the specific shipping line
  const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '';

  const apiUrl = `${TRIP_API}/destination-ports?portId=${portId}&shippingLineId=${shippingLineId}`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch trips');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching destination trips:', error);
    throw error;
  }
}

export async function getTrips(tripIds: number[]): Promise<ITrip[] | undefined> {
  if (!tripIds) return;

  const cachedTrips = fetchItem<TripCache>('trips-by-id') ?? {};

  const uncachedTripIds = tripIds.filter((tripId) => cachedTrips[tripId] === undefined);

  if (uncachedTripIds.length === 0) {
    return tripIds.map((tripId) => cachedTrips[tripId]);
  }

  try {
    const tripIdQuery = new URLSearchParams();
    uncachedTripIds.forEach((tripId) => tripIdQuery.append('tripIds', tripId.toString()));

    const response = await fetch(`${TRIP_API}?${tripIdQuery.toString()}`);
    if (!response.ok) {
      throw new Error(`Error fetching trips: ${response.statusText}`);
    }

    const trips: ITrip[] = await response.json();

    for (const trip of trips) {
      // TODO: calculate seat types in backend
      trip.availableSeatTypes = [];

      // TODO: create table for 'Meal Menu'
      trip.meals = ['Bacsilog'];
      trip.rateTable = await getRateTableById(trip.rateTableId);
      cachedTrips[trip.id] = trip;
    }

    cacheItem('trips-by-id', cachedTrips, 60);

    return tripIds.map((tripId) => cachedTrips[tripId]);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getAvailableTrips(
  shippingLineId: number | undefined,
  searchQuery: SearchAvailableTrips,
  pagination: PaginatedRequest
): Promise<PaginatedResponse<ITrip> | undefined> {
  // If searchQuery is empty, return early
  if (isEmpty(searchQuery)) return;

  // Prepare query parameters
  const params: Record<string, string | number | undefined> = {
    ...(shippingLineId && { shippingLineId: shippingLineId.toString() }), // Only add if defined
    ...searchQuery,
    ...pagination
  };

  // Convert the params object into a query string
  const query = new URLSearchParams(params as any).toString();

  // Make the API request
  const response = await fetch(`${TRIP_API}/available-trips?${query}`, { cache: 'no-store' });

  // Check if the response is okay
  if (!response.ok) {
    throw new Error(`Failed to fetch trips: ${response.statusText}`);
  }

  // Parse the response as JSON
  const trips: PaginatedResponse<ITrip> = await response.json();

  // Fetch associated entities for the trips
  await fetchAssociatedEntitiesToTrips(trips.data);

  // Return the fetched trips
  return trips;
}

export async function fetchAssociatedEntitiesToTrips(trips: ITrip[]): Promise<void> {
  await Promise.allSettled([getPorts(), getAllShippingLines()]);
  await Promise.all(trips.map((trip) => fetchAssociatedEntitiesToTrip(trip)));
}

export async function fetchAssociatedEntitiesToTrip(trip: ITrip): Promise<void> {
  const [srcPort, destPort, shippingLine] = await Promise.allSettled([
    getPort(trip.srcPortId),
    getPort(trip.destPortId),
    getShippingLineServer(trip.shippingLineId)
  ]);

  trip.srcPort = srcPort.status === 'fulfilled' ? srcPort.value : undefined;
  trip.destPort = destPort.status === 'fulfilled' ? destPort.value : undefined;
  trip.shippingLine = shippingLine.status === 'fulfilled' ? shippingLine.value : undefined;
}

export async function getScheduleAndFares(
  departureDateISO?: string,
  shippingLineId?: number,
  retryCount = 0
): Promise<ITrip[]> {
  if (!departureDateISO) {
    throw new Error('Departure date is required');
  }

  const params = new URLSearchParams();
  params.append('departureDateISO', departureDateISO);
  params.append('shippingLineId', shippingLineId?.toString() || '0');

  const url = `${TRIP_API}/schedule-and-fares?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // For 500 errors, retry up to 2 times with a delay
    if (response.status === 500 && retryCount < 2) {
      console.log(`Retrying schedule fetch attempt ${retryCount + 1}...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getScheduleAndFares(departureDateISO, shippingLineId, retryCount + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Schedule API Error:', {
        status: response.status,
        statusText: response.statusText,
        url,
        errorText,
        params: { departureDateISO, shippingLineId }
      });
      throw new Error(`Schedule API error: ${response.status} - ${response.statusText}`);
    }

    const trips: ITrip[] = await response.json();

    if (!Array.isArray(trips)) {
      throw new Error('Invalid response format: expected array of trips');
    }

    await fetchAssociatedEntitiesToTrips(trips);
    return trips;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Schedule fetch failed:', {
      error: errorMessage,
      url,
      params: { departureDateISO, shippingLineId },
      retryCount
    });
    throw new Error(`Unable to fetch schedule: ${errorMessage}`);
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
