'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContexts';

import TripDetails from '@/components/booking/payment-confirmation/TripDetails';
import PassengerTripCard from '@/components/booking/PassengerTripCard';
import FareSummary from '@/components/booking/FareSummary';
import PaymentMethodPicker, { PaymentPickerMethod } from '@/components/booking/payment-confirmation/PaymentMethodPicker';
import { cacheItem, fetchItem, invalidateItem } from 'helpers/cache.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { createBooking, prepareBooking, calculatePricing, getBookingPaymentId, createPaymongoCheckout, createMayaCheckout, getEnabledPaymentProviders, initiatePaymongoPaymentIntent, type EnabledPaymentProvider } from '@/services';
import { getShip } from '@/services/shipping-line/ship.service';
import { SuccessModal } from '@/components/ui/SuccessModal';
import { useToast } from '@/hooks/use-toast';
import { ITrip, IBooking } from '@/models';
import { IPrepareBookingData, ITripSummary } from '@/models/booking/prepare-booking.model';
import { PricingResponse } from '@/types/booking/pricing';

export interface CrossTenantPaymentLeg {
  shippingLineId: string;
  tripId: string;
  returnTripId?: string;
  trips: ITrip[];
  returnTrips: ITrip[];
  prepareBookingData: IPrepareBookingData | undefined;
}

interface Props {
  legs: CrossTenantPaymentLeg[];
  commodityId?: string;
}

