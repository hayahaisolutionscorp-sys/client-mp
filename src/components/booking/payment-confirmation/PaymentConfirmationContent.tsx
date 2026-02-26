import { prepareBooking } from '@/services';
import { getShip } from '@/services/shipping-line/ship.service';
import { ITrip } from '@/models';
import { ITripSummary } from '@/models/booking/prepare-booking.model';
import PaymentConfirmationDetails from './PaymentConfirmationDetails';

interface PaymentConfirmationContentProps {
  departureTripId?: string;
  returnTripId?: string;
  commodityId?: string;
}

export default async function PaymentConfirmationContent({
  departureTripId,
  returnTripId,
  commodityId
}: PaymentConfirmationContentProps) {
  let initialDepartureTrips: ITrip[] = [];
  let initialReturnTrips: ITrip[] = [];
  let prepareBookingData;

  try {
    const response = await prepareBooking({
      departure: departureTripId ? departureTripId.split(',') : [],
      return: returnTripId ? returnTripId.split(',') : [],
    }, commodityId);

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
      initialDepartureTrips={initialDepartureTrips}
      initialReturnTrips={initialReturnTrips}
      initialPrepareBookingData={prepareBookingData}
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
    type: 'direct', // Defaulting for now
    srcPort: { name: summary.origin } as any,
    destPort: { name: summary.destination } as any,
    ship: {
      id: summary.ship.id,
      name: summary.ship.name,
      shippingLineId: shippingLineId,
    } as any
  } as ITrip;
}
