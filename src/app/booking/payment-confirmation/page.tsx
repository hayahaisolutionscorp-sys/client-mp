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

  const cleanTripId = (id: string | undefined) => {
    if (!id) return undefined;
    return id.replace(/^(direct-|connecting-)/, '');
  };

  const departureTripId = cleanTripId(searchParams.departureTripId);
  const returnTripId = cleanTripId(searchParams.returnTripId);

  return (
    <PaymentConfirmationDetails departureTripId={departureTripId} returnTripId={returnTripId} />
  )
}
