import { PAYMENT_API } from "constants/api";
import { PaymentInitiationRequest, PaymentInitiationResponse } from "@/types/payment/payment";
  
export async function startPaymentForBooking(
    tentativeBookingId: number,
    body: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse | undefined> {
    try {
      const response = await fetch(`${PAYMENT_API}/bookings/${tentativeBookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Failed payment for booking: ${response.statusText}`);
      }

      const paymentInitiation: PaymentInitiationResponse = await response.json();
      return paymentInitiation;

    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  
export async function startPaymentForBookingRequest(
    bookingId: string
  ): Promise<PaymentInitiationResponse | undefined> {
    try {
      const response = await fetch(`${PAYMENT_API}/bookings/requests/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed payment for booking request: ${response.statusText}`);
      }
      const paymentInitiation: PaymentInitiationResponse = await response.json();

      return paymentInitiation;

    } catch (e) {
      console.error(e);
      throw e;
    }
  }
  