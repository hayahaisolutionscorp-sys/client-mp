import { BOOKING_API, CORE_API_URL, IS_CLIENT } from 'constants/api';
import { getAllShippingLines } from '../shipping-line/shipping-line.service';
import { getVehicleType } from './vehicle-type.service';
import { fetchItem } from 'helpers/cache.helpers';
import { IBooking, IBookingTripPassenger, IBookingTripVehicle } from '@/models';
import { IPrepareBookingResponse } from '@/models/booking/prepare-booking.model';
import axios from '@/services/core/axios';
// import { PaginatedRequest, PaginatedResponse } from 'http/pagination';

export async function createBooking(payload: any, shippingLineId?: string): Promise<any> {
  try {
    const url = !IS_CLIENT && shippingLineId
      ? `${BOOKING_API}?shipping_line_id=${shippingLineId}`
      : BOOKING_API;
    const { data } = await axios.post(url, payload);
    return data;
  } catch (e) {
    console.error('Error creating booking:', e);
    throw e;
  }
}

export interface RefundPreviewItem {
  description: string;
  charge_code: string | null;
  category: 'FARE' | 'CHARGES' | 'TAXES' | string;
  amount: number;
  is_refundable: boolean;
  booking_trip_passenger_id: string | null;
  booking_trip_cargo_id: string | null;
}

export interface RefundPreview {
  items: RefundPreviewItem[];
  subtotal_refundable: number;
  fault_type: string | null;
  refund_percentage: number;
  estimated_refund_total: number;
}

