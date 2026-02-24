import TripSummary from '@/components/booking/passenger-details/TripSummary';
import { redirect } from 'next/navigation';
import { prepareBooking } from '@/services/booking/booking.service';
import { getShip } from '@/services/shipping-line/ship.service';
import { ITrip } from '@/models';
import { ITripSummary } from '@/models/booking/prepare-booking.model';

interface PageProps {
  searchParams?: Promise<{
    departureTripId?: string;
    departureCabinName?: string;
    departureCabinId?: string;
    returnTripId?: string;
    returnCabinName?: string;
    returnCabinId?: string;
    passengerCount?: string;
    vehicleCount?: string;
  }>;
}

export default async function PassengerDetails(props: PageProps) {
  const searchParams = await props.searchParams;

  if (!searchParams?.departureTripId) {
    redirect('/booking/destination');
  }

  const cleanTripId = (id: string | undefined) => {
    if (!id) return undefined;
    return id.replace(/^(direct-|connecting-)/, '');
  };

  const departureTripId = cleanTripId(searchParams.departureTripId);
  const returnTripId = cleanTripId(searchParams.returnTripId);

  let initialDepartureTrips: ITrip[] = [];
  let initialReturnTrips: ITrip[] = [];
  let prepareBookingData;

  try {
    const response = await prepareBooking({
      departure: departureTripId ? [departureTripId] : [],
      return: returnTripId ? [returnTripId] : [],
    });

    if (response.data) {
      prepareBookingData = response.data;
      if (response.data.departure?.length > 0) {
        for (const tripSummary of response.data.departure) {
          const ship = await getShip(tripSummary.ship.id);
          initialDepartureTrips.push(mapTripSummaryToTrip(tripSummary, ship?.shippingLineId));
        }
      }
      if (response.data.return?.length > 0) {
        for (const tripSummary of response.data.return) {
          const ship = await getShip(tripSummary.ship.id);
          initialReturnTrips.push(mapTripSummaryToTrip(tripSummary, ship?.shippingLineId));
        }
      }
    }
  } catch (error) {
    console.error('Failed to prepare booking:', error);
  }

  return (
    <div className="grid grid-cols-1 gap-4 bg-gray-50 px-3 pt-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:px-10">
      <TripSummary
        departureTripId={departureTripId}
        returnTripId={returnTripId}
        initialDepartureTrips={initialDepartureTrips}
        initialReturnTrips={initialReturnTrips}
        prepareBookingData={prepareBookingData}
        departureCabinName={searchParams.departureCabinName}
        departureCabinId={searchParams.departureCabinId}
        returnCabinName={searchParams.returnCabinName}
        returnCabinId={searchParams.returnCabinId}
      />
    </div>
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
