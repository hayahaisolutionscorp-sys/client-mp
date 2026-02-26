import TripSummary from '@/components/booking/passenger-details/TripSummary';
import { prepareBooking } from '@/services/booking/booking.service';
import { getShip } from '@/services/shipping-line/ship.service';
import { ITrip } from '@/models';
import { ITripSummary } from '@/models/booking/prepare-booking.model';

interface PassengerDetailsContentProps {
  departureTripId?: string;
  returnTripId?: string;
  departureCabinName?: string;
  departureCabinId?: string;
  returnCabinName?: string;
  returnCabinId?: string;
  commodityId?: string;
}

export default async function PassengerDetailsContent({
  departureTripId,
  returnTripId,
  departureCabinName,
  departureCabinId,
  returnCabinName,
  returnCabinId,
  commodityId
}: PassengerDetailsContentProps) {
  let initialDepartureTrips: ITrip[] = [];
  let initialReturnTrips: ITrip[] = [];
  let prepareBookingData;

  try {
    const response = await prepareBooking({
      departure: departureTripId ? [departureTripId] : [],
      return: returnTripId ? [returnTripId] : [],
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
    seatSelection: false,
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
    srcPort: { name: summary.origin } as any,
    destPort: { name: summary.destination } as any,
    ship: {
      id: summary.ship.id,
      name: summary.ship.name,
      shippingLineId: shippingLineId,
      vehicle_capacities: vehicleCapacities,
    } as any
  } as ITrip;
}
