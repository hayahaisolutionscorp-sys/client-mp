import { redirect } from 'next/navigation';

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

  const nextParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) nextParams.set(key, value);
  });
  const qs = nextParams.toString();
  redirect(qs ? `/booking/passenger-details?${qs}` : '/booking/passenger-details');
}
