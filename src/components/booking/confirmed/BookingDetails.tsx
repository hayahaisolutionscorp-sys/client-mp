'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import Image from 'next/image';

import FareSummary from '@/components/booking/FareSummary';
import ManageBookingSection from '@/components/booking/confirmed/manage-booking/ManageBookingSection';
import InfoCard from '@/components/booking/confirmed/InfoCard';
import PassengerConfirmedTripCard from '@/components/booking/confirmed/PassengerConfirmedTripCard';
import TripDetails from '@/components/booking/payment-confirmation/TripDetails';
import PaymentSuccessCard from '@/components/booking/confirmed/PaymentSuccessCard';
import { useThemeSettings } from '@/hooks/theme-settings';
import { getBookingById, prepareBooking, calculatePricing, derivePricingStateFromBooking } from '@/services';
import {
  cancelPassengerAction,
  finalizePassengerAction,
} from '@/services/passenger-actions/passenger-actions.service';
import { getShip } from '@/services/shipping-line/ship.service';
import { IBooking, ITrip } from '@/models';
import { IPrepareBookingData, ITripSummary } from '@/models/booking/prepare-booking.model';
import { PricingResponse } from '@/types/booking/pricing';

const ACTION_FEEDBACK: Record<
  string,
  { title: string; description: string; tone: 'success' | 'cancel' }
> = {
  'upgrade-success': {
    title: 'Cabin upgraded',
    description:
      'Payment received. Your cabin has been upgraded — check the latest details below.',
    tone: 'success',
  },
  'upgrade-cancel': {
    title: 'Upgrade payment cancelled',
    description:
      'No charge was made. Your booking is unchanged — feel free to try again.',
    tone: 'cancel',
  },
  'rebook-success': {
    title: 'Rebook confirmed',
    description:
      'Payment received. Your booking has been rebooked to the new trip — see the updated itinerary below.',
    tone: 'success',
  },
  'rebook-cancel': {
    title: 'Rebook payment cancelled',
    description:
      'No charge was made. Your original booking is unchanged.',
    tone: 'cancel',
  },
};

