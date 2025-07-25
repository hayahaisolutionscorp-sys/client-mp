import TripSummary from '@/components/booking/passenger-details/TripSummary';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams?: Promise<{
    departureTripId?: string;
    departureCabinId?: string;
    returnTripId?: string;
    returnCabinId?: string;
    passengerCount?: string;
    vehicleCount?: string;
  }>;
}

export default async function PassengerDetails(props: PageProps) {
  const searchParams = await props.searchParams;

  if (!searchParams?.departureTripId) {
    redirect('/booking/destination');
  }

  const departureTripId = searchParams.departureTripId ?? undefined;
  const returnTripId = searchParams.returnTripId ?? undefined;

  return (
    <div className="grid grid-cols-1 gap-4 bg-gray-50 px-3 pt-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:px-10">
      <TripSummary departureTripId={departureTripId} returnTripId={returnTripId} />
    </div>
  );
}