export default function CrossTenantPaymentConfirmationDetails({ legs, commodityId }: Props) {
  const [departureTrips, setDepartureTrips] = useState<ITrip[] | undefined>(
    legs.flatMap(leg => leg.trips)
  );
  const [returnTrips, setReturnTrips] = useState<ITrip[] | undefined>(() => {
    const all = legs.flatMap(leg => leg.returnTrips);
    return all.length > 0 ? all : undefined;
  });
  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  const [legPricingData, setLegPricingData] = useState<(PricingResponse['data'] | null)[]>(
    legs.map(() => null)
  );
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [enabledProviders, setEnabledProviders] = useState<EnabledPaymentProvider[]>([]);
  const enabledProviderCodes = enabledProviders.map((p) => p.code);
  const [selectedMethod, setSelectedMethod] = useState<PaymentPickerMethod | null>(null);
  const { currentUser } = useAuth();
  const { error: toastError } = useToast();
  const themeSettings = useThemeSettings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    getEnabledPaymentProviders().then(setEnabledProviders);
  }, []);

  // Process Booking from cache
  const hasProcessedRef = useRef(false);

  const processBooking = useCallback(async () => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;

    const rawData = fetchItem<any>('booking-json');

    if (rawData && rawData.isCrossTenant) {
      const passengerDetails = rawData.passengerDetails;
      const contactDetails = rawData.contactDetails;
      const legForms = rawData.legForms || [];

      // Build normalized booking for display
      const depPax = passengerDetails
        ? [passengerDetails.passenger, ...passengerDetails.companions].map((p: any) => ({
            passenger: {
              ...p,
              firstName: p.firstname,
              lastName: p.lastname,
              sex: p.sex?.toLowerCase() || 'male',
              birthdayIso: p.dob,
              nationality: p.nationality,
            },
            discountType: p.discountType || 'Adult',
          }))
        : [];

      const depVeh = (rawData.vehicleDepartureDetails || []).map((v: any) => ({
        vehicle: {
          ...v,
          plateNo: v.plateNo || v.plateNumber || '',
          vehicleType: { name: v.vehicleTypeName },
        },
      }));

      // Build bookingTrips across all legs
      const bookingTrips: any[] = [];
      legs.forEach((leg, legIndex) => {
        const legData = legForms[legIndex];
        if (legData?.prepareBookingData?.departure) {
          legData.prepareBookingData.departure.forEach((trip: any, index: number) => {
            bookingTrips.push({
              tripId: trip.id,
              bookingTripPassengers: depPax,
              bookingTripVehicles: legIndex === 0 && index === 0 ? depVeh : [],
              bookingTripCargos: (rawData.cargoDetails || []).map((c: any) => ({
                commodity: { id: c.commodityId, name: c.commodityName },
                quantity: c.quantity || 1,
                price: parseFloat(c.cbmRate) || 0,
              })),
            });
          });
        }
        if (legData?.prepareBookingData?.return) {
          legData.prepareBookingData.return.forEach((trip: any) => {
            bookingTrips.push({
              tripId: trip.id,
              bookingTripPassengers: depPax,
              bookingTripVehicles: [],
              bookingTripCargos: (rawData.cargoDetails || []).map((c: any) => ({
                commodity: { id: c.commodityId, name: c.commodityName },
                quantity: c.quantity || 1,
                price: parseFloat(c.cbmRate) || 0,
              })),
            });
          });
        }
      });

      const normalizedBooking: any = {
        id: '0',
        consigneeName: contactDetails
          ? `${contactDetails.firstname} ${contactDetails.lastname}`
          : 'N/A',
        contactMobile: contactDetails?.mobileNumber,
        contactEmail: contactDetails?.email,
        bookingType: 'Single',
        bookingTrips,
      };

      const fullMetadata = { ...normalizedBooking, ...rawData };
      setBooking(fullMetadata);

      // Set per-leg pricing from cache
      setLegPricingData(legForms.map((lf: any) => lf.pricingData || null));

      cacheItem('booking-response', fullMetadata, 60 * 24);
      invalidateItem('booking-json');
    } else {
      // Fallback: try booking-response
      const responseBooking = fetchItem<IBooking>('booking-response');
      setBooking(responseBooking);
    }
  }, [legs]);

  useEffect(() => {
    processBooking();
  }, [processBooking]);

  // Create TWO bookings (one per leg), then ONE combined checkout
  const handleCreateBooking = useCallback(async () => {
    if (!booking) return false;

    const rawData = booking as any;
    const passengerDetails = rawData.passengerDetails;
    const contactDetails = rawData.contactDetails;
    const legForms = rawData.legForms || [];

    if (!passengerDetails || !contactDetails || !legForms.length) {
      console.error('Missing required cross-tenant booking data');
      toastError('Missing booking data. Please go back and try again.', { title: 'Booking Error' });
      return false;
    }

    // Resolve payment provider
    const isMayaEnabled = enabledProviderCodes.includes('maya');
    const isPaymongoEnabled = enabledProviderCodes.includes('paymongo');
    const bothEnabled = isMayaEnabled && isPaymongoEnabled;

    if (!isMayaEnabled && !isPaymongoEnabled) {
      toastError('No payment provider is currently available. Please contact support.', { title: 'Payment Error' });
      return false;
    }
    if (bothEnabled && !selectedMethod) {
      toastError('Please select a payment method to continue.', { title: 'Payment Method Required' });
      return false;
    }

    const effectiveMethod = bothEnabled ? selectedMethod! : (isMayaEnabled ? 'card' : 'paymongo-checkout');

    const epaymentMethodForDB: Record<string, string> = {
      'card': 'Maya',
      'gcash': 'GCash',
      'paymaya': 'PayMaya',
      'grab_pay': 'GrabPay',
      'qrph': 'QRPh',
      'dob': 'OnlineBanking',
      'paymongo-checkout': 'PayMongo',
    };
    const resolvedPaymentMethod = 'EPAYMENT';
    const resolvedEpaymentMethod = epaymentMethodForDB[effectiveMethod] ?? 'PayMongo';
    const tempTransactionRef = `PENDING-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

    const allRawPassengers = [passengerDetails.passenger, ...passengerDetails.companions];

    try {
      // === Create bookings for each leg ===
      const bookingIds: string[] = [];
      const bookingPaymentIds: string[] = [];

      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        const legForm = legForms[i];

        if (!legForm?.prepareBookingData) {
          console.error(`No prepareBookingData for leg ${i + 1}`);
          continue;
        }

        const bookingState = legForm.bookingState;

        // Build trips payload for this leg
        const legTrips: any[] = [];
        const allLegTripIds: string[] = [];

        (legForm.prepareBookingData.departure || []).forEach((trip: any, idx: number) => {
          legTrips.push({ tripType: 'departure', sequence: idx + 1, tripId: trip.id });
          allLegTripIds.push(trip.id);
        });
        (legForm.prepareBookingData.return || []).forEach((trip: any, idx: number) => {
          legTrips.push({ tripType: 'return', sequence: idx + 1, tripId: trip.id });
          allLegTripIds.push(trip.id);
        });

        // Build passengers with trip assignments for this leg
        const passengers = allRawPassengers.map((p: any) => {
          const tripAssignments: any[] = [];

          const addAssignments = (tripDataArray: any[]) => {
            if (!tripDataArray) return;
            tripDataArray.forEach((tripData: any) => {
              const routeCode = tripData?.route_code;
              const cabinInfo = bookingState?.route?.[routeCode || ''];

              let cabinId: number | null = null;
              let cabinName = '';

              if (typeof cabinInfo === 'object') {
                cabinId = cabinInfo.cabinId ? Number(cabinInfo.cabinId) : null;
                cabinName = cabinInfo.cabinName;
              } else {
                cabinName = cabinInfo || bookingState?.cabin_type_name || '';
              }

              if (!cabinId && tripData?.ship?.cabins && cabinName) {
                const matchedCabin = tripData.ship.cabins.find(
                  (c: any) => c.name === cabinName || c.cabin_type_name === cabinName
                );
                if (matchedCabin) cabinId = matchedCabin.id;
              }

              if (!cabinId && tripData?.ship?.cabins?.length === 1) {
                cabinId = tripData.ship.cabins[0].id;
              }

              tripAssignments.push({
                tripId: tripData.id,
                cabinId,
                cabin_type_name: cabinName,
                discountType: p.discountType || 'Adult',
              });
            });
          };

          addAssignments(legForm.prepareBookingData.departure || []);
          addAssignments(legForm.prepareBookingData.return || []);

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

        const allVehicleTripAssignments = allLegTripIds.map(id => ({ tripId: id }));

        const parseOptionalNumber = (value: unknown): number | undefined => {
          if (value === null || value === undefined || value === '') return undefined;
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : undefined;
        };

        const vehicles = (rawData.vehicleDepartureDetails || []).map((v: any) => ({
          plateNumber: v.plateNumber || v.plateNo || '',
          make: v.make || '',
          modelName: v.modelName || '',
          vehicleModelId: v.vehicleModelId || null,
          vehicleTypeId: v.vehicleTypeId || null,
          usesPendingModel: !v.vehicleModelId,
          driverId: (v.driverId != null && v.driverId !== '') ? String(v.driverId) : null,
          cargoClassCode: v.cargo_class || v.cargoClassCode || '',
          length: parseOptionalNumber(v.length) ?? 0,
          width: parseOptionalNumber(v.width) ?? 0,
          height: parseOptionalNumber(v.height) ?? 0,
          weight: parseOptionalNumber(v.weight) ?? parseOptionalNumber(v.weight_limit) ?? 0,
          tripAssignments: allVehicleTripAssignments,
        }));

        const payload = {
          bookingSource: 'online',
          bookingType: legTrips.length > 1 ? 'Round Trip' : 'Single',
          trips: legTrips,
          passengers,
          vehicles,
          looseCargos: (rawData.cargoDetails || []).map((c: any) => ({
            commodityId: c.commodityId || 0,
            quantity: c.quantity || 1,
            description: c.commodityName || 'Cargo',
            tripAssignments: allLegTripIds.map(id => ({ tripId: id })),
          })),
          consignee: `${contactDetails.firstname} ${contactDetails.lastname}`,
          voucherCode: '',
          referralCode: '',
          remarks: '',
          payment_method: resolvedPaymentMethod,
          epayment_method: resolvedEpaymentMethod,
          transaction_number: tempTransactionRef,
          isQuickBooking: false,
        };

        const result = await createBooking(payload, leg.shippingLineId);
        const bookingId = result?.data || result?.id;

        if (!bookingId) {
          console.error(`Booking creation failed for leg ${i + 1}`);
          toastError(`Failed to create booking for leg ${i + 1}. Please try again.`, { title: 'Booking Error' });
          return false;
        }

        bookingIds.push(bookingId);

        const paymentId = await getBookingPaymentId(bookingId, leg.shippingLineId);
        if (!paymentId) {
          console.error(`Failed to get payment ID for leg ${i + 1}`);
          toastError(`Failed to get payment ID for leg ${i + 1}.`, { title: 'Payment Error' });
          return false;
        }
        bookingPaymentIds.push(paymentId);
      }

      if (bookingIds.length === 0) {
        toastError('No bookings were created. Please try again.', { title: 'Booking Error' });
        return false;
      }

      // === Calculate combined grand total from all legs ===
      let combinedGrandTotal = 0;
      for (let i = 0; i < legPricingData.length; i++) {
        const legPricing = legPricingData[i];
        const legTotal = legPricing?.trips?.reduce((sum: number, t: any) => sum + (t.grandTotal || 0), 0) || 0;
        combinedGrandTotal += legTotal;
      }


      const amountInCents = Math.round(combinedGrandTotal * 100);
      if (amountInCents <= 0) {
        toastError('Invalid payment amount. Please try again.', { title: 'Payment Error' });
        return false;
      }

      // === Create ONE checkout session using leg 1's bookingPaymentId with combined total ===
      const primaryBookingId = bookingIds[0];
      const primaryPaymentId = bookingPaymentIds[0];
      const primaryShippingLineId = legs[0].shippingLineId;

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const successUrl = `${baseUrl}/booking/payment-success?booking_id=${primaryBookingId}&tenant_id=${primaryShippingLineId}`;
      const cancelUrl = typeof window !== 'undefined' ? window.location.href : '';

      let checkoutUrl: string | undefined;


      if (effectiveMethod === 'card') {
        const mayaRequest = {
          bookingPaymentId: primaryPaymentId,
          totalAmount: { value: combinedGrandTotal, currency: 'PHP' },
          buyer: {
            firstName: currentUser?.passenger?.firstName || currentUser?.email?.split('@')[0] || 'Guest',
            lastName: currentUser?.passenger?.lastName || currentUser?.email?.split('@')[1] || 'User',
            contact: {
              phone: currentUser?.passenger?.phone || '',
              email: currentUser?.email || 'noreply@ayahay.com',
            },
          },
          items: [{
            name: `Connecting Trip Booking`,
            quantity: 1,
            description: `Payment for bookings ${bookingIds.join(', ')}`,
            amount: { value: combinedGrandTotal },
            totalAmount: { value: combinedGrandTotal },
          }],
          successUrl,
          failureUrl: cancelUrl,
          cancelUrl,
          requestReferenceNumber: primaryBookingId,
          metadata: { bookingId: primaryBookingId, bookingPaymentId: primaryPaymentId, source: 'marketplace', isCrossTenant: true, allBookingIds: bookingIds },
        };
        const mayaResponse = await createMayaCheckout(mayaRequest, primaryShippingLineId);
        if (!mayaResponse?.data?.checkoutUrl) {
          toastError('Failed to create Maya payment session. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = mayaResponse.data.checkoutUrl;

      } else if (effectiveMethod === 'paymongo-checkout') {
        // No specific method picked — let PayMongo's hosted page show its
        // picker (only PayMongo enabled, no marketplace picker rendered).
        const checkoutRequest = {
          bookingPaymentId: primaryPaymentId,
          lineItems: [{
            name: `Connecting Trip Booking`,
            quantity: 1,
            amount: amountInCents,
            currency: 'PHP',
            description: `Payment for bookings ${bookingIds.join(', ')}`,
          }],
          paymentMethodTypes: ['gcash', 'paymaya', 'qrph', 'dob', 'grab_pay'],
          successUrl,
          cancelUrl,
          referenceNumber: primaryBookingId,
          description: `Payment for connecting trip bookings`,
          metadata: { bookingId: primaryBookingId, bookingPaymentId: primaryPaymentId, source: 'marketplace', isCrossTenant: true, allBookingIds: bookingIds },
        };
        const checkoutResponse = await createPaymongoCheckout(checkoutRequest, primaryShippingLineId);
        if (!checkoutResponse?.data?.checkoutUrl) {
          toastError('Failed to create PayMongo payment session. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = checkoutResponse.data.checkoutUrl;
      } else if (effectiveMethod === 'qrph' || effectiveMethod === 'dob') {
        // PayMongo Checkout Session restricted to one method — hosted page
        // skips its picker because only one method is allowed.
        const checkoutRequest = {
          bookingPaymentId: primaryPaymentId,
          lineItems: [{
            name: `Connecting Trip Booking`,
            quantity: 1,
            amount: amountInCents,
            currency: 'PHP',
            description: `Payment for bookings ${bookingIds.join(', ')}`,
          }],
          paymentMethodTypes: [effectiveMethod],
          successUrl,
          cancelUrl,
          referenceNumber: primaryBookingId,
          description: `Payment for connecting trip bookings`,
          metadata: { bookingId: primaryBookingId, bookingPaymentId: primaryPaymentId, source: 'marketplace', isCrossTenant: true, allBookingIds: bookingIds },
        };
        const checkoutResponse = await createPaymongoCheckout(checkoutRequest, primaryShippingLineId);
        if (!checkoutResponse?.data?.checkoutUrl) {
          toastError('Failed to create payment session. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = checkoutResponse.data.checkoutUrl;
      } else {
        // Payment Intent flow — gcash / paymaya / grab_pay redirect
        // straight to the e-wallet, no PayMongo picker shown.
        const intentRequest = {
          bookingPaymentId: primaryPaymentId,
          amount: combinedGrandTotal,
          paymentMethodType: effectiveMethod as 'gcash' | 'paymaya' | 'grab_pay',
          returnUrl: successUrl,
          billing: {
            name: `${currentUser?.passenger?.firstName || ''} ${currentUser?.passenger?.lastName || ''}`.trim() || undefined,
            email: currentUser?.email || undefined,
            phone: currentUser?.passenger?.phone || undefined,
          },
        };
        const intentResponse = await initiatePaymongoPaymentIntent(intentRequest, primaryShippingLineId);
        if (!intentResponse?.data?.redirectUrl) {
          toastError('Failed to initiate payment. Please try again.', { title: 'Payment Error' });
          return false;
        }
        checkoutUrl = intentResponse.data.redirectUrl;
      }

      window.location.href = checkoutUrl;
      return true;

    } catch (error: any) {
      console.error('Cross-tenant booking/payment error:', error);
      const errorMessage = error.response?.data?.message || 'Something went wrong while creating your booking.';
      toastError(errorMessage, { title: 'Booking Error' });
      return false;
    }
  }, [booking, legs, legPricingData, enabledProviders, selectedMethod, currentUser, toastError]);

  return (
    <>
      <div
        className="grid grid-cols-1 gap-4 bg-gray-50 px-3 pt-3
        md:grid-cols-2 lg:grid-cols-[2fr_1fr] lg:px-10"
      >
        {/* Left Column */}
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
            {enabledProviderCodes.includes('maya') && enabledProviderCodes.includes('paymongo') && (
              <PaymentMethodPicker
                providers={enabledProviders}
                selected={selectedMethod}
                onChange={setSelectedMethod}
              />
            )}
            <TripDetails booking={booking} />
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
            isLoading={isPricingLoading}
            onPay={handleCreateBooking}
            enabledProviders={enabledProviderCodes}
            selectedMethod={selectedMethod}
            isCrossTenant={true}
            legPricingData={legs.map((leg, index) => ({
              shippingLineId: leg.shippingLineId,
              pricingData: legPricingData[index],
              prepareBookingData: leg.prepareBookingData,
              isLoading: false,
            }))}
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
