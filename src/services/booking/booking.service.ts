import { BOOKING_API } from 'constants/api';
import { getAllShippingLines } from '../shipping-line/shipping-line.service';
import { getVehicleType } from './vehicle-type.service';
import { fetchItem } from 'helpers/cache.helpers';
import { IBooking, IBookingTripPassenger, IBookingTripVehicle } from '@/models';
// import { PaginatedRequest, PaginatedResponse } from 'http/pagination';

export async function createTentativeBooking(tempBooking: IBooking): Promise<IBooking> {
  await new Promise(resolve => setTimeout(resolve, 500));

  if (tempBooking.bookingTrips === undefined || tempBooking.bookingTrips.length === 0) {
    throw new Error('Booking must have at least one trip');
  }

  // Simulate server-side processing
  const booking: IBooking = {
    ...tempBooking,
    id: String(Math.floor(Math.random() * 10000)), // Generate random ID
    referenceNo: `REF-${Math.floor(Math.random() * 10000)}`,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Pending',
    createdAtIso: new Date().toISOString(),
    isBookingRequest: false,
    shippingLineId: 3,
    bookingType: 'Single',
    totalPrice: 1000,
    // Mock other required fields if necessary
  };

  return booking;
}

export async function getBookingById(bookingId: string): Promise<IBooking> {
  await new Promise(resolve => setTimeout(resolve, 300));
  // Return a dummy booking or null. For a smoother demo, we can return a generic dummy booking
  return {
    id: String(bookingId),
    referenceNo: `REF-${bookingId}`,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Pending',
    createdAtIso: new Date().toISOString(),
    isBookingRequest: false,
    bookingType: 'Single',
    totalPrice: 1000,
    contactEmail: 'demo@ayahay.com',
    contactMobile: '09171234567',
    shippingLineId: 3,
    bookingTrips: [
      {
        id: 1,
        bookingId: Number(bookingId),
        tripId: 101,
        // Add minimal required fields to prevent crashes
        bookingTripPassengers: [],
        bookingTripVehicles: []
      }
    ]
  } as any as IBooking;
}


// export async function getMyBookings(
//   pagination: PaginatedRequest
// ): Promise<PaginatedResponse<IBooking> | undefined> {
//   // Mock implementation if uncommented in future
//   return { total: 0, data: [] };
// }

export async function getSavedBookingsInBrowser(): Promise<IBooking[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
}

export async function requestBooking(tentativeBookingId: number, contactEmail?: string): Promise<IBooking | undefined> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: String(tentativeBookingId),
    bookingStatus: 'Confirmed',
    contactEmail,
    paymentStatus: 'Pending',
    createdAtIso: new Date().toISOString(),
    isBookingRequest: true,
    shippingLineId: 3,
    bookingType: 'Single',
    totalPrice: 1000,
    referenceNo: `REF-${tentativeBookingId}`
  } as any as IBooking;
}

export async function getBookingRequestById(tempBookingId: number): Promise<IBooking | undefined> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    id: String(tempBookingId),
    bookingStatus: 'Confirmed',
    paymentStatus: 'Pending',
    createdAtIso: new Date().toISOString(),
    isBookingRequest: true,
    bookingType: 'Single',
    totalPrice: 1000,
    shippingLineId: 3,
    referenceNo: `REF-${tempBookingId}`
  } as any as IBooking;
}

export async function getBookingTripPassengerById(
  bookingId: string,
  tripId: number,
  passengerId: number
): Promise<IBookingTripPassenger | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return undefined;
}

export async function getBookingTripVehicleById(
  bookingId: string,
  tripId: number,
  vehicleId: number
): Promise<IBookingTripVehicle | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return undefined;
}
