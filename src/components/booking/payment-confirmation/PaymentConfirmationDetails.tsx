'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import TripDetails from '@/components/booking/payment-confirmation/TripDetails';
import PassengerTripCard from '@/components/booking/PassengerTripCard';
import FareSummary from '@/components/booking/FareSummary';
import { cacheItem, fetchItem, invalidateItem } from 'helpers/cache.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { createBooking, prepareBooking, calculatePricing } from '@/services';
import { getShip } from '@/services/shipping-line/ship.service';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useToast } from '@/hooks/use-toast';
import { ITrip, IBooking } from '@/models';
import { IPrepareBookingData, ITripSummary } from '@/models/booking/prepare-booking.model';
import { PricingResponse } from '@/types/booking/pricing';

interface Props {
  departureTripId?: string;
  returnTripId?: string;
}

export default function PaymentConfirmationDetails({ departureTripId, returnTripId }: Props) {
  const router = useRouter();

  const [departureTrips, setDepartureTrips] = useState<ITrip[] | undefined>(undefined);
  const [returnTrips, setReturnTrips] = useState<ITrip[] | undefined>(undefined);
  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  const [prepareBookingData, setPrepareBookingData] = useState<IPrepareBookingData | undefined>(undefined);
  const [pricingData, setPricingData] = useState<PricingResponse['data'] | undefined>(undefined);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { error: toastError } = useToast();
  const themeSettings = useThemeSettings();

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page on component load
  }, []);

  // Map TripSummary to ITrip (copied/adapted from passenger-details/page.tsx)
  const mapTripSummaryToTrip = useCallback((summary: ITripSummary, shippingLineId: number = 0): ITrip => {
    // simplified mapping as we mostly need display info
    return {
      id: summary.id,
      shipId: summary.ship.id,
      shippingLineId: shippingLineId,
      status: summary.status as any,
      arrivalTimeDateIso: summary.scheduled_arrival,
      departureDateIso: summary.scheduled_departure,
      type: 'direct', // Defaulting for now
      srcPort: { name: summary.origin } as any,
      destPort: { name: summary.destination } as any,
      ship: {
        id: summary.ship.id,
        name: summary.ship.name,
        shippingLineId: shippingLineId,
      } as any
    } as ITrip;
  }, []);

  // Fetch trip details using prepareBooking
  const fetchTripDetails = useCallback(async () => {
    if (!departureTripId) return;
    if (prepareBookingData) return; // Already loaded from cache or previous call

    try {
      const response = await prepareBooking({
        departure: departureTripId.split(','),
        return: returnTripId ? returnTripId.split(',') : [],
      });

      if (response.data) {
        setPrepareBookingData(response.data);
        const mappedDepTrips: ITrip[] = [];
        const mappedRetTrips: ITrip[] = [];

        if (response.data.departure?.length > 0 || response.data.return?.length > 0) {
          for (const depSummary of response.data.departure || []) {
            const depShip = await getShip(depSummary.ship.id);
            mappedDepTrips.push(mapTripSummaryToTrip(depSummary, depShip?.shippingLineId));
          }

          for (const retSummary of response.data.return || []) {
            const retShip = await getShip(retSummary.ship.id);
            mappedRetTrips.push(mapTripSummaryToTrip(retSummary, retShip?.shippingLineId));
          }
        }

        setDepartureTrips(mappedDepTrips.length > 0 ? mappedDepTrips : undefined);
        setReturnTrips(mappedRetTrips.length > 0 ? mappedRetTrips : undefined);

        // 3. Fallback: If no booking exists (e.g. direct load), construct minimal one for UI
        setBooking(prev => {
          if (prev) return prev;

          const bookingTrips: any[] = [];
          response.data.departure?.forEach((trip: any) => {
            bookingTrips.push({ tripId: trip.id, bookingTripPassengers: [], bookingTripVehicles: [] });
          });
          response.data.return?.forEach((trip: any) => {
            bookingTrips.push({ tripId: trip.id, bookingTripPassengers: [], bookingTripVehicles: [] });
          });

          return {
            id: '0',
            bookingType: (response.data.return?.length > 0) ? 'Round Trip' : 'Single',
            bookingTrips
          } as any;
        });
      }
    } catch (error) {
      console.error('Failed to prepare booking:', error);
    }
  }, [departureTripId, returnTripId, mapTripSummaryToTrip, prepareBookingData]);

  useEffect(() => {
    fetchTripDetails();
  }, [fetchTripDetails]);

  // Process Booking and Create Tentative
  const hasProcessedRef = useRef(false);

  const processBooking = useCallback(async () => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const rawData = fetchItem<any>('booking-json');

    if (rawData) {
      // 1. Construct a normalized pseudo-booking object for UI rendering
      const depPax = [rawData.passengerDetails.passenger, ...rawData.passengerDetails.companions].map(p => ({
        passenger: {
          ...p,
          firstName: p.firstname,
          lastName: p.lastname,
          sex: p.sex?.toLowerCase() || 'male',
          birthdayIso: p.dob,
          nationality: p.nationality
        },
        discountType: p.discountType || 'Adult'
      }));

      const depVeh = (rawData.vehicleDepartureDetails || []).map((v: any) => ({
        vehicle: {
          ...v,
          plateNo: v.plateNo || '',
          vehicleType: { name: v.vehicleTypeName } // Mock for display
        }
      }));

      const bookingTrips: any[] = [];

      if (rawData.prepareBookingData?.departure) {
        rawData.prepareBookingData.departure.forEach((trip: any, index: number) => {
          bookingTrips.push({
            tripId: trip.id,
            bookingTripPassengers: depPax,
            bookingTripVehicles: index === 0 ? depVeh : [] // typically vehicles only load once, but depends on logic
          });
        });
      }

      if (rawData.prepareBookingData?.return) {
        const retVeh = (rawData.vehicleReturnDetails || []).map((v: any) => ({
          vehicle: { ...v, plateNo: v.plateNo || '', vehicleType: { name: v.vehicleTypeName } }
        }));
        rawData.prepareBookingData.return.forEach((trip: any, index: number) => {
          bookingTrips.push({
            tripId: trip.id,
            bookingTripPassengers: depPax, // Assuming same passengers return
            bookingTripVehicles: index === 0 ? retVeh : []
          });
        });
      }

      const normalizedBooking: any = {
        id: '0',
        consigneeName: `${rawData.contactDetails.firstname} ${rawData.contactDetails.lastname}`,
        contactMobile: rawData.contactDetails.mobileNumber,
        contactEmail: rawData.contactDetails.email,
        bookingType: (rawData.prepareBookingData?.return?.length > 0) ? 'Round Trip' : 'Single',
        bookingTrips
      };

      // Add raw data back for reference
      const fullMetadata = { ...normalizedBooking, ...rawData };

      // Use local state directly instead of creating a tentative booking
      setBooking(fullMetadata);

      // If cached prepareBookingData and pricingData exist, set them to avoid redundant calls
      if (rawData.prepareBookingData) {
        setPrepareBookingData(rawData.prepareBookingData);

        const mappedDepTrips: ITrip[] = [];
        const mappedRetTrips: ITrip[] = [];

        if (rawData.prepareBookingData.departure) {
          for (const dep of rawData.prepareBookingData.departure) {
            const ship = await getShip(dep.ship.id);
            mappedDepTrips.push(mapTripSummaryToTrip(dep, ship?.shippingLineId));
          }
        }
        if (rawData.prepareBookingData.return) {
          for (const ret of rawData.prepareBookingData.return) {
            const ship = await getShip(ret.ship.id);
            mappedRetTrips.push(mapTripSummaryToTrip(ret, ship?.shippingLineId));
          }
        }

        setDepartureTrips(mappedDepTrips.length > 0 ? mappedDepTrips : undefined);
        setReturnTrips(mappedRetTrips.length > 0 ? mappedRetTrips : undefined);
      }

      if (rawData.pricingData) {
        setPricingData(rawData.pricingData);
      }

      cacheItem('booking-response', fullMetadata, 60 * 24);
      invalidateItem('booking-json');
    } else {
      const responseBooking = fetchItem<IBooking>('booking-response');
      setBooking(responseBooking);
    }
  }, []);

  useEffect(() => {
    processBooking();
  }, [processBooking]);

  // Pricing Calculation
  useEffect(() => {
    const fetchPricing = async () => {
      if (!booking || !prepareBookingData || pricingData) return;

      setIsPricingLoading(true);
      try {
        const state: any = {
          route: {},
          passenger: [],
          cargo: {},
          vehicle: {}
        };

        const rawData = booking as any;
        const passengerDetails = rawData.passengerDetails;
        const bookingState = rawData.bookingState;

        // 1. Route Mapping
        if (bookingState) {
          if (prepareBookingData.departure) {
            prepareBookingData.departure.forEach((trip: any) => {
              const routeCode = trip?.route_code;
              const cabinInfo = bookingState.route?.[routeCode || ''];
              const cabinName = typeof cabinInfo === 'object' ? cabinInfo.cabinName : (cabinInfo || bookingState.cabin_type_name);
              if (routeCode && cabinName) state.route[routeCode] = cabinName;
            });
          }

          if (bookingState.returnTripId || prepareBookingData.return) {
            prepareBookingData.return?.forEach((trip: any) => {
              const routeCode = trip?.route_code;
              const cabinInfo = bookingState.route?.[routeCode || ''];
              const cabinName = typeof cabinInfo === 'object' ? cabinInfo.cabinName : (cabinInfo || bookingState.cabin_type_name);
              if (routeCode && cabinName) state.route[routeCode] = cabinName;
            });
          }
        }

        // 2. Passenger Mapping
        if (passengerDetails) {
          const allPass = [passengerDetails.passenger, ...passengerDetails.companions];
          state.passenger = allPass.map(p => (p.discountType || 'Adult').toUpperCase());
        } else if (rawData.bookingTrips?.[0]?.bookingTripPassengers) {
          // Fallback for tentative booking structure
          state.passenger = rawData.bookingTrips[0].bookingTripPassengers.map((p: any) => (p.discountType || 'Adult').toUpperCase());
        }

        // 3. Vehicle Mapping
        const vehicleDetails = rawData.vehicleDepartureDetails || (rawData.bookingTrips?.[0]?.bookingTripVehicles?.map((v: any) => v.vehicle));
        if (vehicleDetails) {
          vehicleDetails.forEach((v: any, index: number) => {
            state.vehicle[`vehicle_${index + 1}`] = {
              vehicleTypeId: v.vehicleTypeId || v.vehicleType?.id || '',
              plateNumber: v.plateNo || v.plateNumber || '',
              cargo_class: v.cargoClassCode || 'ROLLING' // Default to ROLLING if missing
            };
          });
        }

        const pricing = await calculatePricing(state);
        setPricingData(pricing.data);

      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      } finally {
        setIsPricingLoading(false);
      }
    };

    if (booking && prepareBookingData) {
      fetchPricing();
    }
  }, [booking, prepareBookingData]);

  // Final Booking Creation
  const handleCreateBooking = useCallback(async () => {
    if (!booking) return;

    const rawData = booking as any;
    const passengerDetails = rawData.passengerDetails;
    const contactDetails = rawData.contactDetails;
    const bookingState = rawData.bookingState;

    if (!passengerDetails || !contactDetails || !bookingState) {
      console.error('Missing required booking data');
      return;
    }

    const allTripIds = [
      ...(departureTripId ? departureTripId.split(',') : []),
      ...(returnTripId ? returnTripId.split(',') : [])
    ];

    const tripsPayload: any[] = [];
    const allLegIds: string[] = [];

    if (prepareBookingData?.departure) {
      prepareBookingData.departure.forEach((trip, idx) => {
        tripsPayload.push({ tripType: 'departure', sequence: idx + 1, tripId: trip.id });
        allLegIds.push(trip.id);
      });
    }
    if (prepareBookingData?.return) {
      prepareBookingData.return.forEach((trip, idx) => {
        tripsPayload.push({ tripType: 'return', sequence: idx + 1, tripId: trip.id });
        allLegIds.push(trip.id);
      });
    }

    const allRawPassengers = [passengerDetails.passenger, ...passengerDetails.companions];
    const passengers = allRawPassengers.map((p: any) => {
      const tripAssignments: any[] = [];

      const addAssignments = (tripDataArray: any[]) => {
        if (!tripDataArray) return;

        tripDataArray.forEach((tripData) => {
          const tripId = tripData.id;
          const routeCode = tripData?.route_code;
          const cabinInfo = bookingState.route?.[routeCode || ''];

          let cabinId: number | null = null;
          let cabinName = '';

          if (typeof cabinInfo === 'object') {
            cabinId = cabinInfo.cabinId ? Number(cabinInfo.cabinId) : null;
            cabinName = cabinInfo.cabinName;
          } else {
            cabinName = cabinInfo || bookingState.cabin_type_name;
          }

          if (!cabinId && tripData?.ship?.cabins && cabinName) {
            const matchedCabin = tripData.ship.cabins.find(
              (c: any) => c.name === cabinName || c.cabin_type_name === cabinName
            );
            if (matchedCabin) cabinId = matchedCabin.id;
          }

          if (!cabinId && tripData?.ship?.cabins?.length === 1) cabinId = tripData.ship.cabins[0].id;

          tripAssignments.push({
            tripId,
            cabinId,
            cabin_type_name: cabinName,
            discountType: p.discountType || 'Adult',
          });
        });
      };

      addAssignments(prepareBookingData?.departure || []);
      addAssignments(prepareBookingData?.return || []);

      return {
        firstName: p.firstname || '',
        lastName: p.lastname || '',
        sex: p.sex?.toLowerCase() || 'male',
        birthday: p.dob || '',
        address: p.address || '',
        nationality: p.nationality || '',
        mobileNumber: contactDetails.mobileNumber || '',
        email: contactDetails.email || '',
        tripAssignments,
      };
    });

    const allVehicleTripAssignments = allLegIds.map(id => ({ tripId: id }));

    const vehicles = (rawData.vehicleDepartureDetails || []).map((v: any) => ({
      plateNumber: v.plateNo || '',
      make: v.make || '',
      modelName: v.modelName || '',
      vehicleModelId: v.vehicleModelId || null,
      vehicleTypeId: v.vehicleTypeId || null,
      usesPendingModel: false,
      driverId: String(v.drivesVehicleId || '0'),
      cargoClassCode: v.cargoClassCode || '',
      length: v.length || 0,
      width: v.width || 0,
      height: v.height || 0,
      weight: v.weight || 0,
      tripAssignments: allVehicleTripAssignments,
    }));

    const payload = {
      bookingSource: 'online',
      bookingType: allTripIds.length > 1 ? 'Round Trip' : 'Single',
      trips: tripsPayload,
      passengers,
      vehicles,
      looseCargos: [],
      consignee: `${contactDetails.firstname} ${contactDetails.lastname}`,
      voucherCode: '',
      referralCode: '',
      remarks: '',
      payment_method: 'Cash',
      isQuickBooking: false,
    };

    console.log('Creating final booking with payload:', payload);
    try {
      const result = await createBooking(payload);

      const bookingId = result?.data || result?.id;
      if (bookingId) {
        router.push(`/booking/confirmed/${bookingId}`);
      } else {
        // This case might happen if result is empty but no error thrown
        toastError('Failed to create booking. Please try again.', { title: 'Booking Error' });
      }
    } catch (error: any) {
      console.error('Booking creation error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong while creating your booking.';
      toastError(errorMessage, { title: 'Booking Error' });
    }

  }, [booking, prepareBookingData, departureTripId, returnTripId, router]);

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
                style={{ color: themeSettings?.accent || '#23abff' }}
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
            <PassengerTripCard departureTrips={departureTrips} returnTrips={returnTrips} />
            {/* New TripDetails component handling Passengers, Vehicles, Cargo */}
            <TripDetails booking={booking} />
          </div>
        </div>

        {/* Right Column (Fare Summary) */}
        <div className="px-2 mt-6 lg:mt-16">
          <FareSummary
            departureTrips={departureTrips}
            returnTrips={returnTrips}
            booking={booking}
            pricingData={pricingData}
            prepareBookingData={prepareBookingData}
            isLoading={isPricingLoading}
            onPay={handleCreateBooking}
          />
        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        title="Booking Successful"
        description="Your booking has been created successfully."
      />
    </>
  );
}
