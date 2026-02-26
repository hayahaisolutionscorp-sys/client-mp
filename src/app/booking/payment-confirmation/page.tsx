import { redirect } from "next/navigation";
import { Suspense } from 'react';
import PaymentConfirmationContent from "@/components/booking/payment-confirmation/PaymentConfirmationContent";
import LoadingScreen from "@/components/ui/LoadingScreen";

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
    <Suspense fallback={<LoadingScreen fullScreen={false} />}>
      <PaymentConfirmationContent
        departureTripId={departureTripId}
        returnTripId={returnTripId}
      />
    </Suspense>
  )
}
