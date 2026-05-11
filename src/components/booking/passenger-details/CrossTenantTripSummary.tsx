'use client';

import ContactDetailsForm from '@/components/booking/passenger-details/ContactDetailsForm';
import VehicleInformationForm from '@/components/VehicleInformationForm';
import CargoInformationForm, { CargoInformationFormHandle } from '@/components/CargoInformationForm';
import FareSummary from '@/components/booking/FareSummary';
import PassengerDetailsForm from '@/components/booking/passenger-details/PassengerDetailsForm';
import PassengerTripCard from '@/components/booking/PassengerTripCard';
import { useThemeSettings } from '@/hooks/theme-settings';
import { useCallback, useEffect, useState, useRef } from 'react';
import { PiInfo } from 'react-icons/pi';
import { FiPlus } from 'react-icons/fi';
import Image from 'next/image';
import { IoArrowBack } from 'react-icons/io5';
import { fetchItem } from 'helpers/cache.helpers';
import { PassengerData } from '@/types/booking/passenger-data';
import { VehicleData } from '@/types/booking/vehicle-data';
import { CargoData } from '@/types/booking/cargo-data';
import { ContactData } from '@/types/booking/contact-data';
import { ITrip } from '@/models';
import { VehicleInformationFormHandle } from '@/components/VehicleInformationForm';
import { Button } from '@/components/ui/Button';
import { IPrepareBookingData } from '@/models/booking/prepare-booking.model';
import { PricingResponse } from '@/types/booking/pricing';
import { getTripSedanFitCapacity } from '@/services/shipping-line/trip.service';

export interface CrossTenantLeg {
  shippingLineId: string;
  tenantName?: string;
  tripId: string;
  returnTripId?: string;
  trips: ITrip[];
  returnTrips: ITrip[];
  prepareBookingData: IPrepareBookingData | undefined;
  cabinName: string;
  cabinId: string;
}

interface Props {
  legs: CrossTenantLeg[];
  departureCabinName?: string;
  departureCabinId?: string;
  commodityId?: string;
}

