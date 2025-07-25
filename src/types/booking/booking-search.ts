import { BOOKING_STATUS, DISCOUNT_TYPE } from 'constants/enum';
import { IBookingTripVehicle } from '@/models';

export interface VehicleBookings {
  id: string;
  referenceNo: string;
  totalPrice: number;
  bookingTripVehicles: IBookingTripVehicle[];
}

export interface PassengerBookingSearchResponse {
  bookingId: string;
  tripId: number;
  passengerId: number;
  bookingStatus: keyof typeof BOOKING_STATUS;
  tripDepartureDateIso: string;
  tripSrcPortName: string;
  tripDestPortName: string;
  firstName: string;
  lastName: string;
  discountType: keyof typeof DISCOUNT_TYPE;
  checkInDateIso: string;
  referenceNo: string;
}

export interface VehicleBookingSearchResponse {
  bookingId: string;
  tripId: number;
  vehicleId: number;
  bookingStatus: keyof typeof BOOKING_STATUS;
  tripDepartureDateIso: string;
  tripSrcPortName: string;
  tripDestPortName: string;
  modelName: string;
  plateNo: string;
  modelYear: number;
  checkInDateIso: string;
  referenceNo: string;
}
