import { PASSENGER_REQUESTS_API, PASSENGER_REQUESTS_BY_BOOKING_API, BOOKING_API } from 'constants/api';
import axios from '@/services/core/axios';
import {
  IPassengerRequest,
  ICreatePassengerRequestPayload,
} from '@/models/passenger-request/passenger-request.model';

export interface ICabinOption {
  cabinId: number;
  cabinName: string;
  newFare: number;
  fareDifference: number; // positive = upgrade, negative = downgrade
  available?: boolean;
}

export async function getUpgradeDowngradeOptions(
  bookingId: string,
  tripId: string,
  bookingTripPassengerId: string,
  discountType?: string,
): Promise<ICabinOption[]> {
  const url = `${BOOKING_API}/${bookingId}/trips/${tripId}/passengers/${bookingTripPassengerId}/upgrade-downgrade-options${
    discountType ? `?discountType=${encodeURIComponent(discountType)}` : ''
  }`;
  const { data } = await axios.get(url);
  // Controller returns { data, message }
  const list = data?.data ?? data ?? [];
  return Array.isArray(list) ? list : [];
}

export interface IRebookingFee {
  id: number;
  name: string;
  category: string;
  fee_type: 'PERCENT' | 'FIXED';
  fee_value: string | number;
  is_active: boolean;
}

export interface IShipCabin {
  id: number;
  ship_id: number;
  cabin_type_id: number;
  name: string;
  recommended_passenger_capacity: number | null;
  cabin_type_name?: string | null;
  cabin_type_description?: string | null;
  cabin_type_code?: string | null;
}

/**
 * Fetch all cabins on a ship (so the marketplace can show every cabin during rebook,
 * including those without an active rate on the chosen trip).
 */
