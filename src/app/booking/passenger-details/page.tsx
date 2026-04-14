import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import PassengerDetailsContent from '@/components/booking/passenger-details/PassengerDetailsContent';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface PageProps {
  searchParams?: Promise<{
    departureTripId?: string;
    departureCabinName?: string;
    departureCabinId?: string;
    returnTripId?: string;
    returnCabinName?: string;
    returnCabinId?: string;
    shippingLineId?: string;
    passengerCount?: string;
    vehicleCount?: string;
    commodityId?: string;
  }>;
}

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export default async function PassengerDetails(props: PageProps) {
  const searchParams = await props.searchParams;

  if (!searchParams?.departureTripId) {
    redirect('/booking/destination');
  }

  const cleanTripId = (id: string | undefined) => {
    if (!id) return undefined;
    return id.replace(/^(direct-|connecting-|return-)/, '');
  };

  const departureTripId = cleanTripId(searchParams.departureTripId);
  const returnTripId = cleanTripId(searchParams.returnTripId);

  // Detect cross-tenant connecting trips from pipe-separated shippingLineId
  const shippingLineId = searchParams.shippingLineId;
  const shippingLineIds = shippingLineId?.split('|') ?? [];
  const isCrossTenant = shippingLineIds.length > 1 && shippingLineIds[0] !== shippingLineIds[1];

  // For cross-tenant, split the compound trip ID into individual leg UUIDs
  let legTripIds: string[] | undefined;
  let legReturnTripIds: string[] | undefined;
  if (isCrossTenant && departureTripId) {
    legTripIds = departureTripId.match(UUID_REGEX) ?? undefined;
  }
  if (isCrossTenant && returnTripId) {
    legReturnTripIds = returnTripId.match(UUID_REGEX) ?? undefined;
  }

  return (
    <div className="grid grid-cols-1 gap-4 bg-[var(--surface-alt)] px-3 pt-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:px-10">
      <Suspense fallback={<div className="col-span-full"><LoadingScreen fullScreen={false} /></div>}>
        <PassengerDetailsContent
          departureTripId={departureTripId}
          returnTripId={returnTripId}
          departureCabinName={searchParams.departureCabinName}
          departureCabinId={searchParams.departureCabinId}
          returnCabinName={searchParams.returnCabinName}
          returnCabinId={searchParams.returnCabinId}
          shippingLineId={shippingLineId}
          commodityId={searchParams.commodityId}
          isCrossTenant={isCrossTenant}
          legTripIds={legTripIds}
          shippingLineIds={isCrossTenant ? shippingLineIds : undefined}
          legReturnTripIds={legReturnTripIds}
        />
      </Suspense>
    </div>
  );
}
