'use client';

import { useState, useEffect, useMemo, type FC } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { FiChevronDown, FiChevronUp, FiLoader } from 'react-icons/fi';
import { AlertTriangle, Armchair, CheckCircle2 } from 'lucide-react';
import { SeatPickerDialog } from '@/components/booking/seat-selection/SeatPickerDialog';
import type { SeatPickerDialogTrip, SeatPickerDialogPassenger } from '@/components/booking/seat-selection/SeatPickerDialog';
import type { AssignmentsMap } from '@/components/booking/seat-selection/seat-picker.types';
import type { SeatLabelsMap } from '@/components/booking/seat-selection/SeatPicker';
import { FaCheckCircle } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { cacheItem } from 'helpers/cache.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { formatCurrency } from 'helpers/general.helpers';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog, DialogContent, DialogActions, DialogTitle } from '@/components/ui/Dialog';
import { PassengerData } from '@/types/booking/passenger-data';
import { VehicleData } from '@/types/booking/vehicle-data';
import { CargoData } from '@/types/booking/cargo-data';
import { ContactData } from '@/types/booking/contact-data';
import { PaymentInitiationRequest, PaymentInitiationResponse } from '@/types/payment/payment';
import { ITrip, IBooking } from '@/models';
import { startPaymentForBooking } from '@/services';
import { useAuth } from '@/contexts/AuthContexts';
import { PricingResponse } from '@/types/booking/pricing';

interface PassengerDetails {
  passenger: PassengerData;
  companions: PassengerData[];
}

export interface LegPricingInfo {
  shippingLineId: string;
  tenantName?: string;
  pricingData: PricingResponse['data'] | null;
  prepareBookingData: any;
  bookingState?: any;
  isLoading: boolean;
  passengerDetails?: { passenger: PassengerData; companions: PassengerData[] } | null;
  vehicleDetails?: VehicleData[];
  cargoDetails?: CargoData[];
}

interface FareSummaryProps {
  departureTrips?: ITrip[];
  returnTrips?: ITrip[];
  passengerDetails?: PassengerDetails;
  vehicleDepartureDetails?: VehicleData[];
  vehicleReturnDetails?: VehicleData[];
  contactDetails?: ContactData;
  booking?: IBooking;
  discountVoucher?: string;
  bookingState?: any;
  pricingData?: PricingResponse['data'];
  prepareBookingData?: any;
  cargoDetails?: CargoData[];
  commodityId?: string;
  shippingLineId?: string;
  departureCabinId?: string;
  returnCabinId?: string;
  isLoading?: boolean;
  onPay?: () => Promise<boolean | void>;
  enabledProviders?: string[];
  selectedMethod?: string | null;
  isCrossTenant?: boolean;
  legPricingData?: LegPricingInfo[];
}

const ObscuredPrice = ({ price, isLoading }: { price: number; isLoading?: boolean }) => {
  if (isLoading) {
    return <Skeleton className="h-4 w-16" />;
  }
  return <span className="flex items-center text-customText">{formatCurrency(price)}</span>;
};

