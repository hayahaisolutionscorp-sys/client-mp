'use client';

import FareSummary from '@/components/booking/FareSummary';
import InfoCard from '@/components/booking/confirmed/InfoCard';
import PassengerConfirmedTripCard from '@/components/booking/confirmed/PassengerConfirmedTripCard';
import PassengerList from '@/components/booking/confirmed/PassengerList';
import PaymentSuccessCard from '@/components/booking/confirmed/PaymentSuccessCard';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { useThemeSettings } from '@/hooks/theme-settings';
import ErrorMessage from './ErrorMessage';
import { IBooking } from '@/models';
import Image from 'next/image';

// Resources Section Component
const ResourcesSection = () => (
  <div id="Resources" className="hidden sm:block w-full lg:pt-56">
    <div className="flex items-center justify-center w-full">
      <div className="flex flex-col relative bg-[#AADCFB] rounded-lg shadow-md w-full h-auto max-w-6xl mx-auto px-6   md:flex-row md:justify-between md:h-[278px] sm:px-28 lg:absolute lg:z-12 lg:mb-26 lg:max-w-[85%] lg:px-10">
        <div className="flex flex-col items-center w-full md:w-auto md:items-start justify-center text-center md:text-left py-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#051036]">Get Updates & More</h2>
          <p className="text-sm md:text-xs text-customText mt-2">We'll send you a nice letter once per week. No spam.</p>
          <div className="flex flex-col items-center w-full mt-5 md:mr-4 space-y-4 md:w-auto md:flex-row md:space-y-0 md:space-x-4">
            <input
              type="email"
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgba(var(--border-color),1)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full md:w-[300px]"
              placeholder="Your email address"
              style={{ '--border-color': '35, 171, 255' } as any}
            />
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-gray-400 disabled:text-gray-100 disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#23abff] text-white hover:opacity-90 h-10 px-6 py-2 w-full md:w-auto">
              Subscribe
            </button>
          </div>
        </div>
        <div className="flex items-end justify-center h-full mt-4 md:mt-0">
          <Image
            alt="Open Mailbox"
            loading="lazy"
            width={500}
            height={500}
            decoding="async"
            className="w-full h-auto"
            src="/assets/images/open-mailbox-with-lowered-flag.svg"
          />
        </div>
      </div>
    </div>
  </div>
);

export default function BookingDetails() {
  const pathname = usePathname();
  // const bookingId = pathname?.split('/').pop(); // Unused for mock
  const themeSettings = useThemeSettings();

  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  // const [errorCode, setErrorCode] = useState<number | undefined>(); // Unused for mock
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Data Implementation
    const mockBooking: IBooking = {
      id: "ba540629-edaf-4479-9373-6e011f9d6b77",
      shippingLineId: 1,
      referenceNo: "OCTO-12345678",
      bookingStatus: "Confirmed",
      paymentStatus: "Success",
      totalPrice: 1550,
      bookingType: "Single",
      contactEmail: "jdelacruz@gmail.com",
      contactMobile: "09171234567",
      createdAtIso: "2024-12-05T10:30:00Z",
      isBookingRequest: false,
      bookingTrips: [
        {
          bookingId: "ba540629-edaf-4479-9373-6e011f9d6b77",
          tripId: 101,
          trip: {
            id: 101,
            shippingLineId: 1,
            shippingLine: { id: 1, name: "OceanJet", logoFilename: "https://imagedelivery.net/6-4ZqaHhS7Ww2G8l13y_gA/fa577884-a4f6-49a3-5c77-49f390d40700/public" },
            srcPort: { id: 1, name: "Cebu" },
            destPort: { id: 2, name: "Tagbilaran" },
            departureDateIso: "2024-12-20T08:00:00+08:00",
            arrivalTimeDateIso: "2024-12-20T10:00:00+08:00",
            shipId: 5,
            ship: { id: 5, name: "OceanJet 888" },
          } as any,
          bookingTripPassengers: [
            {
              passenger: { firstName: "Juan", lastName: "Dela Cruz", birthday: "1990-01-01" },
              cabin: { cabinType: { name: "Tourist Class" } },
              discountType: "Regular"
            },
            {
              passenger: { firstName: "Maria", lastName: "Dela Cruz", birthday: "1992-02-02" },
              cabin: { cabinType: { name: "Business Class" } },
              discountType: "Senior Citizen"
            }
          ] as any
        }
      ]
    } as any;

    // Simulate loading briefly then set mock data
    const timer = setTimeout(() => {
      setBooking(mockBooking);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
      </div>
    </>
  );
}
