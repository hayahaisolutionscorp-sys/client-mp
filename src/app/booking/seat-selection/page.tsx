import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import SeatSelectionContent from '@/components/booking/seat-selection/SeatSelectionContent';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface PageProps {
  searchParams?: Promise<{
    departureTripId?: string;
    returnTripId?: string;
    commodityId?: string;
    departureCabinId?: string;
    returnCabinId?: string;
  }>;
}

export default async function SeatSelectionPage(props: PageProps) {
  const searchParams = await props.searchParams;

  if (!searchParams?.departureTripId) {
    redirect('/booking/destination');
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      <SeatSelectionContent
        departureTripId={searchParams.departureTripId}
        returnTripId={searchParams.returnTripId}
        commodityId={searchParams.commodityId}
        departureCabinId={searchParams.departureCabinId}
        returnCabinId={searchParams.returnCabinId}
      />
    </Suspense>
  );
}