export async function getShipCabins(shipId: number): Promise<IShipCabin[]> {
  try {
    const baseUrl = BOOKING_API.replace(/\/bookings$/, '');
    const { data } = await axios.get(`${baseUrl}/cabins/ship/${shipId}`);
    const list = data?.data ?? data ?? [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Fetch the active passenger rebooking fee for the marketplace category
 * (REBOOKING_PAX_ONLINE). Returns 0 if no active fee is configured.
 *
 * Hits the same base URL as BOOKING_API (the tenant's client-api), which is what
 * actually has the preferences for this shipping line.
 */
export async function getOnlineRebookingFee(): Promise<{
  amount: number;
  feeType: 'PERCENT' | 'FIXED' | null;
  raw: IRebookingFee | null;
}> {
  try {
    // Derive the same base URL used by the booking endpoints
    const baseUrl = BOOKING_API.replace(/\/bookings$/, '');
    const { data } = await axios.get(
      `${baseUrl}/preferences/rebooking-settings/category/REBOOKING_PAX_ONLINE`,
    );
    const list: IRebookingFee[] = data?.data ?? data ?? [];
    const active = (Array.isArray(list) ? list : []).find((s) => s.is_active);
    if (!active) return { amount: 0, feeType: null, raw: null };
    return {
      amount: Number(active.fee_value ?? 0),
      feeType: active.fee_type,
      raw: active,
    };
  } catch {
    return { amount: 0, feeType: null, raw: null };
  }
}

// Backend (NestJS) wraps responses as { message, data }. Unwrap consistently.
function unwrap<T>(body: any): T {
  if (body && typeof body === 'object' && 'data' in body) return body.data as T;
  return body as T;
}

const num = (v: any): number | null => {
  if (v == null) return null;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return isNaN(n) ? null : n;
};

function mapTrip(t: any): IPassengerRequest['currentTrip'] {
  if (!t) return null;
  return {
    tripId: t.trip_id,
    departureDate: t.departure_date ?? null,
    arrivalDate: t.arrival_date ?? null,
    shipName: t.ship_name ?? null,
    routeName: t.route_name ?? null,
    srcPortCode: t.src_port_code ?? null,
    srcPortName: t.src_port_name ?? null,
    destPortCode: t.dest_port_code ?? null,
    destPortName: t.dest_port_name ?? null,
  };
}

function mapCabin(c: any): IPassengerRequest['newCabin'] {
  if (!c) return null;
  return {
    cabinId: c.cabin_id,
    cabinName: c.cabin_name ?? null,
    cabinTypeName: c.cabin_type_name ?? null,
  };
}

function mapItem(it: any): IPassengerRequest['items'][number] {
  const p = it?.passenger;
  return {
    id: it.id,
    passengerRequestId: it.passenger_request_id,
    bookingTripPassengerId: it.booking_trip_passenger_id,
    fareDifference: num(it.fare_difference),
    newSeatId: it.new_seat_id ?? null,
    passenger: p
      ? {
          btpId: p.btp_id,
          firstName: p.first_name ?? null,
          lastName: p.last_name ?? null,
          discountType: p.discount_type ?? null,
          totalPrice: num(p.total_price),
          cabinId: p.cabin_id ?? null,
          cabinName: p.cabin_name ?? null,
          seatId: p.seat_id ?? null,
        }
      : null,
  };
}

function mapRequest(r: any): IPassengerRequest {
  if (!r) return r;
  // Already camelCase? pass through
  if (r.requestType && !r.request_type) return r as IPassengerRequest;
  return {
    id: r.id,
    bookingId: r.booking_id,
    bookingReferenceNo: r.reference_no ?? null,
    requestType: r.request_type,
    status: r.status,
    faultType: r.fault_type ?? undefined,
    newTripId: r.new_trip_id ?? undefined,
    newCabinId: r.new_cabin_id ?? undefined,
    newSeatId: r.new_seat_id ?? null,
    rebookingFee: num(r.rebooking_fee) ?? undefined,
    refundMethod: r.refund_method ?? undefined,
    refundAccountName: r.refund_account_name ?? undefined,
    refundAccountNumber: r.refund_account_number ?? undefined,
    refundBankName: r.refund_bank_name ?? undefined,
    preferredPaymentMethod: r.preferred_payment_method ?? undefined,
    passengerRemarks: r.passenger_remarks ?? undefined,
    staffRemarks: r.staff_remarks ?? undefined,
    requestedById: r.requested_by_id,
    reviewedById: r.reviewed_by_id ?? undefined,
    reviewedAt: r.reviewed_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    items: Array.isArray(r.items) ? r.items.map(mapItem) : [],
    currentTrip: mapTrip(r.current_trip),
    newTrip: mapTrip(r.new_trip),
    newCabin: mapCabin(r.new_cabin),
  };
}

export async function createPassengerRequest(
  payload: ICreatePassengerRequestPayload,
): Promise<IPassengerRequest> {
  const { data } = await axios.post(PASSENGER_REQUESTS_API, payload);
  return mapRequest(unwrap<any>(data));
}

export interface GetMyPassengerRequestsParams {
  page?: number;
  limit?: number;
  request_type?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export async function getMyPassengerRequests(
  params: GetMyPassengerRequestsParams = {},
): Promise<{
  results: IPassengerRequest[];
  total: number;
}> {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.request_type) query.request_type = params.request_type;
  if (params.status) query.status = params.status;
  if (params.search) query.search = params.search;
  if (params.date_from) query.date_from = params.date_from;
  if (params.date_to) query.date_to = params.date_to;
  const { data } = await axios.get(`${PASSENGER_REQUESTS_API}/my`, { params: query });
  const inner = unwrap<{ results?: any[]; total?: number }>(data);
  return {
    results: Array.isArray(inner?.results) ? inner.results.map(mapRequest) : [],
    total: Number(inner?.total ?? 0),
  };
}

export async function getPassengerRequestById(id: string): Promise<IPassengerRequest> {
  const { data } = await axios.get(`${PASSENGER_REQUESTS_API}/${id}`);
  return mapRequest(unwrap<any>(data));
}

export async function getPassengerRequestsByBookingId(
  bookingId: string,
): Promise<IPassengerRequest[]> {
  const { data } = await axios.get(PASSENGER_REQUESTS_BY_BOOKING_API(bookingId));
  const inner = unwrap<any>(data);
  const list = Array.isArray(inner) ? inner : Array.isArray(inner?.results) ? inner.results : [];
  return list.map(mapRequest);
}

export async function cancelPassengerRequest(id: string): Promise<IPassengerRequest> {
  const { data } = await axios.patch(`${PASSENGER_REQUESTS_API}/${id}/cancel`);
  return mapRequest(unwrap<any>(data));
}
