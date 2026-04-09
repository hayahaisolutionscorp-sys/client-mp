import TripSummary from '@/components/booking/passenger-details/TripSummary';
import CrossTenantTripSummary from '@/components/booking/passenger-details/CrossTenantTripSummary';
import { prepareBooking } from '@/services/booking/booking.service';
import { getShip } from '@/services/shipping-line/ship.service';
import { ITrip } from '@/models';
import { ITripSummary, IPrepareBookingData } from '@/models/booking/prepare-booking.model';

interface PassengerDetailsContentProps {
  departureTripId?: string;
  returnTripId?: string;
  departureCabinName?: string;
  departureCabinId?: string;
  returnCabinName?: string;
  returnCabinId?: string;
  shippingLineId?: string;
  commodityId?: string;
  isCrossTenant?: boolean;
  legTripIds?: string[];
  shippingLineIds?: string[];
  legReturnTripIds?: string[];
}

export default async function PassengerDetailsContent({
  departureTripId,
  returnTripId,
  departureCabinName,
  departureCabinId,
  returnCabinName,
  returnCabinId,
  shippingLineId,
  commodityId,
  isCrossTenant,
  legTripIds,
  shippingLineIds,
  legReturnTripIds
}: PassengerDetailsContentProps) {
  // Cross-tenant connecting trip: two separate prepareBooking calls
  if (isCrossTenant && legTripIds && legTripIds.length >= 2 && shippingLineIds && shippingLineIds.length >= 2) {
    return renderCrossTenant({
      legTripIds,
      shippingLineIds,
      departureCabinName,
      departureCabinId,
      commodityId,
      legReturnTripIds
    });
  }

  // Standard flow (direct or same-tenant connecting)
  // Normalize pipe-separated shippingLineId (e.g. "44|44") to a single value
  const normalizedShippingLineId = shippingLineId?.split('|')[0];

  let initialDepartureTrips: ITrip[] = [];
  let initialReturnTrips: ITrip[] = [];
  let prepareBookingData;

  try {
    const response = await prepareBooking({
      departure: departureTripId ? [departureTripId] : [],
      return: returnTripId ? [returnTripId] : [],
    }, commodityId, undefined, normalizedShippingLineId);

    if (response.data) {
      prepareBookingData = response.data;

      const departurePromises = (response.data.departure || []).map(async (tripSummary) => {
        const ship = await getShip(tripSummary.ship.id);
        return mapTripSummaryToTrip(tripSummary, ship?.shippingLineId);
      });

      const returnPromises = (response.data.return || []).map(async (tripSummary) => {
        const ship = await getShip(tripSummary.ship.id);
        return mapTripSummaryToTrip(tripSummary, ship?.shippingLineId);
      });

      [initialDepartureTrips, initialReturnTrips] = await Promise.all([
        Promise.all(departurePromises),
        Promise.all(returnPromises),
      ]);
    }
  } catch (error) {
    console.error('Failed to prepare booking:', error);
  }

  return (
    <TripSummary
      departureTripId={departureTripId}
      returnTripId={returnTripId}
      initialDepartureTrips={initialDepartureTrips}
      initialReturnTrips={initialReturnTrips}
      prepareBookingData={prepareBookingData}
      departureCabinName={departureCabinName}
      departureCabinId={departureCabinId}
      returnCabinName={returnCabinName}
      returnCabinId={returnCabinId}
      shippingLineId={normalizedShippingLineId}
      commodityId={commodityId}
    />
  );
}