export default function CrossTenantTripSummary({ legs, departureCabinName, departureCabinId, commodityId }: Props) {
  const themeSettings = useThemeSettings();
  const vehicleFormRef = useRef<VehicleInformationFormHandle>(null);
  const cargoFormRef = useRef<CargoInformationFormHandle>(null);
  const passengerFormRef = useRef<{ handleAddCompanion: () => void }>(null);

  const getCachedData = () => {
    if (typeof window === 'undefined') return null;
    return fetchItem<any>('booking-json') || fetchItem<any>('booking-response');
  };

  // Shared state (entered once, applied to all legs)
  const [passengerDetails, setPassengerDetails] = useState<{ passenger: PassengerData; companions: PassengerData[] } | null>(() => {
    const cached = getCachedData();
    return cached?.passengerDetails || cached?.legForms?.[0]?.passengerDetails || null;
  });
  const [contactDetails, setContactDetails] = useState<ContactData | null>(() => getCachedData()?.contactDetails || null);
  const [vehicleDepartureDetails, setVehicleDepartureDetails] = useState<VehicleData[]>(() => {
    const cached = getCachedData();
    return cached?.vehicleDepartureDetails || cached?.legForms?.[0]?.vehicleDetails || [];
  });
  const [cargoDetails, setCargoDetails] = useState<CargoData[]>(() => {
    const cached = getCachedData();
    return cached?.cargoDetails || cached?.legForms?.[0]?.cargoDetails || [];
  });

  // Per-leg derived state
  const [legPricingData, setLegPricingData] = useState<(PricingResponse['data'] | null)[]>(() => {
    const cached = getCachedData();
    if (cached?.legForms) {
      return cached.legForms.map((lf: any) => lf.pricingData || null);
    }
    return legs.map(() => null);
  });
  const [legPricingLoading, setLegPricingLoading] = useState<boolean[]>(legs.map(() => false));
  const [liveVehicleCapacities, setLiveVehicleCapacities] = useState<Record<string, number>>({});

  const applyLiveCapacity = useCallback((trips: ITrip[]): ITrip[] => {
    return trips.map((trip) => {
      const liveCapacity = liveVehicleCapacities[String(trip.id)];
      if (typeof liveCapacity !== 'number') return trip;
      return {
        ...trip,
        availableVehicleCapacity: liveCapacity,
        remainingVehicleCapacity: {
          ...(trip.remainingVehicleCapacity || {}),
          sedanFit: {
            remaining: liveCapacity,
            max: trip.remainingVehicleCapacity?.sedanFit?.max ?? liveCapacity
          }
        }
      } as unknown as ITrip;
    });
  }, [liveVehicleCapacities]);

  const allDepartureTrips = applyLiveCapacity(legs.flatMap(leg => leg.trips));
  const allReturnTrips = applyLiveCapacity(legs.flatMap(leg => leg.returnTrips || []));
  const firstLegTrip = allDepartureTrips?.[0];
  const firstLegVehicleSlots = firstLegTrip?.availableVehicleCapacity ?? 0;
  const canAddVehicle = firstLegVehicleSlots > vehicleDepartureDetails.length;

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

  // Fetch pricing per leg with debounce
  useEffect(() => {
    if (!passengerDetails) return;
    if (vehicleDepartureDetails?.some(v => !v.vehicleTypeId || !v.plateNumber)) return;
    if (cargoDetails?.some(c => !c.commodityId || !c.quantity)) return;

    const timers = legs.map((leg, index) => {
      const pbData = leg.prepareBookingData;
      if (!pbData) return null;

      const allTrips = [...(pbData.departure || []), ...(pbData.return || [])];
      if (!allTrips.length) return null;

      const cabinIds = leg.cabinId.split('|');
      const tripCabinMap = new Map<string, number>();
      (pbData.departure || []).forEach((t, i) => {
        const id = Number(cabinIds[i] || cabinIds[0]);
        if (id) tripCabinMap.set(t.id, id);
      });

      const allPassengers = [passengerDetails.passenger, ...passengerDetails.companions];
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
        .map((v, i) => {
          const vtId = (index === 1 && v.leg2VehicleTypeId) ? v.leg2VehicleTypeId : v.vehicleTypeId;
          return {
            index: i,
            cargoType: 'rolling' as const,
            cargoClassCode: String(vtId),
            tripAssignments: allTrips.map(t => ({ tripId: t.id })),
          };
        });

      const looseCargos = (cargoDetails || [])
        .filter(c => c.commodityId && c.quantity)
        .map((c, i) => {
          const cargoClass = (index === 1 && c.leg2CargoClass) ? c.leg2CargoClass : c.cargo_class;
          return {
            index: vehicleCargos.length + i,
            cargoType: 'loose' as const,
            cargoClassCode: cargoClass || undefined,
            quantity: c.quantity,
            tripAssignments: allTrips.map(t => ({ tripId: t.id })),
          };
        });

      const pricingRequest = {
        routeCode: allTrips[0].route_code,
        // Same snapshot-locking the single-tenant TripSummary uses — without
        // it, the backend returns no charges and the leg's FareSummary loses
        // additional charges (fuel surcharge, VAT, terminal fees, …).
        snapshotId: allTrips[0].rate_snapshot_id ?? undefined,
        tripIds: allTrips.map(t => t.id),
        passengers,
        cargos: [...vehicleCargos, ...looseCargos],
      };

      return setTimeout(async () => {
        setLegPricingLoading(prev => { const next = [...prev]; next[index] = true; return next; });
        try {
          const { calculatePricing } = await import('@/services/booking/booking.service');
          const data = await calculatePricing(pricingRequest, undefined, leg.shippingLineId);
          setLegPricingData(prev => { const next = [...prev]; next[index] = data?.data || null; return next; });
        } catch (error) {
          console.error(`Failed to fetch pricing for leg ${index + 1}:`, error);
        } finally {
          setLegPricingLoading(prev => { const next = [...prev]; next[index] = false; return next; });
        }
      }, 500);
    });

    return () => { timers.forEach(t => { if (t) clearTimeout(t); }); };
  }, [legs, passengerDetails, vehicleDepartureDetails, cargoDetails]);

  useEffect(() => {
    let isCancelled = false;

    const tripsToSync = [...legs.flatMap(leg => leg.trips), ...legs.flatMap(leg => leg.returnTrips || [])];
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
  }, [legs]);

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

        <PassengerTripCard departureTrips={allDepartureTrips} returnTrips={allReturnTrips.length > 0 ? allReturnTrips : undefined} />

        {/* Shared Forms */}
        <PassengerDetailsForm
          key="passenger-form"
          ref={passengerFormRef}
          rateTableId={firstLegTrip?.rateTableId ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          vehicleCount={vehicleDepartureDetails.length}
          shippingLineId={legs[0]?.shippingLineId}
          passengerTypeCodes={legs[0]?.prepareBookingData?.passengerTypes}
          onChange={handlePassengersChange}
          onAddVehicle={handleTriggerAddVehicle}
        />

        <VehicleInformationForm
          key="vehicle-form"
          ref={vehicleFormRef}
          rateTableId={firstLegTrip?.rateTableId ?? 0}
          vehicleSlots={firstLegVehicleSlots}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          initialVehicles={vehicleDepartureDetails}
          shippingLineId={legs[0]?.shippingLineId}
          onChange={handleVehiclesDepartureChange}
          isCrossTenant={true}
          leg2ShippingLineId={legs[1]?.shippingLineId}
          vehicleClasses={legs[0]?.prepareBookingData?.vehicleClasses}
          leg2VehicleClasses={legs[1]?.prepareBookingData?.vehicleClasses}
        />

        <CargoInformationForm
          key="cargo-form"
          ref={cargoFormRef}
          initialCargos={cargoDetails}
          shippingLineId={legs[0]?.shippingLineId}
          onChange={handleCargoChange}
          isCrossTenant={true}
          leg2ShippingLineId={legs[1]?.shippingLineId}
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
            {firstLegVehicleSlots}
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
          departureTrips={allDepartureTrips}
          returnTrips={allReturnTrips.length > 0 ? allReturnTrips : undefined}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          contactDetails={contactDetails ? contactDetails : undefined}
          vehicleDepartureDetails={vehicleDepartureDetails || undefined}
          vehicleReturnDetails={vehicleDepartureDetails || undefined}
          cargoDetails={cargoDetails}
          commodityId={commodityId}
          isLoading={legPricingLoading.some(l => l)}
          isCrossTenant={true}
          legPricingData={legs.map((leg, index) => ({
            shippingLineId: leg.shippingLineId,
            tenantName: leg.tenantName,
            pricingData: legPricingData[index],
            prepareBookingData: leg.prepareBookingData,
            isLoading: legPricingLoading[index] || false
          }))}
        />
      </div>
    </>
  );
}
