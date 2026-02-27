import { BOOKING_API } from 'constants/api';
import { getAllShippingLines } from '../shipping-line/shipping-line.service';
import { getVehicleType } from './vehicle-type.service';
import { fetchItem } from 'helpers/cache.helpers';
import { IBooking, IBookingTripPassenger, IBookingTripVehicle } from '@/models';
import { IPrepareBookingResponse } from '@/models/booking/prepare-booking.model';
import axios from '@/services/core/axios';
// import { PaginatedRequest, PaginatedResponse } from 'http/pagination';

export async function createBooking(payload: any): Promise<any> {
  try {
    const { data } = await axios.post(BOOKING_API, payload);
    return data;
  } catch (e) {
    console.error('Error creating booking:', e);
    throw e;
  }
}

export async function createTentativeBooking(booking: IBooking): Promise<IBooking> {
  try {
    const { data } = await axios.post(BOOKING_API, booking);
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function getBookingById(bookingId: string): Promise<{ booking: IBooking; raw: any }> {
  try {
    const { data } = await axios.get(`${BOOKING_API}/${bookingId}`);
    // Support both {data: {...}} and direct object response shapes
    const raw = data?.data ?? data;
    if (!raw || !raw.id) {
      throw new Error(`Unexpected booking response shape: ${JSON.stringify(data)}`);
    }
    return { booking: mapBookingData(raw), raw };
  } catch (e) {
    console.error('[getBookingById] failed:', e);
    throw e;
  }
}

/**
 * Maps snake_case API response to camelCase IBooking model
 */
export function mapBookingData(raw: any): IBooking {
  if (!raw) throw new Error('mapBookingData: raw booking data is null/undefined');

  const mapTrip = (t: any, direction?: 'departure' | 'return') => ({
    tripId: t.id || t.trip_id,
    direction,
    trip: {
      id: t.id || t.trip_id,
      srcPort: { name: t.origin || t.route_code?.split('-')[0] },
      destPort: { name: t.destination || t.route_code?.split('-')[1] },
      departureDateIso: t.departure,
      arrivalDateIso: t.arrival,
      ship: { name: t.ship_name || raw.ships_used },
      shippingLine: { name: t.shipping_line_name || raw.brand_name } // fallback
    },
    bookingTripPassengers: (t.passengers || []).map((p: any) => ({
      id: p.booking_trip_passenger_id,
      discountType: p.discount_type,
      price: p.price,
      cabin: { name: p.cabin || p.accommodation },
      passenger: {
        firstName: p.first_name,
        lastName: p.last_name,
        sex: p.sex,
        birthday: p.birthday,
        nationality: p.nationality,
        email: p.email,
        mobileNumber: p.mobile_number || p.mobileNumber
      }
    })),
    bookingTripVehicles: (t.vehicles || []).map((v: any) => ({
      price: v.price,
      vehicle: {
        plateNo: v.plate_no || v.plate_number || v.plateNumber,
        make: v.make,
        model: v.model,
        vehicleType: { name: v.type || v.vehicle_type || v.vehicleType?.name },
        plateNumber: v.plate_number || v.plate_no || v.plateNumber,
        modelName: [v.make, v.model].filter(Boolean).join(' ') || undefined,
        modelBody: v.type || v.vehicle_type || undefined,
      }
    })),
    bookingTripCargos: (t.cargos || t.cargo || []).map((c: any) => ({
      price: c.price,
      quantity: c.quantity,
      commodity: { name: c.description || c.commodity_name || 'Cargo' }
    }))
  });

  let bookingTrips: any[] = [];
  if (Array.isArray(raw.trips)) {
    const rawTrips = raw.trips || [];
    const depTrips = rawTrips
      .filter((t: any) => t.type === 'departure' || !t.type)
      .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
      .map((t: any) => mapTrip(t, 'departure'));

    const retTrips = rawTrips
      .filter((t: any) => t.type === 'return')
      .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
      .map((t: any) => mapTrip(t, 'return'));

    bookingTrips = [...depTrips, ...retTrips];
  } else {
    bookingTrips = [
      ...(raw.trips?.departure || [])
        .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
        .map((t: any) => mapTrip(t, 'departure')),
      ...(raw.trips?.return || [])
        .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
        .map((t: any) => mapTrip(t, 'return'))
    ];
  }

  return {
    id: raw.id,
    referenceNo: raw.reference_no,
    bookingStatus: raw.booking_status,
    paymentStatus: (raw.payment_status || 'pending').toLowerCase() as any,
    totalPrice: parseFloat(raw.total_price),
    priceWithoutMarkup: parseFloat(raw.price_without_markup || raw.total_price),
    bookingType: raw.booking_type,
    contactEmail: raw.contact_email || raw.email || (raw.trips?.departure?.[0]?.passengers?.[0]?.email),
    contactMobile: raw.contact_mobile || raw.mobile || (raw.trips?.departure?.[0]?.passengers?.[0]?.mobile_number) || (raw.trips?.departure?.[0]?.passengers?.[0]?.mobileNumber),
    createdAtIso: raw.booking_created_at || raw.booking_date,
    consigneeName: raw.consignee_name || raw.booked_by_name || (bookingTrips[0]?.bookingTripPassengers?.[0]?.passenger?.firstName + ' ' + bookingTrips[0]?.bookingTripPassengers?.[0]?.passenger?.lastName),
    bookingTrips: bookingTrips as any,
    isBookingRequest: false,
    shippingLineId: 0,
  } as IBooking;
}

export async function getMyBookings(): Promise<{ results: IBooking[]; total: number }> {
  try {
    const { data } = await axios.get(`${BOOKING_API}/me`);
    const results = (data.data.results || []).map((b: any) => mapBookingData(b));
    return {
      results,
      total: data.data.total
    };
  } catch (e) {
    console.error('Error fetching my bookings:', e);
    throw e;
  }
}

export async function getSavedBookingsInBrowser(): Promise<IBooking[] | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return [];
}

export async function requestBooking(tentativeBookingId: number, contactEmail?: string): Promise<IBooking | undefined> {
  // try {
  //   const { data } = await axios.post(`${BOOKING_API}/request`, { tentativeBookingId, contactEmail });
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

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
  // try {
  //   const { data } = await axios.get(`${BOOKING_API}/request/${tempBookingId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

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
  // try {
  //   const { data } = await axios.get(`${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${passengerId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return undefined;
}

export async function getBookingTripVehicleById(
  bookingId: string,
  tripId: number,
  vehicleId: number
): Promise<IBookingTripVehicle | undefined> {
  // try {
  //   const { data } = await axios.get(`${BOOKING_API}/${bookingId}/trips/${tripId}/vehicles/${vehicleId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 100));
  return undefined;
}


export async function prepareBooking(
  tripIds: { departure: string[]; return?: string[] },
  commodityId?: string,
  headers?: HeadersInit
): Promise<IPrepareBookingResponse> {
  try {
    const queryParams = new URLSearchParams();

    const appendIds = (key: string, ids: string[]) => {
      ids.forEach(id => {
        const strId = String(id);
        const uuids = strId.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g);
        if (uuids && uuids.length > 1) {
          uuids.forEach(u => queryParams.append(key, u));
        } else if (!uuids && strId.includes('-') && strId.split('-').every(part => !isNaN(Number(part)))) {
          strId.split('-').forEach(part => queryParams.append(key, part));
        } else {
          queryParams.append(key, strId);
        }
      });
    };

    if (tripIds.departure.length > 0) {
      appendIds('departure', tripIds.departure);
    }
    if (tripIds.return && tripIds.return.length > 0) {
      appendIds('return', tripIds.return);
    }
    if (commodityId) {
      queryParams.append('commodity_id', commodityId);
    }

    const queryString = queryParams.toString();

    const response = await fetch(`${BOOKING_API}/prepare?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error('Error preparing booking:', e);
    throw e;
  }
}

import { PricingResponse } from '@/types/booking/pricing';

export async function calculatePricing(
  bookingState: any, // Using 'any' for now to match the TripSummary state structure, but ideally should be PricingRequest
  headers?: HeadersInit
): Promise<PricingResponse> {
  try {
    const response = await fetch(`${BOOKING_API}/pricing/from-state`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(bookingState),
    });

    if (!response.ok) {
      // Handle non-200 responses gracefully if needed, or let it throw
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error('Error calculating pricing:', e);
    throw e;
  }
}

/**
 * Derives the pricing state required for calculatePricing from a raw booking response.
 */
export function derivePricingStateFromBooking(rawBookingData: any) {
  const trips = rawBookingData.trips;
  const departureLegs = trips?.departure || (Array.isArray(trips) ? trips : []);
  const returnLegs = trips?.return || [];
  const allLegs = [...departureLegs, ...returnLegs];

  if (allLegs.length === 0) return null;

  // 1. Map routes to cabins
  // The API expects a 'route' object where keys are "ORIG-DEST" and value is the cabin type name string
  const route: Record<string, string> = {};
  allLegs.forEach(leg => {
    const key = `${leg.origin}-${leg.destination}`;
    const p = leg.passengers?.[0];
    if (p) {
      route[key] = p.cabin_type_name || p.cabinTypeName || p.cabin || p.accommodation;
    }
  });

  // 2. Passengers
  // Standardize on the first leg's passengers and ensure discount types are uppercase
  const passenger = (departureLegs[0]?.passengers || []).map((p: any) =>
    (p.discount_type || p.discountType || 'ADULT').toUpperCase()
  );

  // 3. Vehicles
  const vehicle: Record<string, any> = {};
  (departureLegs[0]?.vehicles || []).forEach((v: any, i: number) => {
    vehicle[`vehicle_${i + 1}`] = {
      vehicleTypeId: v.vehicle_type_id || v.vehicleTypeId || v.vehicleTypeId,
      plateNumber: v.plate_no || v.plateNumber || v.plate_number,
      cargo_class: v.cargo_class || v.type || v.vehicle_type || (v.vehicle?.vehicleType?.name)
    };
  });

  // 4. Cargos
  const cargo: Record<string, any> = {};
  const cargoList = departureLegs[0]?.cargos || departureLegs[0]?.cargo || [];
  cargoList.forEach((c: any, i: number) => {
    cargo[`cargo_${i + 1}`] = {
      commodityId: c.commodity_id || c.commodityId,
      quantity: c.quantity || 1,
      cargo_class: c.cargo_class || c.commodity_name || 'Cargo'
    };
  });

  return {
    route,
    passenger,
    vehicle,
    cargo
  };
}
