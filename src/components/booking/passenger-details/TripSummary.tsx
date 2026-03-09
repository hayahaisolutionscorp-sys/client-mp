'use client';

import ContactDetailsForm from '@/components/booking/passenger-details/ContactDetailsForm';
import VehicleInformationForm from '@/components/VehicleInformationForm';
import CargoInformationForm, { CargoInformationFormHandle } from '@/components/CargoInformationForm';
import FareSummary from '@/components/booking/FareSummary';
import PassengerDetailsForm from '@/components/booking/passenger-details/PassengerDetailsForm';
import PassengerTripCard from '@/components/booking/PassengerTripCard';
import PaymentMethodSelector, { PaymentMethodType } from '@/components/booking/payment/PaymentMethodSelector';
import { useThemeSettings } from '@/hooks/theme-settings';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useRef } from 'react';
import { PiInfo } from 'react-icons/pi';
import { FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { IoArrowBack } from 'react-icons/io5';
import { getTrips } from '@/services';
import { fetchItem } from 'helpers/cache.helpers';
import { PassengerData } from '@/types/booking/passenger-data';
import { VehicleData } from '@/types/booking/vehicle-data';
import { CargoData } from '@/types/booking/cargo-data';
import { ContactData } from '@/types/booking/contact-data';
import { ITrip } from '@/models';
import { VehicleInformationFormHandle } from '@/components/VehicleInformationForm';
import { Button } from '@/components/ui/Button';
import { IPrepareBookingData } from '@/models/booking/prepare-booking.model';

interface Props {
  departureTripId?: string;
  returnTripId?: string;
  initialDepartureTrips?: ITrip[];
  initialReturnTrips?: ITrip[];
  prepareBookingData?: IPrepareBookingData;
  departureCabinName?: string;
  departureCabinId?: string;
  returnCabinName?: string;
  returnCabinId?: string;
  commodityId?: string;
}

export default function TripSummary({ departureTripId, returnTripId, initialDepartureTrips, initialReturnTrips, prepareBookingData, departureCabinName, departureCabinId, returnCabinName, returnCabinId, commodityId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Helper to get initial data from cache
  const getCachedData = () => {
    if (typeof window === 'undefined') return null;
    return fetchItem<any>('booking-json') || fetchItem<any>('booking-response');
  };

  const [departureTrips, setDepartureTrips] = useState<ITrip[]>(initialDepartureTrips || []);
  const [returnTrips, setReturnTrips] = useState<ITrip[]>(initialReturnTrips || []);
  const [passengerDetails, setPassengerDetails] = useState<any>(() => getCachedData()?.passengerDetails || null);
  const [vehicleDepartureDetails, setVehicleDepartureDetails] = useState<VehicleData[]>(() => getCachedData()?.vehicleDepartureDetails || []);
  const [cargoDetails, setCargoDetails] = useState<CargoData[]>(() => getCachedData()?.cargoDetails || []);
  const [contactDetails, setContactDetails] = useState<ContactData | null>(() => getCachedData()?.contactDetails || null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>(() => getCachedData()?.paymentMethod || 'credit-card');

  const themeSettings = useThemeSettings();
  const vehicleFormRef = useRef<VehicleInformationFormHandle>(null);
  const cargoFormRef = useRef<CargoInformationFormHandle>(null);
  const passengerFormRef = useRef<{ handleAddCompanion: () => void }>(null);

  // Booking state that consolidates all details
  const [bookingState, setBookingState] = useState<any>(null);

  // pricingData initialization
  const [pricingData, setPricingData] = useState<any>(() => getCachedData()?.pricingData || null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);

  const handleTriggerAddVehicle = () => {
    if (vehicleFormRef.current) {
      vehicleFormRef.current.addVehicle();
    }
  };

  const handleTriggerAddCargo = () => {
    if (cargoFormRef.current) {
      cargoFormRef.current.addCargo();
    }
  };

  const handleTriggerAddCompanion = () => {
    if (passengerFormRef.current) {
      passengerFormRef.current.handleAddCompanion();
    }
  };

  const handlePassengersChange = (data: { passenger: PassengerData; companions: PassengerData[] }) => {
    setPassengerDetails(data);
  };

  const handleVehiclesDepartureChange = useCallback((vehicles: VehicleData[]) => {
    setVehicleDepartureDetails(vehicles);
  }, []);

  const handleCargoChange = useCallback((cargos: CargoData[]) => {
    setCargoDetails(cargos);
  }, []);

  const handleContactChange = (contacts: ContactData) => {
    setContactDetails(contacts);
  };

  // Fetch trips
  const fetchTrips = useCallback(async () => {
    if (initialDepartureTrips || initialReturnTrips) return; // Skip fetching if initial data is provided

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

        const deps = (fetchedTrips?.length || 0) > 0 ? [fetchedTrips![0]] : [];
        const rets = (fetchedTrips?.length || 0) > 1 ? [fetchedTrips![1]] : [];
        setDepartureTrips(deps as ITrip[]);
        setReturnTrips(rets as ITrip[]);
      }
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    }
  }, [departureTripId, returnTripId, router, initialDepartureTrips, initialReturnTrips]);

  useEffect(() => {
    if (!initialDepartureTrips && !initialReturnTrips) {
      fetchTrips();
    }
  }, [fetchTrips, initialDepartureTrips, initialReturnTrips]);

  // Update booking state whenever any detail changes
  useEffect(() => {
    const buildBookingState = () => {
      const state: any = {
        route: {},
        passenger: [],
        cargo: {},
        vehicle: {}
      };

      // Build route object from prepareBookingData
      if (prepareBookingData) {
        if (prepareBookingData.departure && prepareBookingData.departure.length > 0) {
          const cabinNames = (departureCabinName || '').split('|');
          const cabinIds = (departureCabinId || '').split('|');

          prepareBookingData.departure.forEach((trip, index) => {
            const routeKey = trip.route_code;
            state.route[routeKey] = {
              cabinName: cabinNames[index] || cabinNames[0] || '',
              cabinId: cabinIds[index] || cabinIds[0] || ''
            };
          });
        }
        if (prepareBookingData.return && prepareBookingData.return.length > 0) {
          const cabinNames = (returnCabinName || '').split('|');
          const cabinIds = (returnCabinId || '').split('|');

          prepareBookingData.return.forEach((trip, index) => {
            const routeKey = trip.route_code;
            state.route[routeKey] = {
              cabinName: cabinNames[index] || cabinNames[0] || '',
              cabinId: cabinIds[index] || cabinIds[0] || ''
            };
          });
        }
      }

      // Build passenger array
      if (passengerDetails) {
        const allPassengers = [passengerDetails.passenger, ...passengerDetails.companions];
        state.passenger = allPassengers.map(p => (p?.discountType || 'Adult').toUpperCase());
      }

      // Build cargo object
      if (cargoDetails && cargoDetails.length > 0) {
        state.cargo = cargoDetails.reduce((acc, cargo, index) => {
          acc[`cargo_${index + 1}`] = {
            commodityId: cargo.commodityId || 0,
            quantity: cargo.quantity || 0,
            cbmRate: cargo.cbmRate || '',
            cargo_class: cargo.cargo_class || ''
          };
          return acc;
        }, {} as any);
      }

      // Build vehicle object
      if (vehicleDepartureDetails && vehicleDepartureDetails.length > 0) {
        state.vehicle = vehicleDepartureDetails.reduce((acc, vehicle, index) => {
          acc[`vehicle_${index + 1}`] = {
            vehicleTypeId: vehicle.vehicleTypeId || '',
            plateNumber: vehicle.plateNumber || '',
            driverId: vehicle.driverId || '',
            cargo_class: vehicle.cargo_class || ''
            // Add other vehicle fields as needed
          };
          return acc;
        }, {} as any);
      }



      setBookingState(state);
    };

    buildBookingState();
  }, [prepareBookingData, departureCabinName, returnCabinName, passengerDetails, cargoDetails, vehicleDepartureDetails]);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!bookingState) return;

      // Check for completeness
      // 1. Must have at least one passenger (derived from passenger array in bookingState)
      if (!bookingState.passenger || bookingState.passenger.length === 0) return;

      // 2. If vehicles are present, ensure they have required fields
      if (bookingState.vehicle && Object.keys(bookingState.vehicle).length > 0) {
        const vehicles = Object.values(bookingState.vehicle) as any[];
        const isIncomplete = vehicles.some(v => !v.vehicleTypeId || !v.plateNumber);
        if (isIncomplete) return;
      }

      // 3. If cargo is present, ensure they have required fields
      if (bookingState.cargo && Object.keys(bookingState.cargo).length > 0) {
        const cargos = Object.values(bookingState.cargo) as any[];
        const isIncomplete = cargos.some(c => !c.commodityId || !c.quantity); // basic check
        if (isIncomplete) return;
      }

      setIsPricingLoading(true);

      try {
        // Dynamic import to avoid circular dependency if any, or just standard import usage
        const { calculatePricing } = await import('@/services/booking/booking.service');
        const data = await calculatePricing(bookingState);
        setPricingData(data?.data);
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      } finally {
        setIsPricingLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPricing();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(debounceTimer);
  }, [bookingState]);

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
        <PassengerTripCard departureTrips={departureTrips} returnTrips={returnTrips} />
        <PassengerDetailsForm
          ref={passengerFormRef}
          rateTableId={departureTrips?.[0]?.rateTableId ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          vehicleCount={vehicleDepartureDetails.length}
          onChange={handlePassengersChange}
          onAddVehicle={handleTriggerAddVehicle}
        />

        <VehicleInformationForm
          ref={vehicleFormRef}
          rateTableId={departureTrips?.[0]?.rateTableId ?? 0}
          vehicleSlots={departureTrips?.[0]?.availableVehicleCapacity ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          initialVehicles={vehicleDepartureDetails}
          onChange={handleVehiclesDepartureChange}
        />

        <CargoInformationForm
          ref={cargoFormRef}
          initialCargos={cargoDetails}
          onChange={handleCargoChange}
        />

        {/* Horizontal Button Layout */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end items-center mt-6">
          <Button
            variant="outline"
            className="border-2 w-full sm:w-auto"
            onClick={handleTriggerAddCompanion}
            style={{
              borderColor: themeSettings?.accent || '#23abff',
              color: themeSettings?.accent || '#23abff'
            }}
          >
            <FiPlus className="w-4 h-4" />
            Add Companion
          </Button>

          <Button
            variant="outline"
            className="border-2 w-full sm:w-auto"
            onClick={handleTriggerAddVehicle}
            style={{
              borderColor: themeSettings?.accent || '#23abff',
              color: themeSettings?.accent || '#23abff'
            }}
          >
            <FiPlus className="w-4 h-4" />
            Add Vehicle
          </Button>

          <Button
            variant="outline"
            className="border-2 w-full sm:w-auto"
            onClick={handleTriggerAddCargo}
            style={{
              borderColor: themeSettings?.accent || '#23abff',
              color: themeSettings?.accent || '#23abff'
            }}
          >
            <FiPlus className="w-4 h-4" />
            Add Cargo
          </Button>
        </div>

        {/* Fully Booked Message */}
        <div className="text-sm text-customText leading-relaxed my-6 md:text-base">
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

        <ContactDetailsForm
          passengerDetails={passengerDetails?.passenger}
          initialContact={contactDetails}
          onChange={handleContactChange}
        />
      </div>

      {/* Right Column (Fare Summary) */}
      <div className="px-2 mt-6 md:mt-[65px] w-full md:w-auto">
        <FareSummary
          departureTrips={departureTrips}
          returnTrips={returnTrips}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          contactDetails={contactDetails ? contactDetails : undefined}
          vehicleDepartureDetails={vehicleDepartureDetails || undefined}
          vehicleReturnDetails={vehicleDepartureDetails || undefined}
          bookingState={bookingState}
          pricingData={pricingData}
          prepareBookingData={prepareBookingData}
          cargoDetails={cargoDetails}
          commodityId={commodityId}
          isLoading={isPricingLoading}
        />
      </div>
    </>
  );
}