export default function BookingDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params?.id as string;
  const tenantId = searchParams?.get('tenant_id') ? Number(searchParams.get('tenant_id')) : undefined;
  const action = searchParams?.get('action') ?? null;
  const actionId = searchParams?.get('action_id') ?? null;
  const themeSettings = useThemeSettings();
  const [, setFinalizing] = useState(false);
  const [bookingRefreshKey, setBookingRefreshKey] = useState(0);

  const [actionFeedback, setActionFeedback] = useState<typeof ACTION_FEEDBACK[string] | null>(
    null,
  );

  // On mount, surface a banner when the user just returned from a gateway flow.
  // If an action_id is present, also finalize it server-side as a webhook
  // fallback (covers localhost dev where PayMongo can't reach our webhook).
  useEffect(() => {
    if (action && ACTION_FEEDBACK[action]) {
      setActionFeedback(ACTION_FEEDBACK[action]);
    }
    const isSuccess =
      action === 'upgrade-success' || action === 'rebook-success';
    const isCancel =
      action === 'upgrade-cancel' || action === 'rebook-cancel';
    let cancelled = false;
    (async () => {
      if (isCancel && actionId) {
        try {
          await cancelPassengerAction(actionId);
        } catch {
          // Best-effort — webhook may have already failed/cancelled it.
        }
      }
      if (isSuccess && actionId) {
        setFinalizing(true);
        try {
          let result = await finalizePassengerAction(actionId);
          // The webhook may still be mid-flight when we land here (it just
          // claimed the row atomically and is running bulkRebook). Retry once
          // after a short delay so we still get the new_booking_id.
          if (
            !cancelled &&
            action === 'rebook-success' &&
            !result?.newBookingId &&
            (result?.status === 'PROCESSING' ||
              result?.status === 'PENDING_PAYMENT')
          ) {
            await new Promise((r) => setTimeout(r, 1500));
            if (!cancelled) result = await finalizePassengerAction(actionId);
          }
          if (
            !cancelled &&
            action === 'rebook-success' &&
            result?.newBookingId &&
            result.newBookingId !== bookingId
          ) {
            const next = `/booking/confirmed/${result.newBookingId}?action=rebook-success`;
            window.location.replace(next);
            return;
          }
          if (!cancelled) setBookingRefreshKey((k) => k + 1);
        } catch {
          // Surface nothing — the webhook may have already settled this, or
          // the user can refresh to retry. Banner already informs them.
        } finally {
          if (!cancelled) setFinalizing(false);
        }
      }
      if (action && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('action');
        url.searchParams.delete('action_id');
        window.history.replaceState({}, '', url.toString());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [action, actionId]);

  const [booking, setBooking] = useState<IBooking | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [pricingData, setPricingData] = useState<PricingResponse['data'] | undefined>(undefined);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [prepareBookingData, setPrepareBookingData] = useState<IPrepareBookingData | undefined>(undefined);

  // Fetch Booking
  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      try {
        const { booking: fetchedBooking, raw } = await getBookingById(bookingId, tenantId);
        setBooking(fetchedBooking);

        // If the API returned payment_breakdown, build pricingData from it directly
        // (avoids an extra calculatePricing round-trip and uses the actual recorded charges)
        const pb = raw?.payment_breakdown;
        const hasPb =
          pb &&
          (pb.passengers_fare > 0 ||
            pb.cargo_fare > 0 ||
            pb.charges_total > 0 ||
            pb.taxes_total > 0 ||
            pb.charges?.length > 0 ||
            pb.taxes?.length > 0);

        if (hasPb) {
          const departureLeg = raw.trips?.departure?.[0] || {};
          const allPassengers: any[] = departureLeg.passengers || [];
          const allVehicles: any[] = departureLeg.vehicles || [];
          const allCargos: any[] = departureLeg.cargos || departureLeg.cargo || [];

          // Hide rebooked passengers / vehicles / cargos from the fare summary —
          // they've been transferred to a new booking and the matching credit
          // already shows up under "Additional Charges" as "Credit to New
          // Booking". Without this filter the summary still lists the rebooked
          // pax with a halved per-pax price.
          const isRebooked = (item: any) =>
            item?.removed_reason_type === 'Rebooked' ||
            item?.removedReasonType === 'Rebooked' ||
            item?.booking_status === 'Rebooked' ||
            item?.bookingStatus === 'Rebooked';

          const passengers = allPassengers.filter((p) => !isRebooked(p));
          const vehicles = allVehicles.filter((v) => !isRebooked(v));
          const cargos = allCargos.filter((c) => !isRebooked(c));

          const paxCount = passengers.length;
          const cargoCount = vehicles.length + cargos.length;
          const allPaxCount = allPassengers.length;
          const allCargoCount = allVehicles.length + allCargos.length;

          // pb.passengers_fare is the booking-wide aggregate (still includes
          // the rebooked pax's fare). Scale it down by active/total so the
          // summary reflects only what's left on this booking.
          const activePassengersFare =
            allPaxCount > 0 ? (pb.passengers_fare * paxCount) / allPaxCount : 0;
          const activeCargoFare =
            allCargoCount > 0 ? (pb.cargo_fare * cargoCount) / allCargoCount : 0;

          // Prefer each passenger's own payment_breakdown.base_fare (summed
          // from that passenger's FARE line items by the API) over a flat
          // average of the booking-wide aggregate. Without this, a per-pax
          // cabin upgrade shows both passengers at the average instead of
          // the upgraded passenger's actual fare. Fall back to the average
          // only when payment_breakdown is missing (older bookings).
          const fallbackPaxFare =
            paxCount > 0 ? activePassengersFare / paxCount : 0;
          const passengerPrices = passengers.map((p: any, i: number) => ({
            index: i,
            tripId: '',
            routeCode: '',
            passengerType: p.discount_type || p.discountType || 'ADULT',
            accommodationCode:
              p.cabin_type_name || p.cabinTypeName || p.cabin || p.accommodation || '',
            baseFare:
              p.payment_breakdown?.base_fare != null
                ? Number(p.payment_breakdown.base_fare)
                : fallbackPaxFare,
            currency: 'PHP',
          }));

          const fallbackCargoFare =
            cargoCount > 0 ? activeCargoFare / cargoCount : 0;
          const cargoPriceItems = [
            ...vehicles.map((v: any, i: number) => ({
              index: i,
              tripId: '',
              cargoType: 'VEHICLE',
              cargoClassCode: v.type || v.vehicle_type || v.make || 'Vehicle',
              baseFare:
                v.payment_breakdown?.base_fare != null
                  ? Number(v.payment_breakdown.base_fare)
                  : fallbackCargoFare,
              currency: 'PHP',
              rateUnit: 'unit',
            })),
            ...cargos.map((c: any, i: number) => ({
              index: vehicles.length + i,
              tripId: '',
              cargoType: 'CARGO',
              cargoClassCode: c.description || 'Cargo',
              baseFare:
                c.payment_breakdown?.base_fare != null
                  ? Number(c.payment_breakdown.base_fare)
                  : fallbackCargoFare,
              currency: 'PHP',
              rateUnit: 'unit',
            })),
          ];

          const charges = [
            ...(pb.charges || []).map((ch: any) => ({
              ruleId: ch.charge_code || '',
              chargeCode: ch.charge_code || '',
              chargeName: ch.description,
              category: 'CHARGE',
              amount: ch.amount,
              isInclusive: false,
              calcType: 'FIXED',
              basis: 'UNIT',
              showOnReceipt: true,
            })),
            ...(pb.taxes || []).map((t: any) => ({
              ruleId: t.charge_code || '',
              chargeCode: t.charge_code || '',
              chargeName: t.description,
              category: 'TAX',
              amount: t.amount,
              isInclusive: false,
              calcType: 'FIXED',
              basis: 'UNIT',
              showOnReceipt: true,
            })),
          ];

          const chargesTotal = (pb.charges_total || 0) + (pb.taxes_total || 0);
          const baseFareTotal = (pb.passengers_fare || 0) + (pb.cargo_fare || 0);
          const grandTotal = raw.total_price
            ? parseFloat(raw.total_price)
            : baseFareTotal + chargesTotal;

          setPricingData({
            trips: [
              {
                tripId: '',
                routeCode: '',
                passengerPrices,
                cargoPrices: cargoPriceItems,
                baseFare: {
                  passengers: pb.passengers_fare || 0,
                  cargo: pb.cargo_fare || 0,
                  total: baseFareTotal,
                },
                charges,
                chargesTotal,
                taxesTotal: pb.taxes_total || 0,
                subtotal: grandTotal,
                grandTotal,
              },
            ],
            grandTotal,
          } as any);
        } else if (raw) {
          // Fallback: derive pricing state and call calculatePricing
          setIsPricingLoading(true);
          try {
            const pricingState = derivePricingStateFromBooking(raw);
            if (pricingState) {
              const pricingResp = await calculatePricing(pricingState);
              setPricingData(pricingResp.data);
            }
          } catch (pricingError) {
            console.error('Failed to fetch pricing breakdown:', pricingError);
          } finally {
            setIsPricingLoading(false);
          }
        }
      } catch (error) {
        console.error('Failed to fetch booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, bookingRefreshKey]);

  // Map TripSummary to ITrip (reused logic)
  const mapTripSummaryToTrip = useCallback((summary: ITripSummary, shippingLineId: number = 0): ITrip => {
    return {
      id: summary.id,
      shipId: summary.ship.id,
      shippingLineId: shippingLineId,
      status: summary.status as any,
      arrivalTimeDateIso: summary.scheduled_arrival,
      departureDateIso: summary.scheduled_departure,
      type: 'direct',
      srcPort: { name: summary.origin } as any,
      destPort: { name: summary.destination } as any,
      ship: {
        id: summary.ship.id,
        name: summary.ship.name,
        shippingLineId: shippingLineId,
      } as any
    } as ITrip;
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="animate-spin text-[45px]" style={{ color: themeSettings?.accent || '#23abff' }} />
          <p className="text-sm sm:text-base text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-24 sm:mb-0">
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-3 pt-6 pb-8 lg:pt-10 lg:px-10">
            <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="w-full lg:w-2/3 space-y-6">
                {actionFeedback && (
                  <div
                    className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-sm ${
                      actionFeedback.tone === 'success'
                        ? 'bg-green-50 border-green-200 text-green-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-sm">{actionFeedback.title}</p>
                      <p className="text-xs mt-0.5 leading-snug">
                        {actionFeedback.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActionFeedback(null)}
                      className="text-xs font-medium underline opacity-70 hover:opacity-100"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
                <PaymentSuccessCard booking={booking} />
                <TripDetails booking={booking} />
                <PassengerConfirmedTripCard booking={booking} />
              </div>

              {/* Right Column */}
              <div className="w-full lg:w-1/3 space-y-6">
                <div>
                  <ManageBookingSection booking={booking!} />
                  <FareSummary
                    booking={booking}
                    pricingData={pricingData}
                    isLoading={isPricingLoading}
                  />
                  <InfoCard
                    imgSrc="/assets/images/reminder-icon.png"
                    altText="Megaphone illustration"
                    title="Booking Reminders"
                    description="Passengers are advised to be at the terminal at least 1 hour before departure..."
                    linkText="Read Guidelines"
                    linkHref="#"
                  />
                  <InfoCard
                    imgSrc="/assets/images/printer-icon.png"
                    altText="Printer"
                    title="Make sure to print your E-ticket"
                    description="A copy of the ticket will also be sent to your email..."
                    linkText="Read Guidelines"
                    linkHref="#"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
