import PaymentConfirmationDetails from "@/components/booking/payment-confirmation/PaymentConfirmationDetails";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: Promise<{
    departureTripId?: string;
    returnTripId?: string;
  }>;
}

export default async function PaymentConfirmation(props: PageProps) {
  const searchParams = await props.searchParams;

  if (!searchParams?.departureTripId) {
    redirect('/booking/destination');
  }

  const departureTripId = searchParams.departureTripId ?? undefined;
  const returnTripId = searchParams.returnTripId ?? undefined;

  return (
    <PaymentConfirmationDetails departureTripId={departureTripId} returnTripId={returnTripId}/>
  )
}
