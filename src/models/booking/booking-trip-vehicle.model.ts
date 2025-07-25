import { ITrip } from '../shipping-line/trip.model';
import { IVehicle } from '../vehicle/vehicle.model';
import { IBookingPaymentItem } from './booking-payment-item.model';
import { BOOKING_CANCELLATION_TYPE } from 'constants/enum';
import { IBooking } from './booking.model';

export interface IBookingTripVehicle {
  bookingId: string;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  vehicleId: number;
  vehicle?: IVehicle;

  totalPrice?: number;
  priceWithoutMarkup?: number;
  checkInDate?: string;
  removedReason?: string;
  removedReasonType?: keyof typeof BOOKING_CANCELLATION_TYPE;
  bookingPaymentItems?: IBookingPaymentItem[];
}