const FareSummary: FC<FareSummaryProps> = ({
  departureTrips,
  returnTrips,
  passengerDetails,
  contactDetails,
  vehicleDepartureDetails,
  vehicleReturnDetails,
  booking,
  discountVoucher,
  bookingState,
  pricingData,
  prepareBookingData,
  cargoDetails,
  commodityId,
  shippingLineId,
  departureCabinId,
  returnCabinId,
  isLoading = false,
  onPay,
  enabledProviders = [],
  selectedMethod = null,
  isCrossTenant = false,
  legPricingData,
}) => {
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [payBooking, setPayBooking] = useState<PaymentInitiationResponse | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNavigatingToPayment, setIsNavigatingToPayment] = useState(false);

  // Expand/Collapse States
  const [isAdultDepExpanded, setIsAdultDepExpanded] = useState(false);
  const [isVehicleDepExpanded, setIsVehicleDepExpanded] = useState(false);
  const [isAdultRetExpanded, setIsAdultRetExpanded] = useState(false);
  const [isVehicleRetExpanded, setIsVehicleRetExpanded] = useState(false);
  const [isChargesDepExpanded, setIsChargesDepExpanded] = useState(false);
  const [isChargesRetExpanded, setIsChargesRetExpanded] = useState(false);

  const [showSeatLoginModal, setShowSeatLoginModal] = useState(false);
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [selectedSeatAssignments, setSelectedSeatAssignments] = useState<AssignmentsMap>({});
  const [selectedSeatLabels, setSelectedSeatLabels] = useState<SeatLabelsMap>({});

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const departureCabinNameParam = searchParams.get('departureCabinName');
  const returnCabinNameParam = searchParams.get('returnCabinName');
  const passengerCountParam = searchParams.get('passengerCount');
  const vehicleCountParam = searchParams.get('vehicleCount');
  const router = useRouter();
  const themeSettings = useThemeSettings();
  const { currentUser } = useAuth();

  const returnCabinName = searchParams.get('returnCabinName');

  useEffect(() => {
    const mainPassengerValid = !!(
      passengerDetails?.passenger?.firstname?.trim() &&
      passengerDetails?.passenger?.lastname?.trim() &&
      passengerDetails?.passenger?.sex?.trim() &&
      passengerDetails?.passenger?.dob?.trim() &&
      passengerDetails?.passenger?.nationality?.trim() &&
      passengerDetails?.passenger?.address?.trim()
    );

    const companionsValid = (passengerDetails?.companions ?? []).every(
      (c) =>
        c.firstname?.trim() &&
        c.lastname?.trim() &&
        c.sex?.trim() &&
        c.dob?.trim() &&
        c.nationality?.trim() &&
        c.address?.trim()
    );

    const contactValid = !!(
      contactDetails?.firstname?.trim() &&
      contactDetails?.lastname?.trim() &&
      contactDetails?.email?.trim() &&
      contactDetails?.mobileNumber?.trim()
    );

    const vehiclesValid = (vehicleDepartureDetails ?? []).every(
      (v) => v.vehicleTypeId && v.plateNumber?.trim()
    );

    const cargosValid = (cargoDetails ?? []).every(
      (c) => c.commodityId && c.quantity > 0
    );

    setIsFormValid(mainPassengerValid && companionsValid && contactValid && vehiclesValid && cargosValid);
  }, [passengerDetails, contactDetails, vehicleDepartureDetails, cargoDetails]);

  const buildPassengerDetailsUrl = () => {
    const p = new URLSearchParams();
    const dTripIds = departureTrips?.map(t => t.id).join(',') || '';
    const rTripIds = returnTrips?.map(t => t.id).join(',') || '';
    const computedPassengerCount = passengerDetails
      ? 1 + (passengerDetails.companions?.length ?? 0)
      : undefined;
    const computedVehicleCount = vehicleDepartureDetails?.length ?? undefined;

    const addParam = (key: string, value?: string | number | null) => {
      if (value !== undefined && value !== null && String(value).length > 0) {
        p.append(key, String(value));
      }
    };

    addParam('departureTripId', dTripIds || undefined);
    addParam('returnTripId', rTripIds || undefined);
    addParam('commodityId', commodityId);
    addParam('shippingLineId', shippingLineId);
    addParam('departureCabinId', departureCabinId);
    addParam('returnCabinId', returnCabinId);
    addParam('departureCabinName', departureCabinNameParam);
    addParam('returnCabinName', returnCabinNameParam);
    addParam('passengerCount', passengerCountParam ?? computedPassengerCount);
    addParam('vehicleCount', vehicleCountParam ?? computedVehicleCount);

    return `/booking/passenger-details?${p.toString()}`;
  };

  const cacheForAuthReturn = () => {
    cacheItem('booking-json', {
      passengerDetails,
      contactDetails,
      vehicleDepartureDetails,
      vehicleReturnDetails,
      cargoDetails,
      bookingState,
      prepareBookingData,
      pricingData,
    }, 900);
  };

  const handleLoginRedirect = () => {
    cacheForAuthReturn();
    setShowSeatLoginModal(false);
    router.push(`/login?returnUrl=${encodeURIComponent(buildPassengerDetailsUrl())}`);
  };

  const handleRegisterRedirect = () => {
    cacheForAuthReturn();
    setShowSeatLoginModal(false);
    router.push(`/register?returnUrl=${encodeURIComponent(buildPassengerDetailsUrl())}`);
  };

  const handleProceedToPayment = () => {
    setIsNavigatingToPayment(true);
    const departureTripIds = departureTrips?.map(t => t.id).join(',') || '';
    const returnTripIds = returnTrips?.map(t => t.id).join(',') || '';

    setError(null);

    if (isCrossTenant && legPricingData) {
      // Cache cross-tenant format with per-leg data
      const bookingJson = {
        isCrossTenant: true,
        contactDetails,
        passengerDetails,
        vehicleDepartureDetails,
        cargoDetails,
        legForms: legPricingData.map(leg => ({
          shippingLineId: leg.shippingLineId,
          tenantName: leg.tenantName,
          bookingState: leg.bookingState,
          pricingData: leg.pricingData,
          prepareBookingData: leg.prepareBookingData,
          passengerDetails: leg.passengerDetails,
          vehicleDetails: leg.vehicleDetails,
          cargoDetails: leg.cargoDetails,
        })),
      };
      cacheItem('booking-json', bookingJson, 60);

      const queryParams = new URLSearchParams();
      if (departureTripIds) queryParams.append('departureTripId', departureTripIds);
      if (returnTripIds) queryParams.append('returnTripId', returnTripIds);
      if (commodityId) queryParams.append('commodityId', commodityId);
      // Pass pipe-separated shippingLineIds for cross-tenant
      const allSlIds = legPricingData.map(l => l.shippingLineId).join('|');
      queryParams.append('shippingLineId', allSlIds);

      router.push(`/booking/payment-confirmation?${queryParams.toString()}`);
    } else {
      // Standard single-tenant cache
      const bookingJson = {
        passengerDetails,
        contactDetails,
        vehicleDepartureDetails,
        vehicleReturnDetails,
        cargoDetails,
        bookingState,
        prepareBookingData,
        pricingData,
      };
      cacheItem('booking-json', bookingJson, 900);

      const queryParams = new URLSearchParams();
      if (departureTripIds) queryParams.append('departureTripId', departureTripIds);
      if (returnTripIds) queryParams.append('returnTripId', returnTripIds);
      if (commodityId) queryParams.append('commodityId', commodityId);
      if (shippingLineId) queryParams.append('shippingLineId', shippingLineId);
      if (departureCabinId) queryParams.append('departureCabinId', departureCabinId);
      if (returnCabinId) queryParams.append('returnCabinId', returnCabinId);

      // Cache seat assignments if the user picked seats via the dialog
      if (Object.keys(selectedSeatAssignments).length > 0) {
        cacheItem('seat-assignments', selectedSeatAssignments, 900);
        cacheItem('seat-assignment-labels', selectedSeatLabels, 900);
      }

      router.push(`/booking/payment-confirmation?${queryParams.toString()}`);
    }
  };

