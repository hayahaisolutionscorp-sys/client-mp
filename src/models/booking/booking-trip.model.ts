import { ITrip } from '../shipping-line/trip.model';
import { IBookingTripPassenger } from './booking-trip-passenger.model';
import { IBookingTripVehicle } from './booking-trip-vehicle.model';

export interface IBookingTrip {
  bookingId: string;
  tripId: number;
  trip?: ITrip;

  bookingTripPassengers?: IBookingTripPassenger[];
  bookingTripVehicles?: IBookingTripVehicle[];
}
