'use client';

import FareSummary from '@/components/booking/FareSummary';
import InfoCard from '@/components/booking/confirmed/InfoCard';
import PassengerConfirmedTripCard from '@/components/booking/confirmed/PassengerConfirmedTripCard';
import PassengerList from '@/components/booking/confirmed/PassengerList';
import PaymentSuccessCard from '@/components/booking/confirmed/PaymentSuccessCard';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { useThemeSettings } from '@/hooks/theme-settings';
import ErrorMessage from './ErrorMessage';
import { getBookingById } from '@/services';
import { IBooking } from '@/models';

export default function BookingDetails() {
  const pathname = usePathname();
  const bookingId = pathname?.split('/').pop();
  const themeSettings = useThemeSettings();

  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const loadBooking = useCallback(async () => {
    try {
      const booking = await getBookingById(bookingId || '');
      setBooking(booking);
      setErrorCode(undefined);
    } catch (e) {
      const error = e as { status?: number; message?: string };
      const statusCode = error.status || 500;
      setErrorCode(statusCode);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="animate-spin text-[45px]" style={{ color: themeSettings?.iconColor || '#23abff' }} />
          <p className="text-sm sm:text-base text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {errorCode ? (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
          <ErrorMessage errorCode={errorCode} />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-3 pt-6 pb-8 lg:pt-10 lg:px-10">
            <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="w-full lg:w-2/3 space-y-6">
                <PaymentSuccessCard booking={booking} />
                <PassengerList booking={booking} />
                <PassengerConfirmedTripCard booking={booking} />
              </div>

              {/* Right Column */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div className="sticky top-[100px]">
                  <FareSummary booking={booking} />
                  <InfoCard
                    imgSrc="/assets/images/reminder-icon.png"
                    altText="Megaphone illustration"
                    title="Booking Reminders"
                    description="Passengers are advised to be at the terminal at least 1 hour before departure..."
                    linkText="Read Guidelines"
                    linkHref="#"
                  />
                  <InfoCard
                    imgSrc="/assets/images/printer-icon.png"
                    altText="Printer"
                    title="Make sure to print your E-ticket"
                    description="A copy of the ticket will also be sent to your email..."
                    linkText="Read Guidelines"
                    linkHref="#"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
