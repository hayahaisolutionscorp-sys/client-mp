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
  const [legBookingStates, setLegBookingStates] = useState<any[]>(legs.map(() => null));
  const [legPricingData, setLegPricingData] = useState<(PricingResponse['data'] | null)[]>(() => {
    const cached = getCachedData();
    if (cached?.legForms) {
      return cached.legForms.map((lf: any) => lf.pricingData || null);
    }
    return legs.map(() => null);
  });
  const [legPricingLoading, setLegPricingLoading] = useState<boolean[]>(legs.map(() => false));

  const allDepartureTrips = legs.flatMap(leg => leg.trips);
  const allReturnTrips = legs.flatMap(leg => leg.returnTrips || []);
  const firstLegTrip = legs[0]?.trips?.[0];

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

  // Build bookingState per leg whenever form data changes
  useEffect(() => {
    const newStates = legs.map((leg, index) => {
      const state: any = { route: {}, passenger: [], cargo: {}, vehicle: {} };

      if (leg.prepareBookingData) {
        const cabinNames = leg.cabinName.split('|');
        const cabinIds = leg.cabinId.split('|');
        (leg.prepareBookingData.departure || []).forEach((trip: any, tIdx: number) => {
          state.route[trip.route_code] = {
            cabinName: cabinNames[tIdx] || cabinNames[0] || '',
            cabinId: cabinIds[tIdx] || cabinIds[0] || ''
          };
        });
        // Include return routes if available
        (leg.prepareBookingData.return || []).forEach((trip: any, tIdx: number) => {
          state.route[trip.route_code] = {
            cabinName: cabinNames[tIdx] || cabinNames[0] || '',
            cabinId: cabinIds[tIdx] || cabinIds[0] || ''
          };
        });
      }

      if (passengerDetails) {
        const allPassengers = [passengerDetails.passenger, ...passengerDetails.companions];
        state.passenger = allPassengers.map(p => (p?.discountType || 'Adult').toUpperCase());
      }

      if (cargoDetails && cargoDetails.length > 0) {
        state.cargo = cargoDetails.reduce((acc: any, cargo, idx) => {
          // Leg 2 uses leg2 overrides if available, always fall back to leg 1 values
          const commodityId = (index === 1 && cargo.leg2CommodityId) ? cargo.leg2CommodityId : cargo.commodityId;
          const cbmRate = (index === 1 && cargo.leg2CbmRate) ? cargo.leg2CbmRate : cargo.cbmRate;
          const cargoClass = (index === 1 && cargo.leg2CargoClass) ? cargo.leg2CargoClass : cargo.cargo_class;
          acc[`cargo_${idx + 1}`] = {
            commodityId: commodityId ?? 0,
            quantity: cargo.quantity ?? 0,
            cbmRate: cbmRate ?? '',
            cargo_class: cargoClass ?? ''
          };
          return acc;
        }, {});
      }

      if (vehicleDepartureDetails && vehicleDepartureDetails.length > 0) {
        state.vehicle = vehicleDepartureDetails.reduce((acc: any, vehicle, idx) => {
          // Leg 2 uses leg2 overrides if available, always fall back to leg 1 values
          const vehicleTypeId = (index === 1 && vehicle.leg2VehicleTypeId) ? vehicle.leg2VehicleTypeId : vehicle.vehicleTypeId;
          const cargoClass = (index === 1 && vehicle.leg2CargoClass) ? vehicle.leg2CargoClass : vehicle.cargo_class;
          acc[`vehicle_${idx + 1}`] = {
            vehicleTypeId: vehicleTypeId ?? '',
            plateNumber: vehicle.plateNumber ?? '',
            driverId: vehicle.driverId ?? '',
            cargo_class: cargoClass ?? ''
          };
          return acc;
        }, {});
      }

      return state;
    });

    setLegBookingStates(newStates);
  }, [legs, passengerDetails, cargoDetails, vehicleDepartureDetails]);

  // Fetch pricing per leg with debounce
  useEffect(() => {
    const timers = legBookingStates.map((bookingState, index) => {
      if (!bookingState) return null;
      if (!bookingState.passenger || bookingState.passenger.length === 0) return null;

      if (bookingState.vehicle && Object.keys(bookingState.vehicle).length > 0) {
        const vehicles = Object.values(bookingState.vehicle) as any[];
        if (vehicles.some(v => !v.vehicleTypeId || !v.plateNumber)) return null;
      }

      if (bookingState.cargo && Object.keys(bookingState.cargo).length > 0) {
        const cargos = Object.values(bookingState.cargo) as any[];
        if (cargos.some(c => !c.commodityId || !c.quantity)) return null;
      }

      return setTimeout(async () => {
        setLegPricingLoading(prev => {
          const next = [...prev];
          next[index] = true;
          return next;
        });

        try {
          const { calculatePricing } = await import('@/services/booking/booking.service');
          const data = await calculatePricing(bookingState, undefined, legs[index].shippingLineId);
          setLegPricingData(prev => {
            const next = [...prev];
            next[index] = data?.data || null;
            return next;
          });
        } catch (error) {
          console.error(`Failed to fetch pricing for leg ${index + 1}:`, error);
        } finally {
          setLegPricingLoading(prev => {
            const next = [...prev];
            next[index] = false;
            return next;
          });
        }
      }, 500);
    });

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [legBookingStates, legs]);

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
          onChange={handlePassengersChange}
          onAddVehicle={handleTriggerAddVehicle}
        />

        <VehicleInformationForm
          key="vehicle-form"
          ref={vehicleFormRef}
          rateTableId={firstLegTrip?.rateTableId ?? 0}
          vehicleSlots={firstLegTrip?.availableVehicleCapacity ?? 0}
          passengerDetails={passengerDetails ? passengerDetails : undefined}
          initialVehicles={vehicleDepartureDetails}
          shippingLineId={legs[0]?.shippingLineId}
          onChange={handleVehiclesDepartureChange}
          isCrossTenant={true}
          leg2ShippingLineId={legs[1]?.shippingLineId}
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
            bookingState: legBookingStates[index],
            isLoading: legPricingLoading[index] || false
          }))}
        />
      </div>
    </>
  );
}