const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (onPay) {
        const success = await onPay( );
        if (success) {
          // If successful, we DON'T set processing to false to maintain the loading state
          // until the page redirects.
          return;
        }
        // If not successful, we reset it.
        setIsProcessing(false);
        return;
      }

      const tentativeBookingId = Number(booking?.id || 0);
      const body: PaymentInitiationRequest = { paymentGateway: 'PayMongo' };
      const response = await startPaymentForBooking(tentativeBookingId, body);

      if (response && response.redirectUrl) {
        setPayBooking(response);
        window.open(response.redirectUrl);
        setShowMessage(true);
      } else {
        setShowMessage(false);
        console.error('Payment initiation failed.');
        setIsProcessing(false);
      }
    } catch (err) {
      setShowMessage(false);
      console.error('Payment initiation failed:', err);
      setIsProcessing(false);
    }
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    handlePayment();
  };

  // --- Process Pricing Data ---
  interface CrossTenantLegPricing {
    shippingLineId: string;
    tenantName?: string;
    depTrips: any[];
    retTrips: any[];
    depSubtotal: number;
    retSubtotal: number;
    legTotal: number;
    isLoading: boolean;
  }

  const {
    effectivePricingData,
    depTripsPricing,
    retTripsPricing,
    depSubtotal,
    retSubtotal,
    grandTotal,
    crossTenantLegs
  } = useMemo(() => {
    // Cross-tenant: produce per-leg pricing breakdown
    if (isCrossTenant && legPricingData) {
      const legs: CrossTenantLegPricing[] = legPricingData.map((leg) => {
        const trips = (leg.pricingData?.trips || []).map((t: any) => ({
          ...t,
          _tenantName: leg.tenantName,
          _shippingLineId: leg.shippingLineId
        }));

        // Split into departure and return using prepareBookingData
        let depTrips: any[] = [];
        let retTrips: any[] = [];

        if (leg.prepareBookingData) {
          const depIds = (leg.prepareBookingData.departure || []).map((t: any) => String(t.id));
          const retIds = (leg.prepareBookingData.return || []).map((t: any) => String(t.id));
          const depRouteCodes = (leg.prepareBookingData.departure || []).map((t: any) => String(t.route_code));
          const retRouteCodes = (leg.prepareBookingData.return || []).map((t: any) => String(t.route_code));

          depTrips = trips.filter((t: any) =>
            depIds.includes(String(t.tripId)) || depRouteCodes.includes(String(t.routeCode))
          );
          retTrips = trips.filter((t: any) =>
            retIds.includes(String(t.tripId)) || retRouteCodes.includes(String(t.routeCode))
          );
        } else {
          depTrips = trips;
        }

        const depSub = depTrips.reduce((sum: number, t: any) => sum + (t.subtotal || 0), 0);
        const retSub = retTrips.reduce((sum: number, t: any) => sum + (t.subtotal || 0), 0);

        return {
          shippingLineId: leg.shippingLineId,
          tenantName: leg.tenantName,
          depTrips,
          retTrips,
          depSubtotal: depSub,
          retSubtotal: retSub,
          legTotal: leg.pricingData?.grandTotal || depSub + retSub,
          isLoading: leg.isLoading
        };
      });

      const allDepTrips = legs.flatMap(l => l.depTrips);
      const allRetTrips = legs.flatMap(l => l.retTrips);
      const total = legs.reduce((sum, l) => sum + l.legTotal, 0);

      return {
        effectivePricingData: { trips: [...allDepTrips, ...allRetTrips], grandTotal: total },
        depTripsPricing: allDepTrips,
        retTripsPricing: allRetTrips,
        depSubtotal: allDepTrips.reduce((sum, t) => sum + (t.subtotal || 0), 0),
        retSubtotal: allRetTrips.reduce((sum, t) => sum + (t.subtotal || 0), 0),
        grandTotal: total,
        crossTenantLegs: legs
      };
    }

    let effective = pricingData;

    // If no pricingData (breakdown) is provided but we have a booking,
    // derive the breakdown from the booking data.
    if (!effective && booking) {
      const trips = booking.bookingTrips || [];
      const derivedTrips = trips.map((trip, index) => {
        const passengerPrices = (trip.bookingTripPassengers || []).map((p, pIndex) => ({
          index: pIndex,
          tripId: String(trip.tripId),
          routeCode: '', // Not strictly needed for display here
          passengerType: p.discountType || 'ADULT',
          accommodationCode: p.cabin?.name || '',
          baseFare: p.totalPrice || 0,
          currency: 'PHP'
        }));

        const cargoPrices = [
          ...(trip.bookingTripVehicles || []).map((v, vIndex) => ({
            index: vIndex,
            tripId: String(trip.tripId),
            routeCode: '',
            cargoType: 'VEHICLE',
            cargoClassCode: (v.vehicle as any)?.vehicleType?.name || v.vehicle?.vehicle_model?.vehicle_type?.name || 'Vehicle',
            baseFare: v.totalPrice || 0,
            currency: 'PHP',
            rateUnit: 'unit'
          })),
          ...((trip as any).bookingTripCargos || []).map((c: any, cIndex: number) => ({
            index: cIndex,
            tripId: String(trip.tripId),
            routeCode: '',
            cargoType: 'CARGO',
            cargoClassCode: c.commodity?.name || 'Cargo',
            baseFare: (c.price || 0) * (c.quantity || 1),
            currency: 'PHP',
            rateUnit: 'unit'
          }))
        ];

        const charges = (booking.bookingPaymentItems || [])
          .filter(item => item.tripId === trip.tripId && (item.type as any) === 'SERVICE_CHARGE') // example filter
          .map(item => ({
            ruleId: String(item.id),
            chargeCode: '',
            chargeName: item.description,
            category: 'SERVICE',
            amount: item.price,
            isInclusive: false,
            calcType: 'FIXED',
            basis: 'UNIT',
            showOnReceipt: true
          }));

        const subtotal = passengerPrices.reduce((sum, p) => sum + p.baseFare, 0) +
          cargoPrices.reduce((sum, c) => sum + c.baseFare, 0) +
          charges.reduce((sum, c) => sum + c.amount, 0);

        return {
          tripId: String(trip.tripId),
          routeCode: '',
          passengerPrices,
          cargoPrices,
          baseFare: {
            passengers: passengerPrices.reduce((sum, p) => sum + p.baseFare, 0),
            cargo: cargoPrices.reduce((sum, c) => sum + c.baseFare, 0),
            total: passengerPrices.reduce((sum, p) => sum + p.baseFare, 0) + cargoPrices.reduce((sum, c) => sum + c.baseFare, 0)
          },
          charges,
          chargesTotal: charges.reduce((sum, c) => sum + c.amount, 0),
          taxesTotal: 0,
          subtotal,
          grandTotal: subtotal
        };
      });

      effective = {
        trips: derivedTrips,
        grandTotal: booking.totalPrice
      } as any;
    }

    let dep: any[] = [];
    let ret: any[] = [];

    if (prepareBookingData) {
      const depIds = prepareBookingData.departure?.map((t: any) => String(t.id)) || [];
      const retIds = prepareBookingData.return?.map((t: any) => String(t.id)) || [];

      const depRouteCodes = prepareBookingData.departure?.map((t: any) => String(t.route_code)) || [];
      const retRouteCodes = prepareBookingData.return?.map((t: any) => String(t.route_code)) || [];

      dep = (effective?.trips || []).filter((t: any) =>
        depIds.includes(String(t.tripId)) || depRouteCodes.includes(String(t.routeCode))
      );
      ret = (effective?.trips || []).filter((t: any) =>
        retIds.includes(String(t.tripId)) || retRouteCodes.includes(String(t.routeCode))
      );
    } else if (booking) {
      if (booking.bookingType === 'Single') {
        dep = effective?.trips || [];
      } else if ((booking.bookingType as any) === 'Round Trip' || booking.bookingType === 'Round') {
        const half = Math.ceil((effective?.trips || []).length / 2);
        dep = (effective?.trips || []).slice(0, half);
        ret = (effective?.trips || []).slice(half);
      } else {
        dep = effective?.trips?.[0] ? [effective.trips[0]] : [];
        ret = effective?.trips?.[1] ? [effective.trips[1]] : [];
      }
    } else {
      dep = effective?.trips?.[0] ? [effective.trips[0]] : [];
      ret = effective?.trips?.[1] ? [effective.trips[1]] : [];
    }

    const depSub = dep.reduce((sum, t) => sum + (t.subtotal || 0), 0);
    const retSub = ret.reduce((sum, t) => sum + (t.subtotal || 0), 0);
    const gTotal = effective?.grandTotal || booking?.totalPrice || 0;

    return {
      effectivePricingData: effective,
      depTripsPricing: dep,
      retTripsPricing: ret,
      depSubtotal: depSub,
      retSubtotal: retSub,
      grandTotal: gTotal,
      crossTenantLegs: undefined as CrossTenantLegPricing[] | undefined
    };
  }, [pricingData, booking, prepareBookingData, isCrossTenant, legPricingData]);

  return (
    <div className={`bg-white border shadow rounded-lg w-full min-w-[300px] sm:min-w-[400px] sm:max-w-[500px] h-auto p-4 sm:p-6 mb-10 ${pathname === '/booking/confirmed' ? 'border-2 border-green-500' : ''}`}>
      <h1 className="text-lg font-bold text-customText">Fare Summary</h1>

      <div className="mt-4 space-y-4">
        {/* Cross-Tenant Per-Leg Sections */}
        {isCrossTenant && crossTenantLegs ? (
          <>
            {crossTenantLegs.map((leg, legIdx) => {
              const hasReturn = leg.retTrips.length > 0;
              const hasDeparture = leg.depTrips.length > 0;

              return (
                <div key={leg.shippingLineId + legIdx}>
                  {/* Leg Header */}
                  <div
                    className="flex items-center justify-center border-t-2 py-1"
                    style={{ borderColor: themeSettings?.accent || '#23abff' }}
                  >
                    <label className="text-sm font-semibold text-customText mt-2">
                      Leg {legIdx + 1}{leg.tenantName ? `: ${leg.tenantName}` : ''}
                    </label>
                  </div>

                  {/* Departure Trips for this Leg */}
                  {hasDeparture && hasReturn && (
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-3 mb-1">Departure</div>
                  )}
                  {leg.depTrips.map((trip: any, tIdx: number) => {
                    const tPassengers = trip.passengerPrices || [];
                    const tCargos = trip.cargoPrices || [];
                    const tCharges = trip.charges || [];

                    return (
                      <div key={trip.tripId || `dep-${legIdx}-${tIdx}`} className="space-y-4 mt-2">
                        {leg.depTrips.length > 1 && (
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider -mb-2">
                            Route: {trip.routeCode || trip.tripId}
                          </div>
                        )}

                        {tPassengers.length > 0 && (
                          <div>
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdultDepExpanded(!isAdultDepExpanded)}>
                              <span className="flex items-center gap-2 text-customText">
                                Adult Fare ({tPassengers.length})
                                {isAdultDepExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </span>
                              <ObscuredPrice price={tPassengers.reduce((sum: any, p: any) => sum + p.baseFare, 0)} isLoading={leg.isLoading} />
                            </div>
                            {isAdultDepExpanded && (
                              <div className="pl-4 mt-2 space-y-1">
                                {tPassengers.map((p: any, i: number) => (
                                  <div key={`${legIdx}-dep-p-${i}`} className="flex justify-between text-sm text-gray-500">
                                    <span>
                                      Passenger {i + 1} ({p.passengerType})
                                      {p.accommodationCode && <span className="ml-1 opacity-70">| {p.accommodationCode}</span>}
                                    </span>
                                    <ObscuredPrice price={p.baseFare} isLoading={leg.isLoading} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {tCharges.length > 0 && (
                          <div>
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsChargesDepExpanded(!isChargesDepExpanded)}>
                              <span className="flex items-center gap-2 text-customText">
                                Additional Charges: <ObscuredPrice price={tCharges.filter((c: any) => !c.isInclusive).reduce((sum: any, c: any) => sum + c.amount, 0)} isLoading={leg.isLoading} />
                                {isChargesDepExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </span>
                            </div>
                            {isChargesDepExpanded && (
                              <div className="pl-4 mt-2 space-y-1">
                                {tCharges.map((c: any, cIdx: number) => (
                                  <div key={`${legIdx}-dep-ch-${cIdx}`} className="flex justify-between text-sm text-gray-500">
                                    <span>{c.chargeName}{c.isInclusive && <span className="ml-1 text-xs text-gray-400">(incl.)</span>}</span>
                                    <ObscuredPrice price={c.amount} isLoading={leg.isLoading} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {tCargos.length > 0 && (
                          <div>
                            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsVehicleDepExpanded(!isVehicleDepExpanded)}>
                              <span className="flex items-center gap-2 text-customText">
                                Vehicle/Cargo ({tCargos.length})
                                {isVehicleDepExpanded ? <FiChevronUp /> : <FiChevronDown />}
                              </span>
                              <ObscuredPrice price={tCargos.reduce((sum: any, c: any) => sum + c.baseFare, 0)} isLoading={leg.isLoading} />
                            </div>
                            {isVehicleDepExpanded && (
                              <div className="pl-4 mt-2 space-y-1">
                                {tCargos.map((c: any, cIdx: number) => (
                                  <div key={`${legIdx}-dep-v-${cIdx}`} className="flex justify-between text-sm text-gray-500">
                                    <span>{c.cargoClassCode} ({c.cargoType})</span>
                                    <ObscuredPrice price={c.baseFare} isLoading={leg.isLoading} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Fallback: show baseFare breakdown when cargoPrices is empty */}
                        {tCargos.length === 0 && trip.baseFare && ((trip.baseFare.vehicles || 0) > 0 || (trip.baseFare.cargo || 0) > 0) && (
                          <div>
                            <div className="flex justify-between items-center">
                              <span className="text-customText">Vehicle/Cargo</span>
                              <ObscuredPrice price={(trip.baseFare.vehicles || 0) + (trip.baseFare.cargo || 0)} isLoading={leg.isLoading} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Return Trips for this Leg */}
                  {hasReturn && (
                    <>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">Return</div>
                      {leg.retTrips.map((trip: any, tIdx: number) => {
                        const tPassengers = trip.passengerPrices || [];
                        const tCargos = trip.cargoPrices || [];
                        const tCharges = trip.charges || [];

                        return (
                          <div key={trip.tripId || `ret-${legIdx}-${tIdx}`} className="space-y-4 mt-2">
                            {leg.retTrips.length > 1 && (
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider -mb-2">
                                Route: {trip.routeCode || trip.tripId}
                              </div>
                            )}

                            {tPassengers.length > 0 && (
                              <div>
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdultRetExpanded(!isAdultRetExpanded)}>
                                  <span className="flex items-center gap-2 text-customText">
                                    Adult Fare ({tPassengers.length})
                                    {isAdultRetExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                  </span>
                                  <ObscuredPrice price={tPassengers.reduce((sum: any, p: any) => sum + p.baseFare, 0)} isLoading={leg.isLoading} />
                                </div>
                                {isAdultRetExpanded && (
                                  <div className="pl-4 mt-2 space-y-1">
                                    {tPassengers.map((p: any, i: number) => (
                                      <div key={`${legIdx}-ret-p-${i}`} className="flex justify-between text-sm text-gray-500">
                                        <span>Passenger {i + 1} ({p.passengerType})</span>
                                        <ObscuredPrice price={p.baseFare} isLoading={leg.isLoading} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {tCharges.length > 0 && (
                              <div>
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsChargesRetExpanded(!isChargesRetExpanded)}>
                                  <span className="flex items-center gap-2 text-customText">
                                    Additional Charges: <ObscuredPrice price={tCharges.filter((c: any) => !c.isInclusive).reduce((sum: any, c: any) => sum + c.amount, 0)} isLoading={leg.isLoading} />
                                    {isChargesRetExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                  </span>
                                </div>
                                {isChargesRetExpanded && (
                                  <div className="pl-4 mt-2 space-y-1">
                                    {tCharges.map((c: any, cIdx: number) => (
                                      <div key={`${legIdx}-ret-ch-${cIdx}`} className="flex justify-between text-sm text-gray-500">
                                        <span>{c.chargeName}{c.isInclusive && <span className="ml-1 text-xs text-gray-400">(incl.)</span>}</span>
                                        <ObscuredPrice price={c.amount} isLoading={leg.isLoading} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {tCargos.length > 0 && (
                              <div>
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsVehicleRetExpanded(!isVehicleRetExpanded)}>
                                  <span className="flex items-center gap-2 text-customText">
                                    Vehicle/Cargo ({tCargos.length})
                                    {isVehicleRetExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                  </span>
                                  <ObscuredPrice price={tCargos.reduce((sum: any, c: any) => sum + c.baseFare, 0)} isLoading={leg.isLoading} />
                                </div>
                                {isVehicleRetExpanded && (
                                  <div className="pl-4 mt-2 space-y-1">
                                    {tCargos.map((c: any, cIdx: number) => (
                                      <div key={`${legIdx}-ret-v-${cIdx}`} className="flex justify-between text-sm text-gray-500">
                                        <span>{c.cargoClassCode} ({c.cargoType})</span>
                                        <ObscuredPrice price={c.baseFare} isLoading={leg.isLoading} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Fallback: show baseFare breakdown when cargoPrices is empty */}
                            {tCargos.length === 0 && trip.baseFare && ((trip.baseFare.vehicles || 0) > 0 || (trip.baseFare.cargo || 0) > 0) && (
                              <div>
                                <div className="flex justify-between items-center">
                                  <span className="text-customText">Vehicle/Cargo</span>
                                  <ObscuredPrice price={(trip.baseFare.vehicles || 0) + (trip.baseFare.cargo || 0)} isLoading={leg.isLoading} />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </>
                  )}

                  {/* Per-Leg Subtotal */}
                  <div className="flex justify-between font-bold text-md pt-2 border-t border-dashed mt-4">
                    <span>Leg {legIdx + 1} Sub-Total</span>
                    <span style={{ color: themeSettings?.accent || '#0060df' }}>{formatCurrency(leg.legTotal)}</span>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            {/* Standard Departure Section */}
            {(returnCabinName || retTripsPricing.length > 0) && (
              <div className="flex items-center justify-center border-t-2 border-gray-300 py-1">
                <label className="text-mb font-semibold text-customText mt-2">Departure Trip</label>
              </div>
            )}

            {depTripsPricing.map((trip: any, tIdx: number) => {
              const tPassengers = trip.passengerPrices || [];
              const tCargos = trip.cargoPrices || [];
              const tCharges = trip.charges || [];
              const isConnecting = depTripsPricing.length > 1;

              return (
                <div key={trip.tripId || tIdx} className="space-y-4">
                  {isConnecting && (
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 -mb-2">
                      Leg {tIdx + 1}: {trip._tenantName || trip.routeCode || trip.tripId}
                    </div>
                  )}

                  {tPassengers.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdultDepExpanded(!isAdultDepExpanded)}>
                        <span className="flex items-center gap-2 text-customText">
                          Adult Fare ({tPassengers.length})
                          {isAdultDepExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                        <ObscuredPrice price={tPassengers.reduce((sum: any, p: any) => sum + p.baseFare, 0)} isLoading={isLoading} />
                      </div>
                      {isAdultDepExpanded && (
                        <div className="pl-4 mt-2 space-y-1">
                          {tPassengers.map((p: any, i: number) => (
                            <div key={uuidv4()} className="flex justify-between text-sm text-gray-500">
                              <span>
                                Passenger {i + 1} ({p.passengerType})
                                {p.accommodationCode && <span className="ml-1 opacity-70">| {p.accommodationCode}</span>}
                              </span>
                              <ObscuredPrice price={p.baseFare} isLoading={isLoading} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {tCharges.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsChargesDepExpanded(!isChargesDepExpanded)}>
                        <span className="flex items-center gap-2 text-customText">
                          Additional Charges: <ObscuredPrice price={tCharges.filter((c: any) => !c.isInclusive).reduce((sum: any, c: any) => sum + c.amount, 0)} isLoading={isLoading} />
                          {isChargesDepExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                      </div>
                      {isChargesDepExpanded && (
                        <div className="pl-4 mt-2 space-y-1">
                          {tCharges.map((c: any) => (
                            <div key={uuidv4()} className="flex justify-between text-sm text-gray-500">
                              <span>{c.chargeName}{c.isInclusive && <span className="ml-1 text-xs text-gray-400">(incl.)</span>}</span>
                              <ObscuredPrice price={c.amount} isLoading={isLoading} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {tCargos.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsVehicleDepExpanded(!isVehicleDepExpanded)}>
                        <span className="flex items-center gap-2 text-customText">
                          Vehicle/Cargo ({tCargos.length})
                          {isVehicleDepExpanded ? <FiChevronUp /> : <FiChevronDown />}
                        </span>
                        <ObscuredPrice price={tCargos.reduce((sum: any, c: any) => sum + c.baseFare, 0)} isLoading={isLoading} />
                      </div>
                      {isVehicleDepExpanded && (
                        <div className="pl-4 mt-2 space-y-1">
                          {tCargos.map((c: any) => (
                            <div key={uuidv4()} className="flex justify-between text-sm text-gray-500">
                              <span>{c.cargoClassCode} ({c.cargoType})</span>
                              <ObscuredPrice price={c.baseFare} isLoading={isLoading} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}

            {depTripsPricing.length > 0 && (
              <div className="flex justify-between font-bold text-md pt-2 border-t border-dashed mt-4">
                <span>{depTripsPricing.length > 1 ? 'Departure Sub-Total' : 'Sub-Total'}</span>
                <span style={{ color: themeSettings?.accent || '#0060df' }}>{formatCurrency(depSubtotal)}</span>
              </div>
            )}

            {/* Standard Return Section */}
            {retTripsPricing.length > 0 && (
              <>
                <div className="flex items-center justify-center border-t-2 border-gray-300 py-1 mt-4">
                  <label className="text-mb font-semibold text-customText mt-2">Return Trip</label>
                </div>

                {retTripsPricing.map((trip: any, tIdx: number) => {
                  const tPassengers = trip.passengerPrices || [];
                  const tCargos = trip.cargoPrices || [];
                  const tCharges = trip.charges || [];
                  const isConnecting = retTripsPricing.length > 1;

                  return (
                    <div key={trip.tripId || tIdx} className="space-y-4">
                      {isConnecting && (
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 -mb-2">
                          Leg: {trip.routeCode || trip.tripId}
                        </div>
                      )}

                      {tPassengers.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsAdultRetExpanded(!isAdultRetExpanded)}>
                            <span className="flex items-center gap-2 text-customText">
                              Adult Fare ({tPassengers.length})
                              {isAdultRetExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </span>
                            <ObscuredPrice price={tPassengers.reduce((sum: any, p: any) => sum + p.baseFare, 0)} isLoading={isLoading} />
                          </div>
                          {isAdultRetExpanded && (
                            <div className="pl-4 mt-2 space-y-1">
                              {tPassengers.map((p: any, i: number) => (
                                <div key={uuidv4()} className="flex justify-between text-sm text-gray-500">
                                  <span>Passenger {i + 1} ({p.passengerType})</span>
                                  <ObscuredPrice price={p.baseFare} isLoading={isLoading} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {tCharges.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsChargesRetExpanded(!isChargesRetExpanded)}>
                            <span className="flex items-center gap-2 text-customText">
                              Additional Charges: <ObscuredPrice price={tCharges.filter((c: any) => !c.isInclusive).reduce((sum: any, c: any) => sum + c.amount, 0)} isLoading={isLoading} />
                              {isChargesRetExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </span>
                          </div>
                          {isChargesRetExpanded && (
                            <div className="pl-4 mt-2 space-y-1">
                              {tCharges.map((c: any) => (
                                <div key={uuidv4()} className="flex justify-between text-sm text-gray-500">
                                  <span>{c.chargeName}{c.isInclusive && <span className="ml-1 text-xs text-gray-400">(incl.)</span>}</span>
                                  <ObscuredPrice price={c.amount} isLoading={isLoading} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {tCargos.length > 0 && (
                        <div>
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsVehicleRetExpanded(!isVehicleRetExpanded)}>
                            <span className="flex items-center gap-2 text-customText">
                              Vehicle/Cargo ({tCargos.length})
                              {isVehicleRetExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </span>
                            <ObscuredPrice price={tCargos.reduce((sum: any, c: any) => sum + c.baseFare, 0)} isLoading={isLoading} />
                          </div>
                          {isVehicleRetExpanded && (
                            <div className="pl-4 mt-2 space-y-1">
                              {tCargos.map((c: any) => (
                                <div key={uuidv4()} className="flex justify-between text-sm text-gray-500">
                                  <span>{c.cargoClassCode} ({c.cargoType})</span>
                                  <ObscuredPrice price={c.baseFare} isLoading={isLoading} />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}

                <div className="flex justify-between font-bold text-md pt-2 border-t border-dashed mt-4">
                  <span>{retTripsPricing.length > 1 ? 'Return Sub-Total' : 'Sub-Total'}</span>
                  <span style={{ color: themeSettings?.accent || '#0060df' }}>{formatCurrency(retSubtotal)}</span>
                </div>
              </>
            )}
          </>
        )}

        {(() => {
          const hasSeatmap = departureTrips?.some(t => t.seatSelection) || returnTrips?.some(t => t.seatSelection);
          return hasSeatmap && Object.keys(selectedSeatAssignments).length > 0 ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Selected seats may have added markup charges.
                Final amount is reflected after seat assignment.
              </span>
            </div>
          ) : null;
        })()}

        <hr className="border-t-2 border-dashed border-gray-300" />

        <div className="flex justify-between items-center font-bold text-lg">
          {pathname.includes('/booking/confirmed') ? (
            <>
              <span className="flex items-center gap-2">
                Amount Paid
                <FaCheckCircle className="w-6 h-6 text-green-500" />
              </span>
              <span className="text-green-500">{formatCurrency(grandTotal)}</span>
            </>
          ) : (
            <>
              <span>Total Amount</span>
              <span style={{ color: themeSettings?.primaryColor || '#23abff' }}>{formatCurrency(grandTotal)}</span>
            </>
          )}
        </div>
      </div>

      {/* Buttons */}
      {pathname.includes('/booking/passenger-details') && (
        <>
          {(() => {
            const hasSeatmap = departureTrips?.some(t => t.seatSelection) || returnTrips?.some(t => t.seatSelection);
            if (!hasSeatmap) return null;

            // Build passengers list for dialog from current form state
            const dialogPassengers: SeatPickerDialogPassenger[] = passengerDetails
              ? [passengerDetails.passenger, ...(passengerDetails.companions ?? [])].map((p, i) => ({
                  key: `p-${i}`,
                  firstName: p.firstname ?? '',
                  lastName: p.lastname ?? '',
                  discountType: p.discountType ?? 'Adult',
                }))
              : [];

            // Build trips list for dialog
            const dialogTrips: SeatPickerDialogTrip[] = [];
            const departureTripId = departureTrips?.[0]?.id ?? '';
            const returnTripId = returnTrips?.[0]?.id ?? '';
            if (departureTripId && departureCabinId) {
              dialogTrips.push({ tripId: String(departureTripId), label: 'Departure', cabinId: Number(departureCabinId) });
            }
            if (returnTripId && returnCabinId) {
              dialogTrips.push({ tripId: String(returnTripId), label: 'Return', cabinId: Number(returnCabinId) });
            }

            // First selected seat label for display (primary passenger, departure trip)
            const firstLabel = selectedSeatLabels['p-0']?.[departureTripId];
            const hasSeatSelected = Object.keys(selectedSeatAssignments).length > 0 && Object.values(selectedSeatAssignments).some(tm => Object.keys(tm).length > 0);

            return (
              <>
                {/* Choose seat section */}
                <div className="py-2">
                  <p className="text-sm font-medium text-zinc-800 mb-0.5">Choose your seat</p>
                  <p className="text-xs text-zinc-400 mb-2">Pick your preferred seat or we'll assign one for you</p>

                  {hasSeatSelected && (
                    <div className="flex items-center gap-1.5 mb-2 text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span className="text-xs font-medium">
                        {firstLabel ? `Seat selected: ${firstLabel}` : 'Seats selected'}
                      </span>
                    </div>
                  )}

                  {!hasSeatSelected && (
                    <p className="text-xs text-zinc-400 mb-2 italic">Seat will be auto assigned</p>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        setShowSeatLoginModal(true);
                      } else if (dialogTrips.length > 0 && dialogPassengers.length > 0) {
                        setSeatDialogOpen(true);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-[12px] font-medium text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <Armchair className="h-3.5 w-3.5" />
                    {hasSeatSelected ? 'Change seat' : 'Choose seat'}
                  </button>
                </div>

                {/* Seat picker dialog */}
                {dialogTrips.length > 0 && (
                  <SeatPickerDialog
                    open={seatDialogOpen}
                    onClose={() => setSeatDialogOpen(false)}
                    trips={dialogTrips}
                    passengers={dialogPassengers}
                    initialAssignments={selectedSeatAssignments}
                    onConfirm={(assignments, labels) => {
                      setSelectedSeatAssignments(assignments);
                      setSelectedSeatLabels(labels);
                      setSeatDialogOpen(false);
                    }}
                    onSkip={() => {
                      setSelectedSeatAssignments({});
                      setSelectedSeatLabels({});
                      setSeatDialogOpen(false);
                    }}
                  />
                )}

                {/* Guest auth modal */}
                <Dialog open={showSeatLoginModal} onOpenChange={setShowSeatLoginModal}>
                  <DialogContent className="max-w-sm">
                    <DialogTitle>Choose your seat</DialogTitle>
                    <p className="text-sm text-zinc-600 mt-2">
                      Seat selection is available for registered users. Log in to pick your preferred seat and avoid random assignment.
                    </p>
                    <div className="mt-4 flex flex-col gap-2">
                      <Button variant="default" className="w-full" onClick={handleLoginRedirect}>
                        Log In
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleRegisterRedirect}>
                        Create Account
                      </Button>
                      <button
                        type="button"
                        className="text-xs text-zinc-400 hover:text-zinc-600 mt-1 text-center"
                        onClick={() => setShowSeatLoginModal(false)}
                      >
                        Continue without seat selection
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            );
          })()}
          <Button
            variant="default"
            className="mt-6 w-full bg-customBlue text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-500 flex items-center justify-center gap-2"
            onClick={handleProceedToPayment}
            disabled={!isFormValid || isLoading || isNavigatingToPayment}
          >
            {isNavigatingToPayment && <FiLoader className="animate-spin" />}
            Proceed to Payment
          </Button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </>
      )}

      {pathname.includes('/booking/payment-confirmation') && (
        <>
          {showMessage ? (
            <div className="mt-6">
              <p className="text-sm font-semibold mb-4" style={{ color: themeSettings?.accent || '#23abff' }}>
                You will be redirected to the secure PayMongo Payment Gateway to pay for your booking.
              </p>
              <div className="flex justify-end mt-6">
                <a href="/booking/destination" className="inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg bg-blue-500">
                  Book Again
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start mt-4">
                <input type="checkbox" id="terms" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="mt-1 mr-2" />
                <label htmlFor="terms" className="text-xs text-gray-600">
                  I agree to the <a href="/terms" className="hover:underline">Terms and Conditions</a> and <a href="/privacy" className="hover:underline">Privacy Policy</a>
                </label>
              </div>
              <Button variant="default" className="mt-6 w-full" onClick={() => setIsModalOpen(true)} disabled={isProcessing || !agreedToTerms || (enabledProviders.includes('maya') && enabledProviders.includes('paymongo') && !selectedMethod)}>
                {enabledProviders.includes('maya') && enabledProviders.includes('paymongo')
                  ? 'Pay'
                  : enabledProviders.includes('paymongo')
                  ? 'Pay via PayMongo'
                  : 'Pay via Maya'}
                {isProcessing && <FiLoader className="ml-1 animate-spin" />}
              </Button>
            </>
          )}
        </>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogTitle className="sr-only">Payment Confirmation</DialogTitle>
          <div className="p-6 text-center">
            <h3 className="text-xl font-semibold mb-4">Payment Confirmation</h3>
            <p className="text-sm text-gray-600 mb-6">I understand and accept that the convenience fee charged is non-refundable.</p>
            <DialogActions>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button style={{ backgroundColor: themeSettings?.primaryColor }} onClick={handleModalConfirm}>I Agree</Button>
            </DialogActions>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default FareSummary;
