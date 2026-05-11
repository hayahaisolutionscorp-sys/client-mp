import { PASSENGER_ACTIONS_API } from 'constants/api';
import axios from '@/services/core/axios';

function unwrap<T>(body: any): T {
  if (body && typeof body === 'object' && 'data' in body) return body.data as T;
  return body as T;
}

export type PassengerActionType =
  | 'REBOOK_UPGRADE'
  | 'CABIN_UPGRADE'
  | 'CABIN_DOWNGRADE';

export type PassengerActionStatus =
  | 'PENDING_PAYMENT'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface IPassengerAction {
  id: string;
  bookingId: string;
  bookingReferenceNo: string | null;
  actionType: PassengerActionType;
  status: PassengerActionStatus;
  oldTotal: number | null;
  newTotal: number | null;
  amountPaid: number;
  gatewayCode: string | null;
  createdAt: string;
  performedAt: string | null;
}

function num(v: any): number | null {
  if (v == null) return null;
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isNaN(n) ? null : n;
}

function mapAction(r: any): IPassengerAction {
  return {
    id: r.id,
    bookingId: r.booking_id,
    bookingReferenceNo: r.booking_reference_no ?? null,
    actionType: r.action_type,
    status: r.status,
    oldTotal: num(r.old_total),
    newTotal: num(r.new_total),
    amountPaid: num(r.amount_paid) ?? 0,
    gatewayCode: r.gateway_code ?? null,
    createdAt: r.created_at,
    performedAt: r.performed_at ?? null,
  };
}

export interface CabinDowngradePayload {
  booking_id: string;
  booking_trip_passenger_id: string;
  new_accommodation_id: number;
  new_seat_id?: number;
  old_total: number;
  new_total: number;
}

export async function cabinDowngrade(payload: CabinDowngradePayload) {
  const { data } = await axios.post(`${PASSENGER_ACTIONS_API}/cabin-downgrade`, payload);
  return unwrap<any>(data);
}

export interface CabinUpgradeInitiatePayload extends CabinDowngradePayload {
  delta_amount: number;
  gateway: 'paymongo' | 'maya';
  success_url: string;
  cancel_url: string;
  billing?: { name?: string; email?: string; phone?: string };
}

export async function initiateCabinUpgrade(payload: CabinUpgradeInitiatePayload) {
  const { data } = await axios.post(
    `${PASSENGER_ACTIONS_API}/cabin-upgrade/initiate`,
    payload,
  );
  return unwrap<{ checkoutUrl: string; transactionId: string; gateway: string }>(data);
}

export interface RebookUpgradeInitiatePayload {
  booking_id: string;
  new_trip_id: string;
  /** Round-trip leg id (booking_trips.id) being rebooked. */
  old_booking_trip_id?: string;
  passenger_changes: Array<{
    booking_trip_passenger_id: string;
    new_accommodation_id: number;
    new_seat_id?: number;
  }>;
  old_total: number;
  new_total: number;
  delta_amount: number;
  gateway: 'paymongo' | 'maya';
  success_url: string;
  cancel_url: string;
  billing?: { name?: string; email?: string; phone?: string };
}

export async function initiateRebookUpgrade(payload: RebookUpgradeInitiatePayload) {
  const { data } = await axios.post(
    `${PASSENGER_ACTIONS_API}/rebook-upgrade/initiate`,
    payload,
  );
  return unwrap<{ checkoutUrl: string; transactionId: string; gateway: string }>(data);
}

export interface RebookDowngradePayload {
  booking_id: string;
  new_trip_id: string;
  /** Round-trip leg id (booking_trips.id) being rebooked. */
  old_booking_trip_id?: string;
  passenger_changes: Array<{
    booking_trip_passenger_id: string;
    new_accommodation_id: number;
    new_seat_id?: number;
  }>;
  old_total: number;
  new_total: number;
  passenger_remarks?: string;
}

export async function initiateRebookDowngrade(payload: RebookDowngradePayload) {
  const { data } = await axios.post(
    `${PASSENGER_ACTIONS_API}/rebook-downgrade`,
    payload,
  );
  return unwrap<{ action: any }>(data);
}

export async function cancelPassengerAction(actionId: string) {
  const { data } = await axios.post(
    `${PASSENGER_ACTIONS_API}/${actionId}/cancel`,
  );
  return unwrap<{ status: string }>(data);
}

export async function finalizePassengerAction(actionId: string) {
  const { data } = await axios.post(
    `${PASSENGER_ACTIONS_API}/${actionId}/finalize`,
  );
  return unwrap<{ status: string; newBookingId: string | null }>(data);
}

export interface GetMyPassengerActionsParams {
  page?: number;
  limit?: number;
  action_type?: string;
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export async function getMyPassengerActions(
  params: GetMyPassengerActionsParams = {},
): Promise<{ results: IPassengerAction[]; total: number }> {
  const query: Record<string, string | number> = {};
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  if (params.action_type) query.action_type = params.action_type;
  if (params.status) query.status = params.status;
  if (params.search) query.search = params.search;
  if (params.date_from) query.date_from = params.date_from;
  if (params.date_to) query.date_to = params.date_to;
  const { data } = await axios.get(`${PASSENGER_ACTIONS_API}/my`, { params: query });
  const inner = unwrap<{ results?: any[]; total?: number }>(data);
  return {
    results: Array.isArray(inner?.results) ? inner.results.map(mapAction) : [],
    total: Number(inner?.total ?? 0),
  };
}
