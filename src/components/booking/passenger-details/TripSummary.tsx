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
import { getTripSedanFitCapacity } from '@/services/shipping-line/trip.service';

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

  const [pricingData, setPricingData] = useState<any>(() => getCachedData()?.pricingData || null);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [liveVehicleCapacities, setLiveVehicleCapacities] = useState<Record<string, number>>({});

  const applyLiveCapacity = useCallback((trips: ITrip[]) => {
    return trips.map((trip) => {
      const liveCapacity = liveVehicleCapacities[String(trip.id)];
      if (typeof liveCapacity !== 'number') return trip;
      return {
        ...trip,
        availableVehicleCapacity: liveCapacity,
        remainingVehicleCapacity: {
          ...(trip.remainingVehicleCapacity || {}),
          sedanFit: liveCapacity
        }
      };
    });
  }, [liveVehicleCapacities]);

  const departureTripsWithLive = applyLiveCapacity(departureTrips);
  const returnTripsWithLive = applyLiveCapacity(returnTrips);
  const departureVehicleSlots = departureTripsWithLive?.[0]?.availableVehicleCapacity ?? 0;
  const canAddVehicle = departureVehicleSlots > vehicleDepartureDetails.length;

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

  useEffect(() => {
    let isCancelled = false;

    const tripsToSync = [...departureTrips, ...returnTrips];
    const tripIds = Array.from(new Set(tripsToSync.map((trip) => String(trip.id)).filter(Boolean)));

    if (!tripIds.length) {
      setLiveVehicleCapacities({});
      return;
    }

    const syncLiveCapacities = async () => {
      const results = await Promise.all(
        tripIds.map(async (tripId) => {
          const capacity = await getTripSedanFitCapacity(tripId);
          return { tripId, capacity };
        })
      );

      if (isCancelled) return;

      const nextCapacities: Record<string, number> = {};
      results.forEach(({ tripId, capacity }) => {
        if (typeof capacity === 'number') {
          nextCapacities[tripId] = capacity;
        }
      });

      setLiveVehicleCapacities(nextCapacities);
    };

    void syncLiveCapacities();
    const intervalId = window.setInterval(() => {
      void syncLiveCapacities();
    }, 30000);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
  }, [departureTrips, returnTrips]);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!prepareBookingData || !passengerDetails) return;

      const allTrips = [...(prepareBookingData.departure || []), ...(prepareBookingData.return || [])];
      if (!allTrips.length) return;

      const allPassengers = [passengerDetails.passenger, ...passengerDetails.companions];

      // Validate vehicles and cargos are complete before pricing
      if (vehicleDepartureDetails?.some(v => !v.vehicleTypeId || !v.plateNumber)) return;
      if (cargoDetails?.some(c => !c.commodityId || !c.quantity)) return;

      const departureCabinIds = (departureCabinId || '').split('|');
      const returnCabinIds = (returnCabinId || '').split('|');
      const tripCabinMap = new Map<string, number>();
      (prepareBookingData.departure || []).forEach((t, i) => {
        const id = Number(departureCabinIds[i] || departureCabinIds[0]);
        if (id) tripCabinMap.set(t.id, id);
      });
      (prepareBookingData.return || []).forEach((t, i) => {
        const id = Number(returnCabinIds[i] || returnCabinIds[0]);
        if (id) tripCabinMap.set(t.id, id);
      });

      const passengers = allPassengers.map((p, i) => ({
        index: i,
        passengerType: p?.discountType || 'Adult',
        tripAssignments: allTrips.map(t => ({
          tripId: t.id,
          cabinId: tripCabinMap.get(t.id) ?? null,
          discountType: (p?.discountType || 'ADULT').toUpperCase(),
        })),
      }));

      const vehicleCargos = (vehicleDepartureDetails || [])
        .filter(v => v.vehicleTypeId)
        .map((v, i) => ({
          index: i,
          cargoType: 'rolling' as const,
          cargoClassCode: String(v.vehicleTypeId),
          tripAssignments: allTrips.map(t => ({ tripId: t.id })),
        }));

      const looseCargos = (cargoDetails || [])
        .filter(c => c.commodityId && c.quantity)
        .map((c, i) => ({
          index: vehicleCargos.length + i,
          cargoType: 'loose' as const,
          cargoClassCode: c.cargo_class || undefined,
          quantity: c.quantity,
          tripAssignments: allTrips.map(t => ({ tripId: t.id })),
        }));

      const pricingRequest = {
        routeCode: allTrips[0].route_code,
        tripIds: allTrips.map(t => t.id),
        passengers,
        cargos: [...vehicleCargos, ...looseCargos],
      };

      setIsPricingLoading(true);
      try {
        const { calculatePricing } = await import('@/services/booking/booking.service');
        const data = await calculatePricing(pricingRequest, undefined, shippingLineId);
        setPricingData(data?.data);
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      } finally {
        setIsPricingLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchPricing, 500);
    return () => clearTimeout(debounceTimer);
  }, [prepareBookingData, departureCabinId, returnCabinId, passengerDetails, vehicleDepartureDetails, cargoDetails, shippingLineId]);

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

        <PassengerTripCard departureTrips={departureTripsWithLive} returnTrips={returnTripsWithLive} />

        {/* Forms */}
        <PassengerDetailsForm
          key="passenger-form"
          ref={passengerFormRef}
          rateTableId={departureTrips?.[0]?.rateTableId ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          vehicleCount={vehicleDepartureDetails.length}
          shippingLineId={shippingLineId}
          passengerTypeCodes={prepareBookingData?.passengerTypes}
          onChange={handlePassengersChange}
          onAddVehicle={handleTriggerAddVehicle}
        />

        <VehicleInformationForm
          key="vehicle-form"
          ref={vehicleFormRef}
          rateTableId={departureTripsWithLive?.[0]?.rateTableId ?? 0}
          vehicleSlots={departureVehicleSlots}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          initialVehicles={vehicleDepartureDetails}
          shippingLineId={shippingLineId}
          vehicleClasses={prepareBookingData?.vehicleClasses}
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
            disabled={!canAddVehicle}
            title={!canAddVehicle ? 'No vehicle slots available to add more vehicles.' : undefined}
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

        <div className="text-sm text-customText mt-2 md:text-right">
          Live vehicle slots:{' '}
          <span className={`font-semibold ${canAddVehicle ? 'text-green-600' : 'text-red-600'}`}>
            {departureVehicleSlots}
          </span>
          {' '}
          {!canAddVehicle && <span className="text-red-600">(All slots currently used)</span>}
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
              <strong className="font-semibold">Hayahai customer service</strong> to ask for slots.
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
          departureTrips={departureTripsWithLive}
          returnTrips={returnTripsWithLive}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          contactDetails={contactDetails ? contactDetails : undefined}
          vehicleDepartureDetails={vehicleDepartureDetails || undefined}
          vehicleReturnDetails={vehicleDepartureDetails || undefined}
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
