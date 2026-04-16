'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContexts';

import TripDetails from '@/components/booking/payment-confirmation/TripDetails';
import PassengerTripCard from '@/components/booking/PassengerTripCard';
import FareSummary from '@/components/booking/FareSummary';
import PaymentMethodPicker, {
  PaymentPickerMethod
} from '@/components/booking/payment-confirmation/PaymentMethodPicker';
import { cacheItem, fetchItem, invalidateItem } from 'helpers/cache.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import {
  createBooking,
  prepareBooking,
  calculatePricing,
  getBookingPaymentId,
  createPaymongoCheckout,
  createMayaCheckout,
  getEnabledPaymentProviders,
  initiatePaymongoPaymentIntent
} from '@/services';
import { getShip } from '@/services/shipping-line/ship.service';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useToast } from '@/hooks/use-toast';
import { ITrip, IBooking, IVehicleModel } from '@/models';
import { IPrepareBookingData, ITripSummary } from '@/models/booking/prepare-booking.model';
import { PricingResponse } from '@/types/booking/pricing';

interface Props {
  departureTripId?: string;
  returnTripId?: string;
  commodityId?: string;
  shippingLineId?: string;
  initialDepartureTrips?: ITrip[];
  initialReturnTrips?: ITrip[];
  initialPrepareBookingData?: IPrepareBookingData;
}
export default function PaymentConfirmationDetails({
  departureTripId,
  returnTripId,
  commodityId,
  shippingLineId: shippingLineIdProp,
  initialDepartureTrips,
  initialReturnTrips,
  initialPrepareBookingData
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shippingLineId = shippingLineIdProp ?? searchParams.get('shippingLineId') ?? undefined;

  const [departureTrips, setDepartureTrips] = useState<ITrip[] | undefined>(initialDepartureTrips);
  const [returnTrips, setReturnTrips] = useState<ITrip[] | undefined>(initialReturnTrips);
  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  const [prepareBookingData, setPrepareBookingData] = useState<IPrepareBookingData | undefined>(
    initialPrepareBookingData
  );
  const [pricingData, setPricingData] = useState<PricingResponse['data'] | undefined>(undefined);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [seatLabels, setSeatLabels] = useState<Record<string, Record<string, string>>>({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [enabledProviders, setEnabledProviders] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentPickerMethod | null>(null);
  const { currentUser } = useAuth();
  const { error: toastError } = useToast();
  const themeSettings = useThemeSettings();

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top of the page on component load
  }, []);

  useEffect(() => {
    const labels = fetchItem<Record<string, Record<string, string>>>('seat-assignment-labels');
    if (labels) setSeatLabels(labels);
  }, []);

  // Load enabled payment providers on mount so picker renders before user tries to pay
  useEffect(() => {
    getEnabledPaymentProviders().then(setEnabledProviders);
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
        shippingLineId: shippingLineId
      } as any
    } as ITrip;
  }, []);

  // Fetch trip details using prepareBooking
  const fetchTripDetails = useCallback(async () => {
    if (!departureTripId) return;
    if (prepareBookingData || initialDepartureTrips) return; // Already loaded from cache or previous call

    try {
      const response = await prepareBooking(
        {
          departure: departureTripId.split(','),
          return: returnTripId ? returnTripId.split(',') : []
        },
        commodityId,
        undefined,
        shippingLineId
      );

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
        setBooking((prev) => {
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
            bookingType: response.data.return?.length > 0 ? 'Round Trip' : 'Single',
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
      const depPax = [rawData.passengerDetails.passenger, ...rawData.passengerDetails.companions].map((p) => ({
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
            bookingTripVehicles: index === 0 ? depVeh : [], // typically vehicles only load once, but depends on logic
            bookingTripCargos: (rawData.cargoDetails || []).map((c: any) => ({
              commodity: { id: c.commodityId, name: c.commodityName },
              quantity: c.quantity || 1,
              price: parseFloat(c.cbmRate) || 0
            }))
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
            bookingTripVehicles: index === 0 ? retVeh : [],
            bookingTripCargos: (rawData.cargoDetails || []).map((c: any) => ({
              commodity: { id: c.commodityId, name: c.commodityName },
              quantity: c.quantity || 1,
              price: parseFloat(c.cbmRate) || 0
            }))
          });
        });
      }

      const normalizedBooking: any = {
        id: '0',
        consigneeName: `${rawData.contactDetails.firstname} ${rawData.contactDetails.lastname}`,
        contactMobile: rawData.contactDetails.mobileNumber,
        contactEmail: rawData.contactDetails.email,
        bookingType: rawData.prepareBookingData?.return?.length > 0 ? 'Round Trip' : 'Single',
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
        const rawData = booking as any;
        const passengerDetails = rawData.passengerDetails;
        const allTrips = [...(prepareBookingData.departure || []), ...(prepareBookingData.return || [])];
        if (!allTrips.length) return;

        const departureCabinIds = (searchParams.get('departureCabinId') || '').split('|');
        const returnCabinIds = (searchParams.get('returnCabinId') || '').split('|');
        const tripCabinMap = new Map<string, number>();
        (prepareBookingData.departure || []).forEach((trip, index) => {
          const id = Number(departureCabinIds[index] || departureCabinIds[0]);
          if (id) tripCabinMap.set(trip.id, id);
        });
        (prepareBookingData.return || []).forEach((trip, index) => {
          const id = Number(returnCabinIds[index] || returnCabinIds[0]);
          if (id) tripCabinMap.set(trip.id, id);
        });

        // 1. Passenger Mapping
        let passengers: {
          index: number;
          passengerType: string;
          tripAssignments: { tripId: string; cabinId?: number | null; discountType?: string }[];
        }[] = [];

        if (passengerDetails) {
          const allPass = [passengerDetails.passenger, ...passengerDetails.companions];
          passengers = allPass.map((passenger, index) => ({
            index,
            passengerType: passenger?.discountType || 'Adult',
            tripAssignments: allTrips.map((trip) => ({
              tripId: trip.id,
              cabinId: tripCabinMap.get(trip.id) ?? null,
              discountType: (passenger?.discountType || 'ADULT').toUpperCase()
            }))
          }));
        } else if (rawData.bookingTrips?.[0]?.bookingTripPassengers) {
          passengers = rawData.bookingTrips[0].bookingTripPassengers.map((passenger: any, index: number) => ({
            index,
            passengerType: passenger?.discountType || 'Adult',
            tripAssignments: allTrips.map((trip) => ({
              tripId: trip.id,
              cabinId: tripCabinMap.get(trip.id) ?? null,
              discountType: (passenger?.discountType || 'ADULT').toUpperCase()
            }))
          }));
        }

        // 2. Vehicle + cargo mapping
        const cargos: {
          index: number;
          cargoType: 'rolling' | 'loose';
          cargoClassCode?: string;
          quantity?: number;
          tripAssignments: { tripId: string }[];
        }[] = [];

        const vehicleDetails =
          rawData.vehicleDepartureDetails || rawData.bookingTrips?.[0]?.bookingTripVehicles?.map((v: any) => v.vehicle);
        if (vehicleDetails) {
          vehicleDetails.forEach((vehicle: any, index: number) => {
            const cargoClassCode = String(vehicle.vehicleTypeId || vehicle.vehicleType?.id || '').trim();
            if (!cargoClassCode) return;

            cargos.push({
              index,
              cargoType: 'rolling',
              cargoClassCode,
              tripAssignments: allTrips.map((trip) => ({ tripId: trip.id }))
            });
          });
        }

        const cargoDetails = rawData.cargoDetails || rawData.bookingTrips?.[0]?.bookingTripCargos;
        if (cargoDetails) {
          cargoDetails.forEach((cargo: any, index: number) => {
            cargos.push({
              index: cargos.length + index,
              cargoType: 'loose',
              cargoClassCode: cargo.cargo_class || undefined,
              quantity: Number(cargo.quantity || 1),
              tripAssignments: allTrips.map((trip) => ({ tripId: trip.id }))
            });
          });
        }

        const pricingRequest = {
          routeCode: allTrips[0].route_code,
          tripIds: allTrips.map((trip) => trip.id),
          passengers,
          cargos
        };
        const pricing = await calculatePricing(pricingRequest, undefined, shippingLineId);
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

  // Final Booking Creation and PayMongo Integration
  const handleCreateBooking = useCallback(async () => {
    if (!booking) return;

    const rawData = booking as any;
    const fallbackCache = fetchItem<any>('booking-response') || fetchItem<any>('booking-json') || {};

    const passengerDetails = rawData.passengerDetails || fallbackCache.passengerDetails;
    const contactDetails = rawData.contactDetails || fallbackCache.contactDetails;
    const bookingState = rawData.bookingState || fallbackCache.bookingState || {};

    const departureCabinIds = (searchParams.get('departureCabinId') || '').split('|');
    const returnCabinIds = (searchParams.get('returnCabinId') || '').split('|');
    const departureCabinNames = (searchParams.get('departureCabinName') || '').split('|');
    const returnCabinNames = (searchParams.get('returnCabinName') || '').split('|');

    const getCabinSelection = (tripData: any, index: number, tripType: 'departure' | 'return') => {
      const routeCode = tripData?.route_code;
      const routeBased = routeCode ? bookingState.route?.[routeCode] : undefined;
      const routeName = typeof routeBased === 'object' ? routeBased.cabinName : routeBased;
      const routeId = typeof routeBased === 'object' && routeBased.cabinId ? Number(routeBased.cabinId) : null;

      const ids = tripType === 'departure' ? departureCabinIds : returnCabinIds;
      const names = tripType === 'departure' ? departureCabinNames : returnCabinNames;
      const queryCabinId = Number(ids[index] || ids[0]);
      const queryCabinName = names[index] || names[0] || '';

      return {
        cabinId: routeId || (Number.isFinite(queryCabinId) && queryCabinId > 0 ? queryCabinId : null),
        cabinName: routeName || queryCabinName || bookingState.cabin_type_name || ''
      };
    };

    if (!passengerDetails || !contactDetails) {
      console.error('Missing required booking data', {
        hasPassengerDetails: Boolean(passengerDetails),
        hasContactDetails: Boolean(contactDetails),
        hasBookingState: Boolean(bookingState && Object.keys(bookingState).length > 0)
      });
      return;
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
    const seatAssignments = fetchItem<Record<string, Record<string, string>>>('seat-assignments') || {};
    const passengers = allRawPassengers.map((p: any, pIndex: number) => {
      const passengerKey = `p-${pIndex}`;
      const tripAssignments: any[] = [];

      const addAssignments = (tripDataArray: any[]) => {
        if (!tripDataArray) return;

        tripDataArray.forEach((tripData, index) => {
          const tripId = tripData.id;
          const isReturnTrip = (prepareBookingData?.return || []).some((trip) => trip.id === tripId);
          const selection = getCabinSelection(tripData, index, isReturnTrip ? 'return' : 'departure');

          let cabinId: number | null = selection.cabinId;
          let cabinName = selection.cabinName;
          if (!cabinId && tripData?.ship?.cabins && cabinName) {
            const matchedCabin = tripData.ship.cabins.find(
              (c: any) => c.name === cabinName || c.cabin_type_name === cabinName
            );
            if (matchedCabin) cabinId = matchedCabin.id;
          }

          if (!cabinId && tripData?.ship?.cabins?.length === 1) cabinId = tripData.ship.cabins[0].id;

          const seatId = seatAssignments[passengerKey]?.[tripId] || undefined;

          tripAssignments.push({
            tripId,
            cabinId,
            cabin_type_name: cabinName,
            discountType: p.discountType || 'Adult',
            ...(seatId ? { seatId } : {})
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
        tripAssignments
      };
    });

    const allVehicleTripAssignments = allLegIds.map((id) => ({ tripId: id }));

    const isMayaEnabled = enabledProviders.includes('maya');
    const isPaymongoEnabled = enabledProviders.includes('paymongo');
    const bothEnabled = isMayaEnabled && isPaymongoEnabled;

    if (!isMayaEnabled && !isPaymongoEnabled) {
      toastError('No payment provider is currently available. Please contact support.', { title: 'Payment Error' });
      return false;
    }
    if (bothEnabled && !selectedMethod) {
      toastError('Please select a payment method to continue.', { title: 'Payment Method Required' });
      return false;
    }

    const effectiveMethod = bothEnabled ? selectedMethod! : isMayaEnabled ? 'card' : 'paymongo-checkout';

    const epaymentMethodForDB: Record<string, string> = {
      card: 'Maya',
      gcash: 'GCash',
      paymaya: 'PayMaya',
      grab_pay: 'GrabPay',
      qrph: 'QRPh',
      dob: 'OnlineBanking',
      'paymongo-checkout': 'PayMongo'
    };
    const resolvedPaymentMethod = 'ONLINE';
    const resolvedEpaymentMethod = epaymentMethodForDB[effectiveMethod] ?? 'PayMongo';
    const tempTransactionRef = `PENDING-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const bookingSource = typeof window !== 'undefined' ? window.location.origin : 'unknown';

    const parseOptionalNumber = (value: unknown): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const vehicles = (rawData.vehicleDepartureDetails || []).map((v: any) => {
      const matchedModelId = v.vehicleModelId;

      return {
        plateNumber: v.plateNumber || v.plateNo || '',
        make: v.make || '',
        modelName: v.modelName || '',
        vehicleModelId: matchedModelId || null,
        vehicleTypeId: v.vehicleTypeId || null,
        usesPendingModel: !matchedModelId,
        driverId: v.driverId != null && v.driverId !== '' ? String(v.driverId) : null,
        cargoClassCode: v.cargo_class || v.cargoClassCode || '',
        length: parseOptionalNumber(v.length) ?? 0,
        width: parseOptionalNumber(v.width) ?? 0,
        height: parseOptionalNumber(v.height) ?? 0,
        weight: parseOptionalNumber(v.weight) ?? parseOptionalNumber(v.weight_limit) ?? 0,
        tripAssignments: allVehicleTripAssignments
      };
    });

    const payload = {
      bookingSource: bookingSource,
      bookingType: allTripIds.length > 1 ? 'Round Trip' : 'Single',
      trips: tripsPayload,
      passengers,
      vehicles,
      looseCargos: (rawData.cargoDetails || []).map((c: any) => ({
        commodityId: c.commodityId || 0,
        quantity: c.quantity || 1,
        description: c.commodityName || 'Cargo',
        tripAssignments: allLegIds.map((id) => ({ tripId: id }))
      })),
      consignee: `${contactDetails.firstname} ${contactDetails.lastname}`,
      voucherCode: '',
      referralCode: '',
      remarks: '',
      payment_method: resolvedPaymentMethod,
      epayment_method: resolvedEpaymentMethod,
      transaction_number: tempTransactionRef,
      isQuickBooking: false
    };

    try {
      // Step 1: Create booking
      const result = await createBooking(payload, shippingLineId);
      const bookingId = result?.data || result?.id;

      if (!bookingId) {
        console.error('Booking creation failed - no ID returned');
        toastError('Failed to create booking. Please try again.', { title: 'Booking Error' });
        return false;
      }

      // Step 2: Get booking payment ID
      const bookingPaymentId = await getBookingPaymentId(bookingId, shippingLineId);

      if (!bookingPaymentId) {
        console.error('Failed to get booking payment ID');
        toastError('Failed to initiate payment. Please contact support.', { title: 'Payment Error' });
        return false;
      }

      // Step 3: Calculate grand total from pricing data
      const grandTotal =
        typeof pricingData?.grandTotal === 'number'
          ? pricingData.grandTotal
          : pricingData?.trips?.reduce((sum, trip) => sum + (trip.grandTotal || 0), 0) || 0;
      console.log('Grand total (PHP):', grandTotal);

      // Convert grand total to cents for PayMongo
      const amountInCents = Math.round(grandTotal * 100);

      if (amountInCents <= 0) {
        console.error('Invalid amount:', amountInCents);
        toastError('Invalid payment amount. Please try again.', { title: 'Payment Error' });
        return false;
      }

      // Step 4: Route to the correct payment provider based on enabled providers and selected method
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = shippingLineId
        ? `${baseUrl}/booking/payment-success?booking_id=${bookingId}&tenant_id=${shippingLineId}`
        : `${baseUrl}/booking/payment-success?booking_id=${bookingId}`;
      const cancelUrl = `${baseUrl}/booking/payment-confirmation?departureTripId=${departureTripId || ''}&returnTripId=${returnTripId || ''}&commodityId=${commodityId || ''}`;

      let checkoutUrl: string | undefined;

      if (effectiveMethod === 'card') {
        // Maya hosted checkout (handles card payments)
        const amountInPHP = grandTotal;
        const mayaRequest = {
          bookingPaymentId,
          totalAmount: { value: amountInPHP, currency: 'PHP' },
          buyer: {
            firstName: currentUser?.passenger?.firstName || currentUser?.email?.split('@')[0] || 'Guest',
            lastName: currentUser?.passenger?.lastName || currentUser?.email?.split('@')[1] || 'User',
            contact: {
              phone: currentUser?.passenger?.phone || '',
              email: currentUser?.email || 'noreply@ayahay.com'
            }
          },
          items: [
            {
              name: `Booking ${bookingId}`,
              quantity: 1,
              description: `Payment for booking ${bookingId}`,
              amount: { value: amountInPHP },
              totalAmount: { value: amountInPHP }
            }
          ],
          successUrl,
          failureUrl: cancelUrl,
          cancelUrl,
          requestReferenceNumber: bookingId,
          metadata: { bookingId, bookingPaymentId, source: 'marketplace' }
        };
        const mayaResponse = await createMayaCheckout(mayaRequest, shippingLineId);
        if (!mayaResponse?.data?.checkoutUrl) {
          toastError('Failed to create Maya payment session. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = mayaResponse.data.checkoutUrl;
      } else if (effectiveMethod === 'paymongo-checkout') {
        // Only PayMongo enabled → use checkout session (user picks method on PayMongo's page)
        const amountInCentsCalc = Math.round(grandTotal * 100);
        const checkoutRequest = {
          bookingPaymentId,
          lineItems: [
            {
              name: `Booking ${bookingId}`,
              quantity: 1,
              amount: amountInCentsCalc,
              currency: 'PHP',
              description: `Payment for booking ${bookingId}`
            }
          ],
          paymentMethodTypes: ['gcash', 'paymaya', 'qrph', 'card', 'dob'],
          successUrl,
          cancelUrl,
          referenceNumber: bookingId,
          description: `Payment for booking ${bookingId}`,
          metadata: { bookingId, bookingPaymentId, source: 'marketplace' }
        };
        const checkoutResponse = await createPaymongoCheckout(checkoutRequest, shippingLineId);
        if (!checkoutResponse?.data?.checkoutUrl) {
          toastError('Failed to create PayMongo payment session. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = checkoutResponse.data.checkoutUrl;
      } else if (effectiveMethod === 'qrph' || effectiveMethod === 'dob') {
        const amountInCentsCalc = Math.round(grandTotal * 100);
        const checkoutRequest = {
          bookingPaymentId,
          lineItems: [
            {
              name: `Booking ${bookingId}`,
              quantity: 1,
              amount: amountInCentsCalc,
              currency: 'PHP',
              description: `Payment for booking ${bookingId}`
            }
          ],
          paymentMethodTypes: [effectiveMethod],
          successUrl,
          cancelUrl,
          referenceNumber: bookingId,
          description: `Payment for booking ${bookingId}`,
          metadata: { bookingId, bookingPaymentId, source: 'marketplace' }
        };
        const checkoutResponse = await createPaymongoCheckout(checkoutRequest, shippingLineId);
        if (!checkoutResponse?.data?.checkoutUrl) {
          toastError('Failed to create PayMongo payment session. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = checkoutResponse.data.checkoutUrl;
      } else {
        // Payment Intent flow: gcash, paymaya, grab_pay
        const intentRequest = {
          bookingPaymentId,
          amount: grandTotal,
          paymentMethodType: effectiveMethod as 'gcash' | 'paymaya' | 'grab_pay',
          returnUrl: successUrl,
          billing: {
            name:
              `${currentUser?.passenger?.firstName || ''} ${currentUser?.passenger?.lastName || ''}`.trim() ||
              undefined,
            email: currentUser?.email || undefined,
            phone: currentUser?.passenger?.phone || undefined
          }
        };
        const intentResponse = await initiatePaymongoPaymentIntent(intentRequest, shippingLineId);
        if (!intentResponse?.data?.redirectUrl) {
          toastError('Failed to initiate PayMongo payment. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = intentResponse.data.redirectUrl;
      }

      invalidateItem('seat-assignments');
      invalidateItem('seat-assignment-labels');
      setSeatLabels({});
      window.location.href = checkoutUrl;
      return true;
    } catch (error: any) {
      console.error('Booking/Payment error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong while creating your booking.';
      toastError(errorMessage, { title: 'Booking Error' });
      return false;
    }
  }, [
    booking,
    prepareBookingData,
    departureTripId,
    returnTripId,
    commodityId,
    pricingData,
    enabledProviders,
    selectedMethod,
    currentUser,
    toastError
  ]);

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
            {/* Payment method picker â€” shown when both Maya and PayMongo are enabled */}
            {enabledProviders.includes('maya') && enabledProviders.includes('paymongo') && (
              <PaymentMethodPicker selected={selectedMethod} onChange={setSelectedMethod} />
            )}
            {/* Booking details â€” Passengers, Vehicles, Cargo */}
            <TripDetails booking={booking} seatLabels={seatLabels} />
          </div>
        </div>

        {/* Right Column (Fare Summary) */}
        <div className="px-2 mt-6 lg:mt-16">
          <FareSummary
            departureTrips={departureTrips}
            returnTrips={returnTrips}
            booking={booking}
            cargoDetails={(booking as any)?.cargoDetails}
            commodityId={commodityId}
            pricingData={pricingData}
            prepareBookingData={prepareBookingData}
            isLoading={isPricingLoading}
            onPay={handleCreateBooking}
            enabledProviders={enabledProviders}
            selectedMethod={selectedMethod}
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