async function renderCrossTenant({
  legTripIds,
  shippingLineIds,
  departureCabinName,
  departureCabinId,
  commodityId,
  legReturnTripIds
}: {
  legTripIds: string[];
  shippingLineIds: string[];
  departureCabinName?: string;
  departureCabinId?: string;
  commodityId?: string;
  legReturnTripIds?: string[];
}) {
  const cabinNames = (departureCabinName || '').split('|');
  const cabinIds = (departureCabinId || '').split('|');

  type LegData = {
    shippingLineId: string;
    tripId: string;
    returnTripId?: string;
    trips: ITrip[];
    returnTrips: ITrip[];
    prepareBookingData: IPrepareBookingData | undefined;
    cabinName: string;
    cabinId: string;
  };

  const legs: LegData[] = [];

  // Fetch prepareBooking for each leg in parallel (with return trips if available)
  const responses = await Promise.allSettled(
    legTripIds.map((tripId, index) => {
      const returnId = legReturnTripIds?.[index];
      return prepareBooking(
        { departure: [tripId], return: returnId ? [returnId] : [] },
        commodityId,
        undefined,
        shippingLineIds[index]
      );
    })
  );

  for (let i = 0; i < legTripIds.length; i++) {
    const result = responses[i];
    let trips: ITrip[] = [];
    let returnTrips: ITrip[] = [];
    let pbData: IPrepareBookingData | undefined;

    if (result.status === 'fulfilled' && result.value.data) {
      pbData = result.value.data;
      const depPromises = (result.value.data.departure || []).map(async (tripSummary) => {
        const ship = await getShip(tripSummary.ship.id);
        return mapTripSummaryToTrip(tripSummary, ship?.shippingLineId);
      });
      const retPromises = (result.value.data.return || []).map(async (tripSummary) => {
        const ship = await getShip(tripSummary.ship.id);
        return mapTripSummaryToTrip(tripSummary, ship?.shippingLineId);
      });
      [trips, returnTrips] = await Promise.all([
        Promise.all(depPromises),
        Promise.all(retPromises)
      ]);
    } else if (result.status === 'rejected') {
      console.error(`Failed to prepare booking for leg ${i + 1}:`, result.reason);
    }

    legs.push({
      shippingLineId: shippingLineIds[i],
      tripId: legTripIds[i],
      returnTripId: legReturnTripIds?.[i],
      trips,
      returnTrips,
      prepareBookingData: pbData,
      cabinName: cabinNames[i] || cabinNames[0] || '',
      cabinId: cabinIds[i] || cabinIds[0] || ''
    });
  }

  return (
    <CrossTenantTripSummary
      legs={legs}
      departureCabinName={departureCabinName}
      departureCabinId={departureCabinId}
      commodityId={commodityId}
    />
  );
}

function mapTripSummaryToTrip(summary: ITripSummary, shippingLineId: number = 0): ITrip {
  const vehicleCapacities = summary.ship.vehicle_capacities;

  const availableVehicleCapacity = vehicleCapacities
    ? Object.values(vehicleCapacities.remaining).reduce((a, b) => a + b, 0)
    : 0;

  const vehicleCapacity = vehicleCapacities
    ? Object.values(vehicleCapacities.max).reduce((a, b) => a + b, 0)
    : 0;

  return {
    id: summary.id,
    referenceNo: '', // Not in summary
    shipId: summary.ship.id,
    shippingLineId: shippingLineId,
    srcPortId: 0, // Not in summary
    destPortId: 0, // Not in summary
    rateTableId: 0, // Not in summary
    allowOnlineBooking: true,
    status: summary.status as any,
    arrivalTimeDateIso: summary.scheduled_arrival,
    departureDateIso: summary.scheduled_departure,
    seatSelection: summary.ship?.has_seatmap ?? false,
    availableVehicleCapacity,
    remainingVehicleCapacity: vehicleCapacities?.remaining,
    vehicleCapacity,
    bookingStartDateIso: '',
    bookingCutOffDateIso: '',
    availableCabins: summary.ship.cabins.map(c => ({
      tripId: Number(summary.id) || 0,
      cabinId: c.id,
      availablePassengerCapacity: c.remaining_capacity,
      passengerCapacity: c.capacity,
      adultFare: 0,
      cabin: {
        id: c.id,
        name: c.name,
        cabinTypeId: c.cabin_type_id,
        cabin_type_name: c.name,
        description: '',
        isAircon: false // Default
      }
    })) as any,
    availableSeatTypes: [],
    meals: [],
    type: 'direct',
    segments: [],
    totalDurationMinutes: 0,
    totalLayoverMinutes: 0,
    intermediatePorts: [],
    // Map objects
    srcPort: {
      name: summary.origin,
      municipality: summary.origin_municipality,
      province: summary.origin_province
    } as any,
    destPort: {
      name: summary.destination,
      municipality: summary.destination_municipality,
      province: summary.destination_province
    } as any,
    ship: {
      id: summary.ship.id,
      name: summary.ship.name,
      shippingLineId: shippingLineId,
      vehicle_capacities: vehicleCapacities,
    } as any
  } as ITrip;
}
