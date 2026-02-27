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
    passengerCount?: string;
    vehicleCount?: string;
    commodityId?: string;
  }>;
}

export default async function PassengerDetails(props: PageProps) {
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
    <div className="grid grid-cols-1 gap-4 bg-gray-50 px-3 pt-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:px-10">
      <Suspense fallback={<div className="col-span-full"><LoadingScreen fullScreen={false} /></div>}>
        <PassengerDetailsContent
          departureTripId={departureTripId}
          returnTripId={returnTripId}
          departureCabinName={searchParams.departureCabinName}
          departureCabinId={searchParams.departureCabinId}
          returnCabinName={searchParams.returnCabinName}
          returnCabinId={searchParams.returnCabinId}
          commodityId={searchParams.commodityId}
        />
      </Suspense>
    </div>
  );
}
