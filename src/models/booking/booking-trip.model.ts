import { ITrip } from '../shipping-line/trip.model';
import { IBookingTripPassenger } from './booking-trip-passenger.model';
import { IBookingTripVehicle } from './booking-trip-vehicle.model';

export interface IBookingTrip {
  bookingId: string;
  tripId: number;
  /** booking_trips.id — the per-leg row id; required to target a leg in round-trip rebook/transfer flows. */
  bookingTripId?: string | null;
  trip?: ITrip;
  direction?: 'departure' | 'return';

  bookingTripPassengers?: IBookingTripPassenger[];
  bookingTripVehicles?: IBookingTripVehicle[];
  bookingTripCargos?: any[]; // Using any for now as IBookingTripCargo is not yet defined, or I can define it if I know the structure.
}
