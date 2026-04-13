import { TRIP_API, CORE_API_URL } from 'constants/api';
import { toPhilippinesTime } from 'helpers/date.helpers';

import { getAllCabinTypes } from './cabin-type.service';
import { getAllShippingLinesServer } from './shipping-line.service';
import { fetchTripsViaSSE } from './sse-trips.service';
import { IS_CLIENT } from 'constants/api';
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

    if (!IS_CLIENT) {
      // V2 Server API Mode (SSE)
      return await fetchTripsViaSSE(CORE_API_URL, searchQuery, pagination.page || 1);
    }

    const res = await fetch(`${TRIP_API}/marketplace?${params.toString()}`, {
      cache: 'no-store'
    });

    if (res.ok) {
      const responseData = await res.json();
      const rawTrips = responseData.data || [];
      const allRates = responseData.rates || {};
      const lightLogo = responseData.logo || responseData.light_logo;

      const mappedTrips: ITrip[] = rawTrips.map((t: any) => {
        const isConnecting = t.type === 'connecting';

        // Connecting trips use `legs`; direct trips use `segments`
        const segmentsToMap: any[] = isConnecting && t.legs ? t.legs : (t.segments || []);

        const mappedSegments = segmentsToMap.map((seg: any) => {
          // Each leg of a connecting trip wraps its actual data in a nested segments[0]
          const actualSegment = seg.segments && Array.isArray(seg.segments) && seg.segments.length > 0
            ? seg.segments[0]
            : seg;

          let segRatesMap = new Map<string, number>();
          let rateSnapshotId = 0;

          if (isConnecting) {
            // Connecting trip segments carry rates directly
            const passengerRates = actualSegment.passenger_rates || seg.passenger_rates || [];
            rateSnapshotId = actualSegment.rate_table_id || seg.rate_table_id || 0;
            if (Array.isArray(passengerRates)) {
              passengerRates.forEach((rate: any) => {
                if (rate.passenger_type_code === 'ADULT' && rate.accom_code) {
                  segRatesMap.set(rate.accom_code.toUpperCase(), parseFloat(rate.amount));
                }
              });
            }
          } else {
            // Direct trips look up rates from the top-level allRates map by route code
            const routeCode = `${actualSegment.source_port_code}-${actualSegment.destination_port_code}`;
            const routeRates = allRates[routeCode] || {};
            const passengerRates = routeRates.passenger_rates || [];
            rateSnapshotId = routeRates.snapshot?.id ? parseInt(routeRates.snapshot.id, 10) : 0;
            if (Array.isArray(passengerRates)) {
              passengerRates.forEach((rate: any) => {
                if (rate.passenger_type_code === 'ADULT' && rate.accom_code) {
                  segRatesMap.set(rate.accom_code.toUpperCase(), parseFloat(rate.amount));
                }
              });
            }
          }

          const segCabins = actualSegment.cabins || seg.cabins || [];
          const availableCabins: any[] = segCabins
            .map((c: any) => {
              const lookupKey =
                (c.code || c.cabin_type_code || c.cabin_type_name || '')
                  .toString()
                  .trim()
                  .toUpperCase();
              const adultFare = segRatesMap.get(lookupKey);

              if (adultFare === undefined) return null;

              const segCabinCapacities = actualSegment.cabin_capacities || seg.cabin_capacities || {};
              const segRemainingPassengers = actualSegment.remaining_capacities?.passengers || seg.remaining_capacities?.passengers || {};
              const cabinInfo = segCabinCapacities[c.name] || segCabinCapacities[c.cabin_type_name] || {};

              const availableCap = typeof cabinInfo === 'number' 
                ? cabinInfo 
                : (cabinInfo.remaining ?? segRemainingPassengers[c.name] ?? segRemainingPassengers[c.cabin_type_name] ?? c.remaining_capacity ?? c.max_passenger_capacity);
              
              const totalCap = cabinInfo.max ?? c.capacity ?? c.max_passenger_capacity;

              return {
                tripId: t.id,
                cabinId: c.id,
                cabin: {
                  id: c.id,
                  shipId: actualSegment.ship_id || seg.ship_id,
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
                availablePassengerCapacity: availableCap,
                passengerCapacity: totalCap,
                adultFare: adultFare
              };
            })
            .filter((c: any) => c !== null);

          const remainingVehicles = actualSegment.remaining_capacities?.vehicles || seg.remaining_capacities?.vehicles || {};
          const totalVehicleCapacity = Object.values(remainingVehicles).reduce((sum: number, val: any) => sum + (val || 0), 0);

          return {
            id: seg.id || actualSegment.id,
            tripId: t.id,
            shipId: actualSegment.ship_id || seg.ship_id,
            shipName: actualSegment.ship_name || seg.ship_name,
            shippingLineId: actualSegment.shipping_line_id || seg.shipping_line_id || 0,
            shippingLine: actualSegment.shipping_line || seg.shipping_line,
            srcPortId: 0,
            srcPortName: actualSegment.source_port_name || seg.source_port_name || seg.origin_name,
            destPortId: 0,
            destPortName: actualSegment.destination_port_name || seg.destination_port_name || seg.destination_name,
            departureDateIso: actualSegment.scheduled_departure || seg.scheduled_departure || seg.total_departure_time,
            arrivalTimeDateIso: actualSegment.scheduled_arrival || seg.scheduled_arrival || seg.total_arrival_time,
            referenceNo: actualSegment.reference_number || seg.reference_number || '',
            availableCabins: availableCabins,
            availableVehicleCapacity: totalVehicleCapacity,
            remainingVehicleCapacity: remainingVehicles,
            vehicleCapacity: totalVehicleCapacity,
            bookingStartDateIso: actualSegment.booking_start_date || seg.booking_start_date,
            bookingCutOffDateIso: actualSegment.booking_cut_off_date || seg.booking_cut_off_date,
            seatSelection: actualSegment.is_seat_can_be_selected || seg.is_seat_can_be_selected || false,
            rateTableId: rateSnapshotId,
            status: actualSegment.status || seg.status || 'pending'
          };
        });

        const firstSegment = mappedSegments[0] || {};
        const totalTripVehicleCapacity = mappedSegments.length > 0
          ? Math.min(...mappedSegments.map((s: any) => s.availableVehicleCapacity))
          : 0;

        // For connecting trips, the logo lives on each leg rather than a top-level field
        const connectingLogo = isConnecting && t.legs?.[0]?.logo;

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
          lightLogoUrl: connectingLogo || lightLogo,
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

