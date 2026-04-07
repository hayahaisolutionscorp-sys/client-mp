import { prepareBooking } from '@/services';
import { getShip } from '@/services/shipping-line/ship.service';
import { ITrip } from '@/models';
import { ITripSummary, IPrepareBookingData } from '@/models/booking/prepare-booking.model';
import PaymentConfirmationDetails from './PaymentConfirmationDetails';
import CrossTenantPaymentConfirmationDetails from './CrossTenantPaymentConfirmationDetails';

interface PaymentConfirmationContentProps {
  departureTripId?: string;
  returnTripId?: string;
  commodityId?: string;
  shippingLineId?: string;
  isCrossTenant?: boolean;
  legTripIds?: string[];
  shippingLineIds?: string[];
  legReturnTripIds?: string[];
}

export default async function PaymentConfirmationContent({
  departureTripId,
  returnTripId,
  commodityId,
  shippingLineId,
  isCrossTenant,
  legTripIds,
  shippingLineIds,
  legReturnTripIds,
}: PaymentConfirmationContentProps) {
  // Cross-tenant connecting trip: two separate prepareBooking calls
  if (isCrossTenant && legTripIds && legTripIds.length >= 2 && shippingLineIds && shippingLineIds.length >= 2) {
    return renderCrossTenant({
      legTripIds,
      shippingLineIds,
      legReturnTripIds,
      commodityId,
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
      departure: departureTripId ? departureTripId.split(',') : [],
      return: returnTripId ? returnTripId.split(',') : [],
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
    <PaymentConfirmationDetails
      departureTripId={departureTripId}
      returnTripId={returnTripId}
      commodityId={commodityId}
      shippingLineId={normalizedShippingLineId}
      initialDepartureTrips={initialDepartureTrips}
      initialReturnTrips={initialReturnTrips}
      initialPrepareBookingData={prepareBookingData}
    />
  );
}

async function renderCrossTenant({
  legTripIds,
  shippingLineIds,
  legReturnTripIds,
  commodityId,
}: {
  legTripIds: string[];
  shippingLineIds: string[];
  legReturnTripIds?: string[];
  commodityId?: string;
}) {
  type LegData = {
    shippingLineId: string;
    tripId: string;
    returnTripId?: string;
    trips: ITrip[];
    returnTrips: ITrip[];
    prepareBookingData: IPrepareBookingData | undefined;
  };

  const legs: LegData[] = [];

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
        Promise.all(retPromises),
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
    });
  }

  return (
    <CrossTenantPaymentConfirmationDetails
      legs={legs}
      commodityId={commodityId}
    />
  );
}

function mapTripSummaryToTrip(summary: ITripSummary, shippingLineId: number = 0): ITrip {
  return {
    id: summary.id,
    shipId: summary.ship.id,
    shippingLineId: shippingLineId,
    status: summary.status as any,
    arrivalTimeDateIso: summary.scheduled_arrival,
    departureDateIso: summary.scheduled_departure,
    type: 'direct',
    srcPort: { name: summary.origin } as any,
    destPort: { name: summary.destination } as any,
    ship: {
      id: summary.ship.id,
      name: summary.ship.name,
      shippingLineId: shippingLineId,
    } as any
  } as ITrip;
}
