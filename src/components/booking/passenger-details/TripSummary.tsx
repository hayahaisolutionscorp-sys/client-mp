'use client';

import ContactDetailsForm from '@/components/booking/passenger-details/ContactDetailsForm';
import FareSummary from '@/components/booking/FareSummary';
import PassengerDetailsForm from '@/components/booking/passenger-details/PassengerDetailsForm';
import PassengerTripCard from '@/components/booking/PassengerTripCard';
import { useThemeSettings } from '@/hooks/theme-settings';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { PiInfo } from 'react-icons/pi';
import Image from 'next/image';
import { IoArrowBack } from 'react-icons/io5';
import { getTrips } from '@/services';
import { PassengerData } from '@/types/booking/passenger-data';
import { VehicleData } from '@/types/booking/vehicle-data';
import { ContactData } from '@/types/booking/contact-data';
import { ITrip } from '@/models';

interface Props {
  departureTripId?: string;
  returnTripId?: string;
}

export default function TripSummary({ departureTripId, returnTripId }: Props) {
  const router = useRouter();

  const [trips, setTrips] = useState<ITrip[] | undefined>(undefined);
  const [passengerDetails, setPassengerDetails] = useState<{
    passenger: PassengerData;
    companions: PassengerData[];
  } | null>(null);
  const [vehicleDepartureDetails, setVehicleDepartueDetails] = useState<VehicleData[]>([]);
  const [contactDetails, setContactDetails] = useState<ContactData | null>(null);
  const themeSettings = useThemeSettings();

  const handlePassengersChange = (data: { passenger: PassengerData; companions: PassengerData[] }) => {
    setPassengerDetails(data);
  };

  const handleVehiclesDepartureChange = useCallback((vehicles: VehicleData[]) => {
    setVehicleDepartueDetails(vehicles);
  }, []);

  const handleContactChange = (contacts: ContactData) => {
    setContactDetails(contacts);
  };

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
  return (
    <>
      <div className="px-2 w-full md:w-auto">
        <div className="flex items-center">
          <a
            onClick={() => window.history.back()}
            role="button"
            tabIndex={0}
            className="flex items-center cursor-pointer"
          >
            <IoArrowBack
              className="w-6 h-6 md:w-8 md:h-8 mr-2"
              style={{ color: themeSettings?.accent || '#23abff' }}
            />
          </a>
          <h4 className="font-semibold text-xl md:text-2xl text-customText my-4 mr-2">Trip Summary</h4>
          <Image
            src="/assets/images/ship-icon.png"
            alt="Ship Icon"
            width={200}
            height={200}
            className="h-4 w-9 md:h-5 md:w-12 mx-2"
          />
        </div>

        <PassengerTripCard trips={trips} />

        <PassengerDetailsForm
          rateTableId={trips?.[0]?.rateTableId ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          onChange={handlePassengersChange}
        />
        <ContactDetailsForm passengerDetails={passengerDetails?.passenger} onChange={handleContactChange} />

        <div className="text-sm text-customText leading-relaxed my-4 md:text-base">
          <div className="flex items-start">
            <PiInfo
              className="flex-shrink-0 mr-2 mt-[2.5px]"
              style={{ color: themeSettings?.accent || '#23abff' }}
            />
            <p className="text-sm text-customText leading-relaxed">
              If the trip is <strong className="font-semibold">fully booked</strong> or{' '}
              <strong className="font-semibold">cancelled</strong>, please contact{' '}
              <strong className="font-semibold">Ayahay customer service</strong> to ask for slots.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column (Fare Summary) */}
      <div className="px-2 mt-6 md:mt-[65px] w-full md:w-auto">
        <FareSummary
          trips={trips}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          contactDetails={contactDetails ? contactDetails : undefined}
          vehicleDepartureDetails={vehicleDepartureDetails || undefined}
          vehicleReturnDetails={vehicleDepartureDetails || undefined}
          departureRateTableId={trips?.[0]?.rateTableId ?? 0}
          returnRateTableId={trips?.[1]?.rateTableId ?? 0}
        />
      </div>
    </>
  );
}
