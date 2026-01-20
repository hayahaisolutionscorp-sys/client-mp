import { PAYMENT_API } from "constants/api";
import { PaymentInitiationRequest, PaymentInitiationResponse } from "@/types/payment/payment";
import axios from '@/services/core/axios';

export async function startPaymentForBooking(
  tentativeBookingId: number,
  body: PaymentInitiationRequest
): Promise<PaymentInitiationResponse | undefined> {
  // try {
  //   const { data } = await axios.post(`${PAYMENT_API}/booking/${tentativeBookingId}`, body);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    redirectUrl: '/payment-success-mock', // Redirect to success or a mock page
    paymentReference: `PAY-${tentativeBookingId}`
  };
}

export async function startPaymentForBookingRequest(
  bookingId: string
): Promise<PaymentInitiationResponse | undefined> {
  // try {
  //   const { data } = await axios.post(`${PAYMENT_API}/booking-request/${bookingId}`);
  //   return data;
  // } catch (e) {
  //   console.error(e);
  //   return undefined;
  // }

  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    redirectUrl: '/payment-success-mock',
    paymentReference: `PAY-REQ-${bookingId}`
  };
}
