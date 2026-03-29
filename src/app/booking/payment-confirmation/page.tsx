import { redirect } from "next/navigation";
import { Suspense } from 'react';
import PaymentConfirmationContent from "@/components/booking/payment-confirmation/PaymentConfirmationContent";
import LoadingScreen from "@/components/ui/LoadingScreen";

interface PageProps {
  searchParams?: Promise<{
    departureTripId?: string;
    returnTripId?: string;
    commodityId?: string;
    shippingLineId?: string;
  }>;
}

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

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

  // Detect cross-tenant connecting trips from pipe-separated shippingLineId
  const shippingLineId = searchParams.shippingLineId;
  const shippingLineIds = shippingLineId?.split('|') ?? [];
  const isCrossTenant = shippingLineIds.length > 1 && shippingLineIds[0] !== shippingLineIds[1];

  // For cross-tenant, extract individual leg trip IDs
  let legTripIds: string[] | undefined;
  let legReturnTripIds: string[] | undefined;
  if (isCrossTenant && departureTripId) {
    const commaSplit = departureTripId.split(',').filter(Boolean);
    legTripIds = commaSplit.length >= 2 ? commaSplit : (departureTripId.match(UUID_REGEX) ?? undefined);
  }
  if (isCrossTenant && returnTripId) {
    const commaSplit = returnTripId.split(',').filter(Boolean);
    legReturnTripIds = commaSplit.length >= 2 ? commaSplit : (returnTripId.match(UUID_REGEX) ?? undefined);
  }

  return (
    <Suspense fallback={<LoadingScreen fullScreen={false} />}>
      <PaymentConfirmationContent
        departureTripId={departureTripId}
        returnTripId={returnTripId}
        commodityId={searchParams.commodityId}
        shippingLineId={shippingLineId}
        isCrossTenant={isCrossTenant}
        legTripIds={legTripIds}
        shippingLineIds={isCrossTenant ? shippingLineIds : undefined}
        legReturnTripIds={legReturnTripIds}
      />
    </Suspense>
  )
}