export async function getRefundPreview(
  bookingId: string,
  options: {
    passengerIds?: string[];
    cargoIds?: string[];
    faultType?: string;
  } = {},
): Promise<RefundPreview> {
  const params = new URLSearchParams();
  if (options.passengerIds && options.passengerIds.length > 0) {
    params.set('passenger_ids', options.passengerIds.join(','));
  }
  if (options.cargoIds && options.cargoIds.length > 0) {
    params.set('cargo_ids', options.cargoIds.join(','));
  }
  if (options.faultType) params.set('fault_type', options.faultType);
  const qs = params.toString();
  const url = `${BOOKING_API}/${bookingId}/refund-preview${qs ? `?${qs}` : ''}`;
  const { data } = await axios.get(url);
  return data?.data ?? data;
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

export async function getBookingById(bookingId: string, shippingLineId?: number): Promise<{ booking: IBooking; raw: any }> {
  try {
    if (!IS_CLIENT && !shippingLineId) {
      throw new Error('tenant_id (shipping_line_id) is required to look up bookings in this context');
    }
    const url = shippingLineId
      ? `${CORE_API_URL}/bookings/${bookingId}?shipping_line_id=${shippingLineId}`
      : `${BOOKING_API}/${bookingId}`;
    const { data } = await axios.get(url);
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

  const mapTrip = (t: any, direction?: 'departure' | 'return') => {
    // Pull the best port identifiers we can from the API response.
    // For marketplace bookings, `t.origin` / `t.destination` are typically the port codes
    // (e.g., "MNG", "TLSY") since no separate code field is returned. Treat them as code.
    const srcCode =
      t.src_port_code ??
      t.origin_code ??
      t.route_code?.split('-')[0] ??
      t.origin ??
      null;
    const destCode =
      t.dest_port_code ??
      t.destination_code ??
      t.route_code?.split('-')[1] ??
      t.destination ??
      null;
    const srcName = t.src_port_name || t.origin || srcCode;
    const destName = t.dest_port_name || t.destination || destCode;
    const srcPortId = t.src_port_id ?? t.srcPortId ?? null;
    const destPortId = t.dest_port_id ?? t.destPortId ?? null;
    return ({
    tripId: t.id || t.trip_id,
    bookingTripId: t.booking_trip_id ?? null,
    direction,
    trip: {
      id: t.id || t.trip_id,
      shippingLineId: t.shipping_line_id ?? raw.shipping_line_id ?? null,
      srcPortId,
      destPortId,
      srcPortName: srcName,
      destPortName: destName,
      srcPort: { id: srcPortId, name: srcName, code: srcCode },
      destPort: { id: destPortId, name: destName, code: destCode },
      departureDateIso: t.departure,
      arrivalDateIso: t.arrival,
      ship: { name: t.ship_name || raw.ships_used },
      shippingLine: { name: t.shipping_line_name || raw.brand_name } // fallback
    },
    bookingTripPassengers: (t.passengers || []).map((p: any) => ({
      id: p.booking_trip_passenger_id,
      discountType: p.discount_type,
      price: p.price ?? p.total_price ?? p.totalPrice,
      totalPrice: Number(p.total_price ?? p.totalPrice ?? p.price ?? 0),
      cabin: { name: p.cabin || p.accommodation },
      seatCellId: p.seatCellId ?? null,
      bookingStatus: p.booking_status ?? p.bookingStatus ?? null,
      removedReason: p.removed_reason ?? p.removedReason ?? null,
      removedReasonType: p.removed_reason_type ?? p.removedReasonType ?? null,
      paymentBreakdown: p.payment_breakdown ?? null,
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
      bookingStatus: v.booking_status ?? v.bookingStatus ?? null,
      removedReason: v.removed_reason ?? v.removedReason ?? null,
      removedReasonType: v.removed_reason_type ?? v.removedReasonType ?? null,
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
      bookingStatus: c.booking_status ?? c.bookingStatus ?? null,
      removedReason: c.removed_reason ?? c.removedReason ?? null,
      removedReasonType: c.removed_reason_type ?? c.removedReasonType ?? null,
      commodity: { name: c.description || c.commodity_name || 'Cargo' }
    }))
  });
  };

  // Hide soft-deleted booking_trips from the marketplace view. When TMS
  // transfers a booking to a new trip, the OLD booking_trip row is
  // soft-deleted (deleted_at set) and a new row is created with the moved
  // passengers/cargos. The backend's findOne returns both rows; without
  // this filter the customer sees a phantom "Depart" leg with no
  // passengers and no contact details — and a single transfer reads as a
  // round-trip.
  const isActiveTrip = (t: any) => !t.deleted_at && !t.deletedAt;

  let bookingTrips: any[] = [];
  if (Array.isArray(raw.trips)) {
    const rawTrips = (raw.trips || []).filter(isActiveTrip);
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
        .filter(isActiveTrip)
        .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
        .map((t: any) => mapTrip(t, 'departure')),
      ...(raw.trips?.return || [])
        .filter(isActiveTrip)
        .sort((a: any, b: any) => (a.sequence || 0) - (b.sequence || 0))
        .map((t: any) => mapTrip(t, 'return'))
    ];
  }

  // Expose charges/taxes from payment_breakdown so downstream UI (e.g. rebook modal)
  // can re-apply them in calculations without an extra fetch.
  const pb = raw.payment_breakdown ?? {};
  const passengersFare = Number(pb.passengers_fare ?? 0);
  const cargoFare = Number(pb.cargo_fare ?? 0);
  const chargesTotal = Number(pb.charges_total ?? 0);
  const taxesTotal = Number(pb.taxes_total ?? 0);
  const chargesBreakdown = [
    ...((pb.charges as any[]) ?? []).map((c: any) => ({
      code: c.charge_code ?? '',
      description: c.description ?? '',
      amount: Number(c.amount ?? 0),
      kind: 'charge' as const,
    })),
    ...((pb.taxes as any[]) ?? []).map((t: any) => ({
      code: t.charge_code ?? '',
      description: t.description ?? '',
      amount: Number(t.amount ?? 0),
      kind: 'tax' as const,
    })),
  ];

  return {
    id: raw.id,
    referenceNo: raw.reference_no,
    bookingStatus: raw.booking_status,
    paymentStatus: (raw.payment_status || 'pending').toLowerCase() as any,
    totalPrice: parseFloat(raw.total_price),
    priceWithoutMarkup: parseFloat(raw.price_without_markup || raw.total_price),
    paymentBreakdown: {
      passengersFare,
      cargoFare,
      chargesTotal,
      taxesTotal,
      charges: chargesBreakdown,
    },
    bookingType: raw.booking_type,
    // Pull contact fallbacks from the first ACTIVE leg's first passenger.
    // After a transfer, raw.trips.departure[0] is the old soft-deleted leg
    // (no passengers) — using bookingTrips[0] (already filtered above)
    // ensures we hit the post-transfer leg with real passengers.
    contactEmail:
      raw.contact_email ||
      raw.email ||
      bookingTrips[0]?.bookingTripPassengers?.[0]?.passenger?.email,
    contactMobile:
      raw.contact_mobile ||
      raw.mobile ||
      bookingTrips[0]?.bookingTripPassengers?.[0]?.passenger?.mobileNumber,
    createdAtIso: raw.booking_created_at || raw.booking_date,
    consigneeName: raw.consignee_name || raw.booked_by_name || (bookingTrips[0]?.bookingTripPassengers?.[0]?.passenger?.firstName + ' ' + bookingTrips[0]?.bookingTripPassengers?.[0]?.passenger?.lastName),
    bookingTrips: bookingTrips as any,
    isBookingRequest: false,
    shippingLineId: 0,
    gatewayCode: raw.gateway_code ?? raw.payments?.find?.((p: any) =>
      p?.gateway_code && ['paymongo', 'maya'].includes(String(p.gateway_code).toLowerCase()),
    )?.gateway_code ?? undefined,
    // Prefer epayment_method (the sub-method, e.g. 'GCash' / 'PayMaya' /
    // 'OnlineBanking' / 'QRPh' / 'GrabPay' / 'Maya' for card) over
    // payment_method (which is just the high-level type 'ONLINE' / 'OTC'
    // and not specific enough for the refund-destination label).
    paymentMethod:
      raw.payments?.[0]?.epayment_method ??
      raw.payments?.[0]?.payment_method ??
      undefined,
  } as IBooking;
}

export async function getMyBookings(): Promise<{ results: IBooking[]; total: number }> {
  try {
    if (!IS_CLIENT) {
      const { data } = await axios.get(`${CORE_API_URL}/bookings/mine`);
      const bookings: any[] = data?.data ?? [];
      const results = bookings.map((b: any) => ({ ...mapBookingData(b), tenantId: b.tenant_id }));
      return { results, total: data?.total ?? results.length };
    }
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
  headers?: HeadersInit,
  shippingLineId?: string,
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
    if (!IS_CLIENT && shippingLineId) {
      queryParams.append('shipping_line_id', shippingLineId);
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
  pricingData: import('@/types/booking/pricing').CalculatePricingRequest,
  headers?: HeadersInit,
  shippingLineId?: string,
): Promise<PricingResponse> {
  try {
    const url = !IS_CLIENT && shippingLineId
      ? `${BOOKING_API}/pricing?shipping_line_id=${shippingLineId}`
      : `${BOOKING_API}/pricing`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(pricingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Normalize flat response into PricingResponse shape expected by FareSummary
    const json = await response.json();
    const flat = json.data;
    if (!flat) return json;

    const tripIds: string[] = pricingData.tripIds;
    const tripMap = new Map<string, { passengerPrices: any[]; cargoPrices: any[] }>();
    for (const id of tripIds) tripMap.set(id, { passengerPrices: [], cargoPrices: [] });

    (flat.passengerPrices ?? []).forEach((p: any) => { tripMap.get(p.tripId)?.passengerPrices.push(p); });
    (flat.cargoPrices ?? []).forEach((c: any) => { tripMap.get(c.tripId)?.cargoPrices.push(c); });

    const trips = [...tripMap.entries()].map(([tripId, data], i) => {
      const pSub = data.passengerPrices.reduce((s: number, p: any) => s + (p.baseFare ?? 0), 0);
      const cSub = data.cargoPrices.reduce((s: number, c: any) => s + (c.baseFare ?? 0), 0);
      const charges = i === 0 ? (flat.charges ?? []) : [];
      const chargesTotal = i === 0 ? (flat.chargesTotal ?? 0) : 0;
      return {
        tripId,
        routeCode: data.passengerPrices[0]?.routeCode ?? data.cargoPrices[0]?.routeCode ?? '',
        passengerPrices: data.passengerPrices,
        cargoPrices: data.cargoPrices,
        baseFare: { passengers: pSub, cargo: cSub, total: pSub + cSub },
        charges,
        chargesTotal,
        taxesTotal: i === 0 ? (flat.taxesTotal ?? 0) : 0,
        subtotal: pSub + cSub + chargesTotal,
        grandTotal: pSub + cSub + chargesTotal,
      };
    });

    return { message: json.message ?? 'Pricing calculated successfully', data: { trips, grandTotal: flat.grandTotal ?? 0 } };
  } catch (e) {
    console.error('Error calculating pricing:', e);
    throw e;
  }
}

/**
 * Derives a `CalculatePricingRequest` payload from a raw booking response.
 */
export function derivePricingStateFromBooking(rawBookingData: any) {
  const trips = rawBookingData.trips;
  const departureLegs = trips?.departure || (Array.isArray(trips) ? trips : []);
  const returnLegs = trips?.return || [];
  const allLegs = [...departureLegs, ...returnLegs].filter((leg) => leg?.id);

  if (allLegs.length === 0) return null;

  const tripIds = allLegs.map((leg) => String(leg.id));
  const routeCode =
    departureLegs[0]?.route_code ||
    departureLegs[0]?.routeCode ||
    allLegs[0]?.route_code ||
    allLegs[0]?.routeCode ||
    '';

  const passengers = (departureLegs[0]?.passengers || []).map((passenger: any, index: number) => ({
    index,
    passengerType: passenger.passenger_type || passenger.passengerType || passenger.discount_type || passenger.discountType || 'ADULT',
    tripAssignments: allLegs.map((leg: any) => ({
      tripId: String(leg.id),
      cabinId:
        passenger.cabin_id ||
        passenger.cabinId ||
        passenger.cabin_type_id ||
        passenger.cabinTypeId ||
        null,
      discountType: String(
        passenger.discount_type ||
        passenger.discountType ||
        passenger.passenger_type ||
        passenger.passengerType ||
        'ADULT'
      ).toUpperCase(),
    })),
  }));

  const rollingCargo = (departureLegs[0]?.vehicles || [])
    .map((vehicle: any, index: number) => ({
      index,
      cargoType: 'rolling' as const,
      cargoClassCode: String(
        vehicle.vehicle_type_id ||
        vehicle.vehicleTypeId ||
        vehicle.type_id ||
        vehicle.vehicle?.vehicleType?.id ||
        vehicle.vehicle?.vehicle_type_id ||
        ''
      ),
      tripAssignments: allLegs.map((leg: any) => ({ tripId: String(leg.id) })),
    }))
    .filter((cargo: { cargoClassCode: string }) => Boolean(cargo.cargoClassCode));

  const looseCargoSource = departureLegs[0]?.cargos || departureLegs[0]?.cargo || [];
  const looseCargo = looseCargoSource.map((cargo: any, index: number) => ({
    index: rollingCargo.length + index,
    cargoType: 'loose' as const,
    cargoClassCode: cargo.cargo_class || cargo.cargoClass || cargo.commodity_name || cargo.commodityName || undefined,
    quantity: Number(cargo.quantity || 1),
    tripAssignments: allLegs.map((leg: any) => ({ tripId: String(leg.id) })),
  }));

  return {
    routeCode,
    tripIds,
    passengers,
    cargos: [...rollingCargo, ...looseCargo],
  };
}
