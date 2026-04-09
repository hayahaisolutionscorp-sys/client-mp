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
  shippingLineId?: string;
  commodityId?: string;
}

export default function TripSummary({ departureTripId, returnTripId, initialDepartureTrips, initialReturnTrips, prepareBookingData, departureCabinName, departureCabinId, returnCabinName, returnCabinId, shippingLineId, commodityId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getCachedData = () => {
    if (typeof window === 'undefined') return null;
    return fetchItem<any>('booking-json') || fetchItem<any>('booking-response');
  };

  const getInitialPassengerDetails = () => {
    const cached = getCachedData();
    if (!cached) return null;
    // Support both flat and legacy legForms[0] cache shapes
    return cached.passengerDetails || cached.legForms?.[0]?.passengerDetails || null;
  };

  const getInitialVehicleDetails = () => {
    const cached = getCachedData();
    if (!cached) return [];
    return cached.vehicleDepartureDetails || cached.legForms?.[0]?.vehicleDetails || [];
  };

  const getInitialCargoDetails = () => {
    const cached = getCachedData();
    if (!cached) return [];
    return cached.cargoDetails || cached.legForms?.[0]?.cargoDetails || [];
  };

  const [departureTrips, setDepartureTrips] = useState<ITrip[]>(initialDepartureTrips || []);
  const [returnTrips, setReturnTrips] = useState<ITrip[]>(initialReturnTrips || []);
  const [contactDetails, setContactDetails] = useState<ContactData | null>(() => getCachedData()?.contactDetails || null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>(() => getCachedData()?.paymentMethod || 'credit-card');

  const [passengerDetails, setPassengerDetails] = useState<{ passenger: PassengerData; companions: PassengerData[] } | null>(getInitialPassengerDetails);
  const [vehicleDepartureDetails, setVehicleDepartureDetails] = useState<VehicleData[]>(getInitialVehicleDetails);
  const [cargoDetails, setCargoDetails] = useState<CargoData[]>(getInitialCargoDetails);

  const themeSettings = useThemeSettings();
  const vehicleFormRef = useRef<VehicleInformationFormHandle>(null);
  const cargoFormRef = useRef<CargoInformationFormHandle>(null);
  const passengerFormRef = useRef<{ handleAddCompanion: () => void }>(null);

  const [bookingState, setBookingState] = useState<any>(null);
  const [pricingData, setPricingData] = useState<any>(() => getCachedData()?.pricingData || null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);

  const departureTrip = departureTrips[0];

  const handleTriggerAddVehicle = () => vehicleFormRef.current?.addVehicle();
  const handleTriggerAddCargo = () => cargoFormRef.current?.addCargo();
  const handleTriggerAddCompanion = () => passengerFormRef.current?.handleAddCompanion();

  const handlePassengersChange = useCallback((data: { passenger: PassengerData; companions: PassengerData[] }) => {
    setPassengerDetails(data);
  }, []);

  const handleVehiclesDepartureChange = useCallback((vehicles: VehicleData[]) => {
    setVehicleDepartureDetails(vehicles);
  }, []);

  const handleCargoChange = useCallback((cargos: CargoData[]) => {
    setCargoDetails(cargos);
  }, []);

  const handleContactChange = (contacts: ContactData) => {
    setContactDetails(contacts);
  };

  const handleBackLeg = () => {
    window.history.back();
  };

  const fetchTrips = useCallback(async () => {
    if (initialDepartureTrips || initialReturnTrips) return;

    try {
      const tripIds: number[] = [];
      if (departureTripId) tripIds.push(Number(departureTripId));
      if (returnTripId) tripIds.push(Number(returnTripId));

      if (tripIds.length > 0) {
        const fetchedTrips = await getTrips(tripIds);
        const fetchedTrip = fetchedTrips?.[0];
        if (fetchedTrip && fetchedTrip.status !== 'Awaiting') router.push('/');

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
    if (!initialDepartureTrips && !initialReturnTrips) fetchTrips();
  }, [fetchTrips, initialDepartureTrips, initialReturnTrips]);

  // Rebuild bookingState whenever form data changes
  useEffect(() => {
    const buildBookingState = () => {
      const state: any = { route: {}, passenger: [], cargo: {}, vehicle: {} };

      if (prepareBookingData) {
        if (prepareBookingData.departure && prepareBookingData.departure.length > 0) {
          const cabinNames = (departureCabinName || '').split('|');
          const cabinIds = (departureCabinId || '').split('|');
          prepareBookingData.departure.forEach((trip: any, index: number) => {
            state.route[trip.route_code] = {
              cabinName: cabinNames[index] || cabinNames[0] || '',
              cabinId: cabinIds[index] || cabinIds[0] || ''
            };
          });
        }
        if (prepareBookingData.return && prepareBookingData.return.length > 0) {
          const cabinNames = (returnCabinName || '').split('|');
          const cabinIds = (returnCabinId || '').split('|');
          prepareBookingData.return.forEach((trip: any, index: number) => {
            state.route[trip.route_code] = {
              cabinName: cabinNames[index] || cabinNames[0] || '',
              cabinId: cabinIds[index] || cabinIds[0] || ''
            };
          });
        }
      }

      if (passengerDetails) {
        const allPassengers = [passengerDetails.passenger, ...passengerDetails.companions];
        state.passenger = allPassengers.map(p => (p?.discountType || 'Adult').toUpperCase());
      }

      if (cargoDetails && cargoDetails.length > 0) {
        state.cargo = cargoDetails.reduce((acc: any, cargo, index) => {
          acc[`cargo_${index + 1}`] = {
            commodityId: cargo.commodityId || 0,
            quantity: cargo.quantity || 0,
            cbmRate: cargo.cbmRate || '',
            cargo_class: cargo.cargo_class || ''
          };
          return acc;
        }, {});
      }

      if (vehicleDepartureDetails && vehicleDepartureDetails.length > 0) {
        state.vehicle = vehicleDepartureDetails.reduce((acc: any, vehicle, index) => {
          acc[`vehicle_${index + 1}`] = {
            vehicleTypeId: vehicle.vehicleTypeId || '',
            plateNumber: vehicle.plateNumber || '',
            driverId: vehicle.driverId || '',
            cargo_class: vehicle.cargo_class || ''
          };
          return acc;
        }, {});
      }

      setBookingState(state);
    };

    buildBookingState();
  }, [prepareBookingData, departureCabinName, returnCabinName, departureCabinId, returnCabinId, passengerDetails, cargoDetails, vehicleDepartureDetails]);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!bookingState) return;
      if (!bookingState.passenger || bookingState.passenger.length === 0) return;

      if (bookingState.vehicle && Object.keys(bookingState.vehicle).length > 0) {
        const vehicles = Object.values(bookingState.vehicle) as any[];
        if (vehicles.some(v => !v.vehicleTypeId || !v.plateNumber)) return;
      }

      if (bookingState.cargo && Object.keys(bookingState.cargo).length > 0) {
        const cargos = Object.values(bookingState.cargo) as any[];
        if (cargos.some(c => !c.commodityId || !c.quantity)) return;
      }

      setIsPricingLoading(true);
      try {
        const { calculatePricing } = await import('@/services/booking/booking.service');
        const data = await calculatePricing(bookingState, undefined, shippingLineId);
        setPricingData(data?.data);
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      } finally {
        setIsPricingLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPricing, 500);
    return () => clearTimeout(debounceTimer);
  }, [bookingState]);

  return (
    <>
      <div className="px-2 w-full md:w-auto">
        <div className="flex items-center">
          <a
            onClick={handleBackLeg}
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

        {/* Forms */}
        <PassengerDetailsForm
          key="passenger-form"
          ref={passengerFormRef}
          rateTableId={departureTrips?.[0]?.rateTableId ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          vehicleCount={vehicleDepartureDetails.length}
          shippingLineId={shippingLineId}
          onChange={handlePassengersChange}
          onAddVehicle={handleTriggerAddVehicle}
        />

        <VehicleInformationForm
          key="vehicle-form"
          ref={vehicleFormRef}
          rateTableId={departureTrips?.[0]?.rateTableId ?? 0}
          vehicleSlots={departureTrips?.[0]?.availableVehicleCapacity ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          initialVehicles={vehicleDepartureDetails}
          shippingLineId={shippingLineId}
          onChange={handleVehiclesDepartureChange}
        />

        <CargoInformationForm
          key="cargo-form"
          ref={cargoFormRef}
          initialCargos={cargoDetails}
          shippingLineId={shippingLineId}
          onChange={handleCargoChange}
        />

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-end items-center mt-6">
          <Button
            variant="outline"
            className="border-2 w-full sm:w-auto"
            onClick={handleTriggerAddCompanion}
            style={{ borderColor: themeSettings?.accent || '#23abff', color: themeSettings?.accent || '#23abff' }}
          >
            <FiPlus className="w-4 h-4" />
            Add Companion
          </Button>

          <Button
            variant="outline"
            className="border-2 w-full sm:w-auto"
            onClick={handleTriggerAddVehicle}
            style={{ borderColor: themeSettings?.accent || '#23abff', color: themeSettings?.accent || '#23abff' }}
          >
            <FiPlus className="w-4 h-4" />
            Add Vehicle
          </Button>

          <Button
            variant="outline"
            className="border-2 w-full sm:w-auto"
            onClick={handleTriggerAddCargo}
            style={{ borderColor: themeSettings?.accent || '#23abff', color: themeSettings?.accent || '#23abff' }}
          >
            <FiPlus className="w-4 h-4" />
            Add Cargo
          </Button>
        </div>

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
          shippingLineId={shippingLineId}
          departureCabinId={departureCabinId}
          returnCabinId={returnCabinId}
          isLoading={isPricingLoading}
        />
      </div>
    </>
  );
}
