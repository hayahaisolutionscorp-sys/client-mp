import { PAYMENT_API, BOOKING_API, PAYMONGO_API, MAYA_API, PAYMENT_PROVIDERS_API } from "constants/api";
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
export async function getBookingPaymentId(bookingId: string): Promise<string | undefined> {
  try {
    console.log('Fetching booking payment ID for booking:', bookingId);
    
    const { data } = await axios.get(`${BOOKING_API}/${bookingId}`);
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
  request: PaymongoCreateCheckoutRequest
): Promise<PaymongoCheckoutApiResponse | undefined> {
  try {
    console.log('PayMongo Request URL:', `${PAYMONGO_API}/checkout-session`);
    console.log('PayMongo Request Payload:', JSON.stringify(request, null, 2));
    
    const { data } = await axios.post(`${PAYMONGO_API}/checkout-session`, request);
    
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
 * Create a Maya hosted checkout session
 */
export async function createMayaCheckout(
  request: MayaCreateCheckoutRequest
): Promise<MayaCheckoutApiResponse | undefined> {
  try {
    console.log('Maya Request URL:', `${MAYA_API}/checkout`);
    console.log('Maya Request Payload:', JSON.stringify(request, null, 2));

    const { data } = await axios.post(`${MAYA_API}/checkout`, request);

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

/**
 * Fetch enabled payment providers from ayahay-api-v2.
 * Returns provider codes in order, e.g. ['maya'] or ['paymongo'] or ['maya','paymongo'].
 * Throws if the API is unreachable — provider config is managed by admins, not env vars.
 */
export async function getEnabledPaymentProviders(): Promise<string[]> {
  try {
    const { data } = await axios.get(`${PAYMENT_PROVIDERS_API}/enabled`);
    const providers: { code: string }[] = Array.isArray(data) ? data : data.data ?? [];
    return providers.map((p) => p.code);
  } catch (e) {
    console.error('Could not fetch enabled payment providers from API:', e);
    return [];
  }
}

/**
 * Initiate a PayMongo Payment Intent for e-wallet/redirect methods (GCash, PayMaya, GrabPay, DOB).
 * Uses the 3-step Payment Intent flow: create intent → create method → attach.
 * Returns the redirect URL to send the customer to.
 */
export async function initiatePaymongoPaymentIntent(
  request: PaymongoInitiateRequest
): Promise<PaymongoInitiateApiResponse | undefined> {
  try {
    console.log('PayMongo Intent Request URL:', `${PAYMONGO_API}/initiate`);
    console.log('PayMongo Intent Payload:', JSON.stringify(request, null, 2));

    const { data } = await axios.post<PaymongoInitiateApiResponse>(`${PAYMONGO_API}/initiate`, request);

    console.log('PayMongo Intent Response:', data);
    return data;
  } catch (e: any) {
    console.error('Failed to initiate PayMongo payment intent:', e);
    console.error('Error Response:', e.response?.data);
    console.error('Error Status:', e.response?.status);
    return undefined;
  }
}
