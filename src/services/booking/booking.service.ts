import { BOOKING_API } from 'constants/api';
import { getAllShippingLines } from '../shipping-line/shipping-line.service';
import { getVehicleType } from './vehicle-type.service';
import { fetchItem } from 'helpers/cache.helpers';
import { IBooking, IBookingTripPassenger, IBookingTripVehicle } from '@/models';
// import { PaginatedRequest, PaginatedResponse } from 'http/pagination';

export async function createTentativeBooking(tempBooking: IBooking): Promise<IBooking> {
  if (tempBooking.bookingTrips === undefined || tempBooking.bookingTrips.length === 0) {
    throw new Error('Booking must have at least one trip');
  }

  for (const bookingTrip of tempBooking.bookingTrips) {
    const { bookingTripPassengers: passengers, bookingTripVehicles: vehicles } = bookingTrip;
    const vehicleIds = new Set<number>();
    if (vehicles !== undefined) {
      for (const bookingTripVehicle of vehicles) {
        if (bookingTripVehicle.vehicle === undefined) {
          continue;
        }
        vehicleIds.add(bookingTripVehicle.vehicleId);
        // TODO: remove these after file upload has been properly implemented
        bookingTripVehicle.vehicle.certificateOfRegistrationUrl ??= '';
        bookingTripVehicle.vehicle.officialReceiptUrl ??= '';
        bookingTripVehicle.vehicle.modelYear = 0;

        bookingTripVehicle.vehicle.vehicleType = await getVehicleType(bookingTripVehicle.vehicle.vehicleTypeId);
      }
    }

    if (passengers !== undefined) {
      clearNonExistingVehiclesInPassengers(passengers, vehicleIds);
    }
  }

  // Request with fetch API
  const response = await fetch(`${BOOKING_API}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tempBooking)
  });

  if (!response.ok) {
    throw new Error(`Failed to create booking: ${response.statusText}`);
  }

  const booking: IBooking = await response.json();
  const shippingLines = await getAllShippingLines();
  const shippingLine = shippingLines?.find(({ id }) => booking.shippingLineId === id);

  booking.bookingTrips?.forEach(({ bookingTripPassengers }) =>
    bookingTripPassengers?.forEach((tripPassenger) => {
      if (!tripPassenger?.seat) {
        return;
      }
      tripPassenger.seat.seatType = shippingLine?.seatTypes?.find(({ id }) => tripPassenger.seat?.seatTypeId === id);
    })
  );

  return booking;
}

function clearNonExistingVehiclesInPassengers(bookingTripPassengers: IBookingTripPassenger[], vehicleIds: Set<number>) {
  for (const bookingTripPassenger of bookingTripPassengers) {
    if (bookingTripPassenger.drivesVehicleId === undefined) {
      continue;
    }
    if (!vehicleIds.has(bookingTripPassenger.drivesVehicleId)) {
      bookingTripPassenger.drivesVehicleId = undefined;
    }
  }
}

export async function getBookingById(bookingId: string): Promise<IBooking> {
  const response = await fetch(`${BOOKING_API}/${bookingId}`);

  if (!response.ok) {
    // Throw an error with the status and message
    const error = new Error(`Failed to fetch booking: ${response.status}`);
    (error as any).status = response.status; // Attach status code to the error
    throw error;
  }

  return response.json();
}

// export async function getMyBookings(
//   pagination: PaginatedRequest
// ): Promise<PaginatedResponse<IBooking> | undefined> {
//   const authToken = await firebase.currentUser?.getIdToken();
//   if (!authToken) {
//     return {
//       total: 0,
//       data: [],
//     };
//   }

//   const query = new URLSearchParams(pagination as any).toString();

//   try {
//     const response = await fetch(`${BOOKING_API}/mine?${query}`, {
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//     });

//     if (!response.ok) {
//       console.error(`Failed to fetch my bookings: ${response.status}`);
//       return {
//         total: 0,
//         data: [],
//       };
//     }

//     return response.json();
//   } catch (e) {
//     console.error(e);
//     return {
//       total: 0,
//       data: [],
//     };
//   }
// }

export async function getSavedBookingsInBrowser(): Promise<IBooking[] | undefined> {
  const savedBookingIds = fetchItem<string[]>('saved-bookings');
  if (!savedBookingIds) return;

  try {
    const commaSeparatedBookingIds = savedBookingIds.join(',');
    const response = await fetch(`${BOOKING_API}/public?ids=${commaSeparatedBookingIds}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch saved bookings: ${response.status}`);
    }

    return response.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function requestBooking(tentativeBookingId: number, contactEmail?: string): Promise<IBooking | undefined> {
  try {
    const response = await fetch(`${BOOKING_API}/requests/${tentativeBookingId}/create`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: contactEmail ? JSON.stringify({ email: contactEmail }) : undefined
    });

    if (!response.ok) {
      console.error(`Failed to request booking: ${response.status}`);
      return undefined;
    }

    return response.json();
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function getBookingRequestById(tempBookingId: number): Promise<IBooking | undefined> {
  const response = await fetch(`${BOOKING_API}/requests/${tempBookingId}`);
  if (!response.ok) {
    console.error(`Failed to fetch booking request: ${response.status}`);
    return undefined;
  }
  return response.json();
}

export async function getBookingTripPassengerById(
  bookingId: string,
  tripId: number,
  passengerId: number
): Promise<IBookingTripPassenger | undefined> {
  const response = await fetch(`${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}`);

  if (!response.ok) {
    console.error(`Failed to fetch trip passenger: ${response.status}`);
    return undefined;
  }
  return response.json();
}

export async function getBookingTripVehicleById(
  bookingId: string,
  tripId: number,
  vehicleId: number
): Promise<IBookingTripVehicle | undefined> {
  const response = await fetch(`${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}`);

  if (!response.ok) {
    console.error(`Failed to fetch trip vehicle: ${response.status}`);
    return undefined;
  }
  return response.json();
}
