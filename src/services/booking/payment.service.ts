import { PAYMENT_API, BOOKING_API, PAYMONGO_API, MAYA_API, PAYMENT_PROVIDERS_API, IS_CLIENT } from "constants/api";
import { PaymentInitiationRequest, PaymentInitiationResponse, PaymongoCreateCheckoutRequest, PaymongoCheckoutApiResponse, MayaCreateCheckoutRequest, MayaCheckoutApiResponse, PaymongoInitiateRequest, PaymongoInitiateApiResponse } from "@/types/payment/payment";
import axios from '@/services/core/axios';

export async function startPaymentForBooking(
  tentativeBookingId: number,
  body: PaymentInitiationRequest
): Promise<PaymentInitiationResponse | undefined> {
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   return {
  //     redirectUrl: `/booking/confirmed/${tentativeBookingId}`, // Redirect to success or a mock page
  //     paymentReference: `PAY-${tentativeBookingId}`
  //   };
  // }

  try {
    const { data } = await axios.post(`${PAYMENT_API}/booking/${tentativeBookingId}`, body);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function startPaymentForBookingRequest(
  bookingId: string
): Promise<PaymentInitiationResponse | undefined> {
  try {
    const { data } = await axios.post(`${PAYMENT_API}/booking-request/${bookingId}`);
    return data;
  } catch (e) {
    console.error(e);
    return undefined;
  }
  // await new Promise(resolve => setTimeout(resolve, 1000));
  // return {
  //   redirectUrl: `/booking/confirmed/${bookingId}`,
  //   paymentReference: `PAY-REQ-${bookingId}`
  // };
}

/**
 * Get booking payment ID for a booking
 */
export async function getBookingPaymentId(bookingId: string, shippingLineId?: string): Promise<string | undefined> {
  try {
    console.log('Fetching booking payment ID for booking:', bookingId);

    const url = !IS_CLIENT && shippingLineId
      ? `${BOOKING_API}/${bookingId}?shipping_line_id=${shippingLineId}`
      : `${BOOKING_API}/${bookingId}`;
    const { data } = await axios.get(url);
    console.log('Booking data received:', data);
    
    // The backend returns { data: { booking: {...}, payments: [...] } }
    // We need to get the first payment's ID
    const bookingData = data?.data || data;
    console.log('Parsed booking data:', bookingData);
    
    const payments = bookingData?.bookingPayments || bookingData?.payments;
    console.log('Payments found:', payments);
    
    if (payments && payments.length > 0) {
      const paymentId = payments[0].id;
      console.log('Payment ID found:', paymentId);
      return paymentId;
    }
    
    console.warn('No payments found for booking:', bookingId);
    return undefined;
  } catch (e: any) {
    console.error('Failed to get booking payment ID:', e);
    console.error('Error details:', e.response?.data);
    return undefined;
  }
}

/**
 * Create a PayMongo checkout session
 */
export async function createPaymongoCheckout(
  request: PaymongoCreateCheckoutRequest,
  shippingLineId?: string
): Promise<PaymongoCheckoutApiResponse | undefined> {
  try {
    const url = !IS_CLIENT && shippingLineId
      ? `${PAYMONGO_API}/checkout-session?shipping_line_id=${shippingLineId}`
      : `${PAYMONGO_API}/checkout-session`;
    console.log('PayMongo Request URL:', url);
    console.log('PayMongo Request Payload:', JSON.stringify(request, null, 2));

    const { data } = await axios.post(url, request);
    
    console.log('PayMongo Response:', data);
    return data;
  } catch (e: any) {
    console.error('Failed to create PayMongo checkout:', e);
    console.error('Error Response:', e.response?.data);
    console.error('Error Status:', e.response?.status);
    console.error('Error Message:', e.message);
    return undefined;
  }
}

/**
 * Reconcile any pending PayMongo transactions for a booking against the
 * live gateway. Called from the marketplace `success_url` page so the
 * booking flips to `completed` even when the webhook is delayed/lost.
 *
 * Idempotent — safe to call regardless of whether the webhook already
 * fired. Returns `{ status: 'completed' | 'pending' | 'no_transaction', promoted }`.
 */
export async function reconcilePaymongoBooking(
  bookingId: string,
): Promise<{ status: string; promoted: number } | undefined> {
  try {
    const { data } = await axios.post(`${PAYMONGO_API}/reconcile/booking/${bookingId}`);
    return data;
  } catch (e: any) {
    console.error('Failed to reconcile PayMongo booking:', e?.response?.data || e?.message);
    return undefined;
  }
}

/**
 * Create a Maya hosted checkout session
 */
export async function createMayaCheckout(
  request: MayaCreateCheckoutRequest,
  shippingLineId?: string
): Promise<MayaCheckoutApiResponse | undefined> {
  try {
    const url = !IS_CLIENT && shippingLineId
      ? `${MAYA_API}/checkout?shipping_line_id=${shippingLineId}`
      : `${MAYA_API}/checkout`;
    console.log('Maya Request URL:', url);
    console.log('Maya Request Payload:', JSON.stringify(request, null, 2));

    const { data } = await axios.post(url, request);

    console.log('Maya Response:', data);
    return data;
  } catch (e: any) {
    console.error('Failed to create Maya checkout:', e);
    console.error('Error Response:', e.response?.data);
    console.error('Error Status:', e.response?.status);
    console.error('Error Message:', e.message);
    return undefined;
  }
}

export interface EnabledPaymentMethod {
  id: string;
  code: string;
  name: string;
  is_enabled: boolean;
}

export interface EnabledPaymentProvider {
  id: number;
  code: string;
  name: string;
  is_enabled: boolean;
  methods: EnabledPaymentMethod[];
}

/**
 * Fetch enabled payment providers from ayahay-client-api.
 * Returns full provider objects with their enabled payment methods nested.
 */
export async function getEnabledPaymentProviders(): Promise<EnabledPaymentProvider[]> {
  try {
    const { data } = await axios.get(`${PAYMENT_PROVIDERS_API}/enabled`);
    const providers: EnabledPaymentProvider[] = Array.isArray(data) ? data : data.data ?? [];
    return providers;
  } catch (e) {
    console.error('Could not fetch enabled payment providers from API:', e);
    return [];
  }
}

/**
 * Convenience helper: extract just the provider codes from enabled providers.
 */
export function getProviderCodes(providers: EnabledPaymentProvider[]): string[] {
  return providers.map((p) => p.code);
}

/**
 * Initiate a PayMongo Payment Intent for e-wallet/redirect methods (GCash, PayMaya, GrabPay, DOB).
 * Uses the 3-step Payment Intent flow: create intent → create method → attach.
 * Returns the redirect URL to send the customer to.
 */
export async function initiatePaymongoPaymentIntent(
  request: PaymongoInitiateRequest,
  shippingLineId?: string
): Promise<PaymongoInitiateApiResponse | undefined> {
  try {
    const url = !IS_CLIENT && shippingLineId
      ? `${PAYMONGO_API}/initiate?shipping_line_id=${shippingLineId}`
      : `${PAYMONGO_API}/initiate`;
    console.log('PayMongo Intent Request URL:', url);
    console.log('PayMongo Intent Payload:', JSON.stringify(request, null, 2));

    const { data } = await axios.post<PaymongoInitiateApiResponse>(url, request);

    console.log('PayMongo Intent Response:', data);
    return data;
  } catch (e: any) {
    console.error('Failed to initiate PayMongo payment intent:', e);
    console.error('Error Response:', e.response?.data);
    console.error('Error Status:', e.response?.status);
    return undefined;
  }
}
