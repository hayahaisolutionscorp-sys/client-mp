'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import Image from 'next/image';

import FareSummary from '@/components/booking/FareSummary';
import InfoCard from '@/components/booking/confirmed/InfoCard';
import PassengerConfirmedTripCard from '@/components/booking/confirmed/PassengerConfirmedTripCard';
import TripDetails from '@/components/booking/payment-confirmation/TripDetails';
import PaymentSuccessCard from '@/components/booking/confirmed/PaymentSuccessCard';
import { useThemeSettings } from '@/hooks/theme-settings';
import { getBookingById, prepareBooking, calculatePricing, derivePricingStateFromBooking } from '@/services';
import { getShip } from '@/services/shipping-line/ship.service';
import { IBooking, ITrip } from '@/models';
import { IPrepareBookingData, ITripSummary } from '@/models/booking/prepare-booking.model';
import { PricingResponse } from '@/types/booking/pricing';

export default function BookingDetails() {
  const params = useParams();
  const bookingId = params?.id as string;
  const themeSettings = useThemeSettings();

  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState<PricingResponse['data'] | undefined>(undefined);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [prepareBookingData, setPrepareBookingData] = useState<IPrepareBookingData | undefined>(undefined);

  // Fetch Booking
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const { booking: fetchedBooking, raw } = await getBookingById(bookingId);
        setBooking(fetchedBooking);

        // Derive pricing state and fetch pricing breakdown
        if (raw) {
          setIsPricingLoading(true);
          try {
            const pricingState = derivePricingStateFromBooking(raw);
            if (pricingState) {
              const pricingResp = await calculatePricing(pricingState);
              setPricingData(pricingResp.data);
            }
          } catch (pricingError) {
            console.error('Failed to fetch pricing breakdown:', pricingError);
          } finally {
            setIsPricingLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Map TripSummary to ITrip (reused logic)
  const mapTripSummaryToTrip = useCallback((summary: ITripSummary, shippingLineId: number = 0): ITrip => {
    return {
      id: summary.id,
      shipId: summary.ship.id,
      shippingLineId: shippingLineId,
      status: summary.status as any,
      arrivalTimeDateIso: summary.scheduled_arrival,
      departureDateIso: summary.scheduled_departure,
      type: 'direct',
      srcPort: { name: summary.origin } as any,
      destPort: { name: summary.destination } as any,
      ship: {
        id: summary.ship.id,
        name: summary.ship.name,
        shippingLineId: shippingLineId,
      } as any
    } as ITrip;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="animate-spin text-[45px]" style={{ color: themeSettings?.accent || '#23abff' }} />
          <p className="text-sm sm:text-base text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-24 sm:mb-0">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-3 pt-6 pb-8 lg:pt-10 lg:px-10">
            <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="w-full lg:w-2/3 space-y-6">
                <PaymentSuccessCard booking={booking} />
                <TripDetails booking={booking} />
                <PassengerConfirmedTripCard booking={booking} />
              </div>

              {/* Right Column */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div>
                  <FareSummary
                    booking={booking}
                    pricingData={pricingData}
                    isLoading={isPricingLoading}
                  />
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
      </div>
    </>
  );
}
