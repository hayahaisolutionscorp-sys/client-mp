import { TRIP_API } from 'constants/api';
import { toPhilippinesTime } from 'helpers/date.helpers';

import { getAllCabinTypes } from './cabin-type.service';
import { getAllShippingLinesServer } from './shipping-line.service';
import { SearchAvailableTrips } from '@/types/trip/trip-management';
import { PaginatedRequest, PaginatedResponse } from '@/types/common/pagination';
import { IPort, ITrip, ICabinType, IShippingLine } from '@/models';

import tripsData from '@/data/trips.json';
import portsData from '@/data/ports.json';

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
    if (searchQuery.commodity_id) params.append('commodity_id', searchQuery.commodity_id);
    if (searchQuery.shippingLineIds) params.append('shippingLineIds', searchQuery.shippingLineIds);
    if (searchQuery.departureDate) {
      const formattedDate = toPhilippinesTime(searchQuery.departureDate, 'YYYY-MM-DD');
      if (formattedDate) params.append('departure_date', formattedDate);
    }
    if (pagination.page) params.append('page', pagination.page.toString());
    if (searchQuery.sort) params.append('sort', searchQuery.sort);

    // Add other params if needed by API, matching the curl or existing logic where applicable
    if (searchQuery.srcPortId && !searchQuery.origin_code) params.append('srcPortId', searchQuery.srcPortId.toString());
    if (searchQuery.destPortId && !searchQuery.destination_code) params.append('destPortId', searchQuery.destPortId.toString());

    const res = await fetch(`${TRIP_API}/marketplace?${params.toString()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const responseData = await res.json();
      const rawTrips = responseData.data || [];
      const allRates = responseData.rates || {};
      const lightLogo = responseData.light_logo;

      const mappedTrips: ITrip[] = rawTrips.map((t: any) => {
        const segments = t.segments || [];

        const mappedSegments = segments.map((seg: any) => {
          const routeCode = `${seg.source_port_code}-${seg.destination_port_code}`;
          const routeRates = allRates[routeCode] || {};
          const passengerRates = routeRates.passenger_rates || [];
          const rateSnapshotId = routeRates.snapshot?.id ? parseInt(routeRates.snapshot.id, 10) : 0;

          // Create a map of cabin type code to adult rate amount for this specific segment/route
          const segRatesMap = new Map<string, number>();
          if (Array.isArray(passengerRates)) {
            passengerRates.forEach((rate: any) => {
              if (rate.passenger_type_code === 'ADULT' && rate.accom_code) {
                segRatesMap.set(rate.accom_code.toUpperCase(), parseFloat(rate.amount));
              }
            });
          }

          const segCabins = seg.cabins || [];
          const availableCabins: any[] = segCabins
            .map((c: any) => {
              const cabinTypeName = c.cabin_type_name?.toUpperCase();
              const adultFare = segRatesMap.get(cabinTypeName);

              if (adultFare === undefined) return null;

              return {
                tripId: t.id,
                cabinId: c.id,
                cabin: {
                  id: c.id,
                  shipId: c.ship_id,
                  cabinTypeId: c.cabin_type_id,
                  cabinType: {
                    id: c.cabin_type_id,
                    shippingLineId: 0,
                    name: c.cabin_type_name || c.name,
                    description: c.cabin_type_description
                  },
                  name: c.name,
                  recommendedPassengerCapacity: c.max_passenger_capacity,
                  cabin_type_name: c.cabin_type_name,
                  cabin_type_description: c.cabin_type_description
                },
                availablePassengerCapacity: c.max_passenger_capacity,
                passengerCapacity: c.max_passenger_capacity,
                adultFare: adultFare
              };
            })
            .filter((c: any) => c !== null); // Filter out cabins without rates

          const remainingVehicles = seg.remaining_capacities?.vehicles || {};
          const totalVehicleCapacity = Object.values(remainingVehicles).reduce((sum: number, val: any) => sum + (val || 0), 0);

          return {
            id: seg.id,
            tripId: t.id,
            shipId: seg.ship_id,
            shipName: seg.ship_name,
            shippingLineId: seg.shipping_line_id || 0,
            shippingLine: seg.shipping_line,
            srcPortId: 0,
            srcPortName: seg.source_port_name,
            destPortId: 0,
            destPortName: seg.destination_port_name,
            departureDateIso: seg.scheduled_departure,
            arrivalTimeDateIso: seg.scheduled_arrival,
            referenceNo: seg.reference_number,
            availableCabins: availableCabins,
            availableVehicleCapacity: totalVehicleCapacity,
            remainingVehicleCapacity: remainingVehicles,
            vehicleCapacity: totalVehicleCapacity,
            bookingStartDateIso: seg.booking_start_date,
            bookingCutOffDateIso: seg.booking_cut_off_date,
            seatSelection: seg.is_seat_can_be_selected,
            rateTableId: rateSnapshotId,
            status: seg.status || 'pending'
          };
        });

        const firstSegment = mappedSegments[0] || {};
        const totalTripVehicleCapacity = mappedSegments.length > 0
          ? Math.min(...mappedSegments.map((s: any) => s.availableVehicleCapacity))
          : 0;

        return {
          id: t.id,
          referenceNo: firstSegment.referenceNo || '',
          shipId: firstSegment.shipId || 0,
          shipName: firstSegment.shipName,
          shippingLineId: firstSegment.shippingLineId || 0,
          shippingLine: firstSegment.shippingLine || t.shipping_line,
          srcPortId: 0,
          srcPortName: t.origin_name,
          destPortId: 0,
          destPortName: t.destination_name,
          lightLogoUrl: lightLogo,
          departureDateIso: t.total_departure_time,
          arrivalTimeDateIso: t.total_arrival_time,
          status: t.status || firstSegment.status || 'pending',
          rateTableId: firstSegment.rateTableId || 0,
          allowOnlineBooking: true,
          seatSelection: firstSegment.seatSelection || false,
          availableVehicleCapacity: totalTripVehicleCapacity,
          remainingVehicleCapacity: firstSegment.remainingVehicleCapacity || {},
          vehicleCapacity: totalTripVehicleCapacity,
          bookingStartDateIso: firstSegment.bookingStartDateIso || '',
          bookingCutOffDateIso: firstSegment.bookingCutOffDateIso || '',
          availableCabins: firstSegment.availableCabins || [],
          availableSeatTypes: [],
          meals: [],

          type: t.type,
          segments: mappedSegments,
          totalDurationMinutes: t.total_duration_minutes,
          totalLayoverMinutes: t.total_layover_minutes,
          intermediatePorts: t.intermediate_ports
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

