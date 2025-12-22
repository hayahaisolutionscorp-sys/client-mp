import { PAYMENT_API } from "constants/api";
import { PaymentInitiationRequest, PaymentInitiationResponse } from "@/types/payment/payment";

export async function startPaymentForBooking(
  tentativeBookingId: number,
  body: PaymentInitiationRequest
): Promise<PaymentInitiationResponse | undefined> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    redirectUrl: '/payment-success-mock', // Redirect to success or a mock page
    paymentReference: `PAY-${tentativeBookingId}`
  };
}

export async function startPaymentForBookingRequest(
  bookingId: string
): Promise<PaymentInitiationResponse | undefined> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    redirectUrl: '/payment-success-mock',
    paymentReference: `PAY-REQ-${bookingId}`
  };
}
