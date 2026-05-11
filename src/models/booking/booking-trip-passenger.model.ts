import { IBooking } from './booking.model';
import { IBookingPaymentItem } from './booking-payment-item.model';
import { IBookingTripVehicle } from './booking-trip-vehicle.model';
import { BOOKING_CANCELLATION_TYPE, DISCOUNT_TYPE } from 'constants/enum';
import { ICabin } from '../accommodation/cabin.model';
import { ISeatType } from '../accommodation/seat-type.model';
import { ISeat } from '../accommodation/seat.model';
import { ITripCabin } from '../accommodation/trip-cabin.model';
import { ITrip } from '../shipping-line/trip.model';
import { IPassenger } from '../user-management/passenger.model';

export interface IBookingTripPassenger {
  id?: string;
  bookingId: string;
  booking?: IBooking;
  tripId: number;
  trip?: ITrip;
  passengerId: number;
  passenger?: IPassenger;
  preferredSeatTypeId?: number;
  preferredSeatType?: ISeatType;
  cabinId: number;
  cabin?: ICabin;
  tripCabin?: ITripCabin;
  /**
   * if the booking trip allows for seat selection, a
   * passenger will also be assigned a seat in the
   * cabin above.
   */
  seatId?: number;
  seat?: ISeat;
  /**
   * a passenger can choose to be a driver of a vehicle
   * in the same booking and same trip. if they are
   * a driver, their ticket fare will be reduced to 0
   * for that booking and trip
   */
  drivesVehicleId?: number;
  drivesVehicle?: IBookingTripVehicle;
  preferredCabinId?: number;
  preferredCabin?: ICabin;

  seatCellId?: string | null;
  meal?: string;
  totalPrice?: number;
  priceWithoutMarkup?: number;
  checkInDate?: string;
  /**
   * has a value if passenger is removed from the booking
   * otherwise this is undefined (or NULL in the DB)
   */
  removedReason?: string;
  // see IBooking.cancellationReasonType
  removedReasonType?: keyof typeof BOOKING_CANCELLATION_TYPE;
  discountType?: keyof typeof DISCOUNT_TYPE;

  bookingStatus?: string | null;

  paymentBreakdown?: {
    base_fare?: number;
    charges_total?: number;
    taxes_total?: number;
    charges?: Array<{ description: string; charge_code: string | null; amount: number }>;
    taxes?: Array<{ description: string; charge_code: string | null; amount: number }>;
    total?: number;
  } | null;

  bookingPaymentItems?: IBookingPaymentItem[];
}
