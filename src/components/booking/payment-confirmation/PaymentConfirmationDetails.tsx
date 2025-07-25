'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import PassengerDetails from '@/components/booking/payment-confirmation/PassengerDetails';
import PassengerTripCard from '@/components/booking/PassengerTripCard';
import FareSummary from '@/components/booking/FareSummary';
import { cacheItem, fetchItem, invalidateItem } from 'helpers/cache.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { getTrips, createTentativeBooking  } from '@/services';
import { ITrip, IBooking } from '@/models';

interface Props {
  departureTripId?: string;
  returnTripId?: string;
}

export default function PaymentConfirmationDetails({ departureTripId, returnTripId }: Props) {
  const router = useRouter();

  const [trips, setTrips] = useState<ITrip[] | undefined>(undefined);
  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page on component load
  }, []);

  // Fetch trips
  const fetchTrips = useCallback(async () => {
    try {
      const tripIds: number[] = [];

      if (departureTripId) tripIds.push(Number(departureTripId));
      if (returnTripId) tripIds.push(Number(returnTripId));

      if (tripIds.length > 0) {
        const fetchedTrips = await getTrips(tripIds);

        const fetchedTrip = fetchedTrips?.[0];
        if (fetchedTrip && fetchedTrip.status !== 'Awaiting') {
          router.push('/');
        }

        setTrips(fetchedTrips as ITrip[] | undefined);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    }
  }, [departureTripId, returnTripId, router]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Inside the component
  const hasProcessedRef = useRef(false); // Use ref instead of state

  const processBooking = useCallback(async () => {
    if (hasProcessedRef.current) return; // Block repeat calls
    hasProcessedRef.current = true;

    const jsonBooking = fetchItem<IBooking>('booking-json');

    if (jsonBooking) {
      try {
        const createdBooking = await createTentativeBooking(jsonBooking);
        setBooking(createdBooking);
        cacheItem('booking-response', createdBooking, 60 * 24);
      } catch (error) {
        console.error('Error creating booking:', error);
      } finally {
        invalidateItem('booking-json');
      }
    } else {
      const responseBooking = fetchItem<IBooking>('booking-response');
      setBooking(responseBooking);
    }
  }, []);

  useEffect(() => {
    processBooking();
  }, [processBooking]);

  return (
    <>
      <div
        className="grid grid-cols-1 gap-4 bg-gray-50 px-3 pt-3
        md:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:px-10"
      >
        {/* Left Column (Contact Details Form) */}
        <div className="px-2">
          <div className="flex items-center flex-wrap gap-2">
            <a
              onClick={() => window.history.back()}
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer"
            >
              <IoArrowBack
                className="w-6 h-6 sm:w-8 sm:h-8 mr-2"
                style={{ color: themeSettings?.iconColor || '#23abff' }}
              />
            </a>
            <h4 className="font-semibold text-base sm:text-2xl text-customText my-4 mr-2">Payment Confirmation</h4>
            <Image
              src="/assets/images/ship-icon.png"
              alt="Ship Icon"
              width={200}
              height={200}
              className="h-4 w-6 sm:h-5 sm:w-12"
            />
          </div>

          <div className="space-y-6">
            <PassengerTripCard trips={trips} />
            <PassengerDetails booking={booking} />
          </div>
        </div>

        {/* Right Column (Fare Summary) */}
        <div className="px-2 mt-6 lg:mt-16">
          <FareSummary booking={booking} />
        </div>
      </div>
    </>
  );
}
