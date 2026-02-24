import { ITrip } from '../shipping-line/trip.model';
import { IBookingTripPassenger } from './booking-trip-passenger.model';
import { IBookingTripVehicle } from './booking-trip-vehicle.model';

export interface IBookingTrip {
  bookingId: string;
  tripId: number;
  trip?: ITrip;
  direction?: 'departure' | 'return';

  bookingTripPassengers?: IBookingTripPassenger[];
  bookingTripVehicles?: IBookingTripVehicle[];
  bookingTripCargos?: any[]; // Using any for now as IBookingTripCargo is not yet defined, or I can define it if I know the structure.
}
