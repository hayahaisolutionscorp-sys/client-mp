'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Loader2, Calendar, Ship, MapPin, Armchair } from 'lucide-react';
import { IBooking } from '@/models';
import { ITrip } from '@/models/shipping-line/trip.model';
import { ITripCabin } from '@/models/accommodation/trip-cabin.model';
import { getAvailableTrips } from '@/services/shipping-line/trip.service';
import {
  getOnlineRebookingFee,
  getShipCabins,
  IShipCabin,
} from '@/services/passenger-requests/passenger-requests.service';
import {
  initiateRebookUpgrade,
  initiateRebookDowngrade,
} from '@/services/passenger-actions/passenger-actions.service';

import {
  getCabinDecks,
  getDeckLayout,
  getTripSeats,
} from '@/services/accommodation/seat.service';
import type {
  AssignmentsMap,
  CabinDeck,
  DeckLayout,
  SeatLabelsMap,
  TripSeat,
} from '@/components/booking/seat-selection/seat-picker.types';
import { SeatPickerDialog } from '@/components/booking/seat-selection/SeatPickerDialog';
import { usePricingPreview } from '@/hooks/use-pricing-preview';
import type { CalculatePricingRequest } from '@/types/booking/pricing';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking;
  onSuccess: () => void;
}

const formatCurrency = (n: number) =>
  `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDateTime = (iso?: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

const todayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// /trips/marketplace returns ids like "direct-{uuid}" or "connecting-{uuid}".
// Strip the prefix so we get a real trip UUID for filtering and submission.
const cleanTripId = (id: number | string | null | undefined): string =>
  String(id ?? '').replace(/^(direct-|connecting-)/, '');

export default function RequestRebookModal({ isOpen, onClose, booking, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>([]);
  const [searchDate, setSearchDate] = useState<string>(todayStr());
  const [trips, setTrips] = useState<ITrip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [tripsError, setTripsError] = useState<string | null>(null);
  // Track whether a search has actually been performed for the current date
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null);
  const [selectedCabin, setSelectedCabin] = useState<ITripCabin | null>(null);
  const [passengerRemarks, setPassengerRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [rebookingFee, setRebookingFee] = useState<{
    amount: number;
    feeType: 'PERCENT' | 'FIXED' | null;
  }>({ amount: 0, feeType: null });
  const [shipCabins, setShipCabins] = useState<IShipCabin[]>([]);
  // Seat picker state — only used when the new trip+cabin supports seat selection
  const [decks, setDecks] = useState<CabinDeck[]>([]);
  const [layout, setLayout] = useState<DeckLayout | null>(null);
  const [tripSeats, setTripSeats] = useState<TripSeat[]>([]);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  // selectedSeats[booking_trip_passenger_id] = { seatId, cellId, rateAmount }
  const [selectedSeats, setSelectedSeats] = useState<
    Record<string, { seatId: string; cellId: string; rateAmount: number } | null>
  >({});
  const [seatPickerOpen, setSeatPickerOpen] = useState(false);
  // For round-trip bookings, the customer picks which leg to rebook. The
  // marketplace rebook flow runs one leg at a time — submitting both legs
  // at once would invalidate the unchanged leg's existing payment ledger.
  const allBookingLegs = useMemo(
    () => booking.bookingTrips ?? [],
    [booking.bookingTrips],
  );
  const isRoundTripBooking = allBookingLegs.length > 1;
  const [selectedLegBookingTripId, setSelectedLegBookingTripId] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (allBookingLegs.length === 0) {
      setSelectedLegBookingTripId(null);
      return;
    }
    const stillValid = allBookingLegs.some(
      (leg) => leg.bookingTripId === selectedLegBookingTripId,
    );
    if (!stillValid) {
      setSelectedLegBookingTripId(allBookingLegs[0].bookingTripId ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBookingLegs]);

  const currentTrip = useMemo(() => {
    if (!isRoundTripBooking) return allBookingLegs[0];
    return (
      allBookingLegs.find(
        (leg) => leg.bookingTripId === selectedLegBookingTripId,
      ) ?? allBookingLegs[0]
    );
  }, [allBookingLegs, isRoundTripBooking, selectedLegBookingTripId]);
  const currentTripDetails = currentTrip?.trip;
  const passengers =
    currentTrip?.bookingTripPassengers?.filter(
      (p) =>
        !p.removedReason &&
        (p as any).bookingStatus !== 'Rebooked' &&
        (p as any).removedReasonType !== 'Rebooked',
    ) ?? [];
  const selectedPassengers = passengers.filter((p) => selectedPassengerIds.includes(p.id!));

  // Pre-fill origin/destination from current booking — fall back across many possible shapes.
  // For the marketplace, the trip's port "name" is typically also the code (e.g., "MNG").
  const originName =
    currentTripDetails?.srcPort?.name ??
    currentTripDetails?.srcPortName ??
    (currentTripDetails as any)?.src_port_name ??
    (currentTripDetails as any)?.origin ??
    '';
  const destName =
    currentTripDetails?.destPort?.name ??
    currentTripDetails?.destPortName ??
    (currentTripDetails as any)?.dest_port_name ??
    (currentTripDetails as any)?.destination ??
    '';
  const originPortCode =
    currentTripDetails?.srcPort?.code ??
    (currentTripDetails as any)?.src_port_code ??
    (currentTripDetails as any)?.origin_code ??
    originName;
  const destPortCode =
    currentTripDetails?.destPort?.code ??
    (currentTripDetails as any)?.dest_port_code ??
    (currentTripDetails as any)?.destination_code ??
    destName;
  const originPortId =
    currentTripDetails?.srcPort?.id ??
    currentTripDetails?.srcPortId ??
    (currentTripDetails as any)?.src_port_id;
  const destPortId =
    currentTripDetails?.destPort?.id ??
    currentTripDetails?.destPortId ??
    (currentTripDetails as any)?.dest_port_id;

  const handleClose = () => {
    setStep(1);
    setSelectedPassengerIds([]);
    setSearchDate(todayStr());
    setTrips([]);
    setTripsError(null);
    setSelectedTrip(null);
    setSelectedCabin(null);
    setPassengerRemarks('');
    onClose();
  };

  const togglePassenger = (id: string) => {
    setSelectedPassengerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const runSearch = async () => {
    if (!searchDate) {
      setTripsError('Please pick a departure date.');
      return;
    }
    if (!originPortCode && !originPortId) {
      setTripsError('Origin port is missing from your booking. Please contact support.');
      return;
    }
    if (!destPortCode && !destPortId) {
      setTripsError('Destination port is missing from your booking. Please contact support.');
      return;
    }
    setLoadingTrips(true);
    setTripsError(null);
    setTrips([]);
    setSelectedTrip(null);
    setSelectedCabin(null);
    setHasSearched(true);
    try {
      const searchQuery: any = {
        departureDate: searchDate,
        passengerCount: selectedPassengerIds.length || 1,
      };
      // Prefer codes; fall back to IDs (trip service supports both)
      if (originPortCode) searchQuery.origin_code = originPortCode;
      else if (originPortId) searchQuery.srcPortId = Number(originPortId);
      if (destPortCode) searchQuery.destination_code = destPortCode;
      else if (destPortId) searchQuery.destPortId = Number(destPortId);

      const result = await getAvailableTrips(
        currentTripDetails?.shippingLineId,
        searchQuery,
        { page: 1 } as any,
      );

      if (result === undefined) {
        setTripsError(
          `Couldn't reach the trip search service. Check your connection and try again.`,
        );
        return;
      }

      const allTrips = ((result as any)?.data ?? []) as ITrip[];
      // Filter out: (a) the current trip itself, (b) trips that have already
      // departed (or are past the booking cutoff), (c) trips with no remaining
      // passenger capacity for the chosen cabin/economy. Same-day rebook is
      // allowed as long as it's not the same trip.
      const currentTripUuid = String(currentTrip?.tripId ?? '');
      const now = Date.now();
      const hasPassengerCapacity = (t: ITrip): boolean => {
        const cabins = (t as any).availableCabins ?? [];
        if (!Array.isArray(cabins) || cabins.length === 0) return true;
        return cabins.some((c: any) => {
          const remaining = Number(c?.availableCapacity ?? c?.remainingCapacity ?? c?.remaining ?? -1);
          return Number.isNaN(remaining) || remaining < 0 || remaining > 0;
        });
      };
      const filtered = allTrips.filter((t) => {
        if (cleanTripId(t.id) === currentTripUuid) return false;
        const dep = (t as any).departureDateIso ? new Date((t as any).departureDateIso).getTime() : NaN;
        if (Number.isFinite(dep) && dep <= now) return false;
        const cutoff = (t as any).bookingCutOffDateIso ? new Date((t as any).bookingCutOffDateIso).getTime() : NaN;
        if (Number.isFinite(cutoff) && cutoff <= now) return false;
        if (!hasPassengerCapacity(t)) return false;
        return true;
      });
      setTrips(filtered);

      if (allTrips.length === 0) {
        setTripsError(
          `No trips available on ${searchDate} for this route. Try another date.`,
        );
      } else if (filtered.length === 0) {
        setTripsError(
          `No bookable trips on ${searchDate} — others are full, departed, or past their booking cutoff. Pick a different date.`,
        );
      }
    } catch (err) {
      setTripsError(
        `Trip search failed: ${
          err instanceof Error ? err.message : 'unknown error'
        }. Please try again.`,
      );
    } finally {
      setLoadingTrips(false);
    }
  };

  // Fetch the per-tenant online rebooking fee on open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    getOnlineRebookingFee().then((res) => {
      if (cancelled) return;
      setRebookingFee({ amount: res.amount, feeType: res.feeType });
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // When the selected cabin changes (and the trip supports seat selection),
  // fetch the cabin's decks, the first deck's layout, and trip seats so the
  // user can pick a specific seat. Also resets per-passenger seat selections.
  useEffect(() => {
    setDecks([]);
    setLayout(null);
    setTripSeats([]);
    setSeatError(null);
    setSelectedSeats({});

    if (!selectedTrip || !selectedCabin) return;
    if (!selectedTrip.seatSelection) return;

    let cancelled = false;
    setLoadingSeats(true);

    (async () => {
      try {
        const cabinDecks = await getCabinDecks(selectedCabin.cabinId);
        if (cancelled) return;
        const usableDecks = cabinDecks
          .filter((d) => d.has_active_layout)
          .sort((a, b) => a.sort_order - b.sort_order);
        setDecks(usableDecks);
        if (usableDecks.length === 0) return;

        // Use the first deck (most cabins have a single deck)
        const firstDeck = usableDecks[0];
        const [deckLayout, seats] = await Promise.all([
          getDeckLayout(firstDeck.id),
          getTripSeats(String(selectedTrip.id).replace(/^(direct-|connecting-)/, ''), firstDeck.id),
        ]);
        if (cancelled) return;
        setLayout(deckLayout);
        setTripSeats(seats);
      } catch {
        if (!cancelled) {
          setSeatError(
            'Could not load seat availability. Staff will assign a seat after approving your request.',
          );
        }
      } finally {
        if (!cancelled) setLoadingSeats(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTrip, selectedCabin]);

  // Build the list of available seats with their per-cell rate info.
  const availableSeats = useMemo(() => {
    if (!layout || tripSeats.length === 0) return [] as Array<{
      seatId: string;
      cellId: string;
      label: string;
      rateAmount: number;
      rateName: string;
    }>;
    const cellsById = new Map<string, any>();
    for (const cell of layout.cells) {
      if (cell.cellId) cellsById.set(cell.cellId, cell);
    }
    const ratesById = new Map<string, any>();
    for (const r of layout.rates) ratesById.set(r.clientId, r);
    return tripSeats
      .filter((s) => s.status === 'available')
      .map((s) => {
        const cell = cellsById.get(s.cell_id);
        const rateId = cell?.rateId ?? cell?.upperRateId ?? cell?.lowerRateId;
        const rate = rateId ? ratesById.get(String(rateId)) : null;
        return {
          seatId: s.id,
          cellId: s.cell_id,
          label: cell?.cellText || s.cell_id,
          rateAmount: rate ? Number(rate.amount) : 0,
          rateName: rate?.name ?? '',
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }, [layout, tripSeats]);

  // Check whether ANY of the selected (original) passengers had a seat assigned.
  // Only show the picker if the original booking had seats — otherwise the new
  // trip might not require them either.
  const originalHadSeats = useMemo(() => {
    return selectedPassengers.some((p) => !!(p as any).seatCellId);
  }, [selectedPassengers]);

  // Total seat add-on = sum of selected seat rates across passengers
  const totalSeatMarkup = useMemo(() => {
    return Object.values(selectedSeats).reduce(
      (sum, s) => sum + (s?.rateAmount ?? 0),
      0,
    );
  }, [selectedSeats]);

  // When a trip is selected, fetch all the ship's cabins so we can show
  // every cabin in the chooser (not just those with rates on the trip).
  useEffect(() => {
    if (!selectedTrip) {
      setShipCabins([]);
      return;
    }
    const shipId = Number(selectedTrip.shipId ?? selectedTrip.ship?.id);
    if (!shipId) {
      setShipCabins([]);
      return;
    }
    let cancelled = false;
    getShipCabins(shipId).then((res) => {
      if (cancelled) return;
      setShipCabins(res);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedTrip]);

  // Auto-search whenever the date changes on step 2 (combined date + results)
  useEffect(() => {
    setHasSearched(false);
    if (
      step === 2 &&
      searchDate &&
      (originPortCode || originPortId) &&
      (destPortCode || destPortId)
    ) {
      runSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, searchDate]);

  // Original additional charges & taxes from the booking's payment breakdown.
  // These get re-applied (carried over) to the new booking when rebooking.
  const paymentBreakdown = (booking as any)?.paymentBreakdown ?? {};
  const originalCharges: Array<{ code: string; description: string; amount: number; kind: 'charge' | 'tax' }> =
    paymentBreakdown.charges ?? [];

  const newChargesPricingRequest = useMemo((): CalculatePricingRequest | null => {
    if (!selectedTrip || !selectedCabin || selectedPassengerIds.length === 0) return null;
    const tripId = cleanTripId(selectedTrip.id);
    if (!tripId) return null;
    const routeCode = originPortCode && destPortCode ? `${originPortCode}-${destPortCode}` : '';
    if (!routeCode) return null;

    const passengers = selectedPassengers.map((p, idx) => ({
      index: idx,
      passengerType: (p as any).discountType || 'Adult',
      tripAssignments: [
        {
          tripId,
          cabinId: selectedCabin.cabinId,
          discountType: (p as any).discountType || 'Adult',
        },
      ],
    }));

    return { routeCode, tripIds: [tripId], passengers };
  }, [selectedTrip, selectedCabin, selectedPassengerIds, selectedPassengers, originPortCode, destPortCode]);

  const { pricingData: newChargesPricingData, isLoading: newChargesLoading } = usePricingPreview({
    request: newChargesPricingRequest,
  });

  const newCharges = useMemo(() => {
    const trips = newChargesPricingData?.trips ?? [];
    const charges = (trips[0]?.charges ?? []) as any[];
    return charges
      .filter((c: any) => Number(c?.amount ?? 0) > 0)
      .filter((c: any) => (c?.chargeCode ?? c?.charge_code) !== 'SEAT_MARKUP')
      .map((c: any) => ({
        chargeName: c?.chargeName ?? c?.description ?? '',
        chargeCode: c?.chargeCode ?? c?.charge_code ?? '',
        amount: Number(c?.amount ?? 0),
      }));
  }, [newChargesPricingData]);

  // Charges total that the customer will actually be billed on the new booking.
  // Uses fresh new-trip pricing for the chosen accommodation when available;
  // falls back to the original booking's charges if the pricing call hasn't
  // returned yet. Either way this drives the New Total below — so picking a
  // different cabin re-prices the new booking accurately.
  const newChargesTotal = useMemo(() => {
    if (newCharges.length > 0) {
      return newCharges.reduce((sum, c) => sum + Number(c.amount ?? 0), 0);
    }
    return (
      Number(paymentBreakdown.chargesTotal ?? 0) +
      Number(paymentBreakdown.taxesTotal ?? 0)
    );
  }, [newCharges, paymentBreakdown.chargesTotal, paymentBreakdown.taxesTotal]);

  // The charges already paid on the original booking, restricted to the
  // selected passengers (used to compose the Original Total). SEAT_MARKUP is
  // excluded — seat economics are tracked separately via
  // `originalSeatMarkupForSelected` / `totalSeatMarkup`, so including it
  // here would double-count when computing Net Adjustment.
  //
  // Prefer the per-passenger payment_breakdown (carried per-btp from the API)
  // because the booking-level chargesTotal can be contaminated by REBOOK
  // credit-out items from earlier rebooks on this booking, dragging it to 0
  // or negative even though the remaining passenger's charges are still
  // sitting in the DB.
  const originalChargesTotal = useMemo(() => {
    const isSeatLine = (desc?: string | null, code?: string | null) =>
      code === 'SEAT_MARKUP' || /seat/i.test(desc ?? '');

    const fromPerPax = selectedPassengers.reduce((sum, p) => {
      const pb: any = (p as any).paymentBreakdown;
      if (!pb) return sum;
      const charges = (pb.charges ?? []) as Array<{ description?: string; charge_code?: string | null; amount?: number }>;
      const taxes = (pb.taxes ?? []) as Array<{ description?: string; charge_code?: string | null; amount?: number }>;
      const c = charges
        .filter((x) => !isSeatLine(x.description, x.charge_code))
        .reduce((s, x) => s + Number(x.amount ?? 0), 0);
      const t = taxes
        .filter((x) => !isSeatLine(x.description, x.charge_code))
        .reduce((s, x) => s + Number(x.amount ?? 0), 0);
      return sum + c + t;
    }, 0);
    if (fromPerPax > 0) return fromPerPax;

    // Fallback: pro-rate booking-level (legacy bookings without per-btp items).
    const allChargesAndTaxes =
      Number(paymentBreakdown.chargesTotal ?? 0) +
      Number(paymentBreakdown.taxesTotal ?? 0);
    const seatMarkupOnBooking = (originalCharges ?? [])
      .filter((c) => isSeatLine(c.description, c.code))
      .reduce((sum, c) => sum + Number(c.amount ?? 0), 0);
    const bookingWide = Math.max(0, allChargesAndTaxes - seatMarkupOnBooking);
    const totalPaxCount = passengers.length;
    if (totalPaxCount > 0 && selectedPassengerIds.length > 0) {
      return (bookingWide / totalPaxCount) * selectedPassengerIds.length;
    }
    return bookingWide;
  }, [
    paymentBreakdown.chargesTotal,
    paymentBreakdown.taxesTotal,
    originalCharges,
    passengers.length,
    selectedPassengerIds.length,
    selectedPassengers,
  ]);

  // Backwards-compatible alias used by downstream computations.
  const reappliedChargesTotal = newChargesTotal;

  // Original seat markup the passenger already paid for the seats on the original
  // booking. Pulled from payment_breakdown.charges (charge_code SEAT_MARKUP) and
  // pro-rated to the passengers being rebooked. Used as a credit so picking a new
  // seat at the same price doesn't double-charge.
  const originalSeatMarkupForSelected = useMemo(() => {
    const totalSeatMarkupOnBooking = (originalCharges ?? [])
      .filter(
        (c) =>
          c.code === 'SEAT_MARKUP' ||
          /seat/i.test(c.description ?? ''),
      )
      .reduce((sum, c) => sum + Number(c.amount ?? 0), 0);
    if (totalSeatMarkupOnBooking <= 0 || passengers.length === 0) return 0;
    return (totalSeatMarkupOnBooking / passengers.length) * selectedPassengerIds.length;
  }, [originalCharges, passengers.length, selectedPassengerIds.length]);


  // Original FARE only (no charges). Prefer per-passenger payment_breakdown.base_fare
  // (carried per-btp from the API) because the booking-level passengersFare can be
  // dragged to 0/negative by REBOOK credit-out items from earlier rebooks. Fall back
  // to pro-rating booking-level totals, then to per-passenger price.
  const originalFareOnly = useMemo(() => {
    const fromPerPax = selectedPassengers.reduce((sum, p) => {
      const pb: any = (p as any).paymentBreakdown;
      const baseFare = Number(pb?.base_fare ?? 0);
      return sum + baseFare;
    }, 0);
    if (fromPerPax > 0) return fromPerPax;

    const breakdownFare = Number(paymentBreakdown.passengersFare ?? 0);
    const totalPaxCount = passengers.length;
    if (breakdownFare > 0 && totalPaxCount > 0) {
      return (breakdownFare / totalPaxCount) * selectedPassengerIds.length;
    }
    return selectedPassengers.reduce(
      (sum, p) =>
        sum +
        Number((p as any).price ?? (p as any).totalPrice ?? (p as any).total_price ?? 0),
      0,
    );
  }, [
    paymentBreakdown.passengersFare,
    passengers.length,
    selectedPassengerIds.length,
    selectedPassengers,
  ]);

  // Original total = original fare + ORIGINAL charges (what the passenger
  // actually paid before). Don't pull from reappliedChargesTotal here because
  // that variable now reflects the NEW trip's charges.
  const originalFareTotal = originalFareOnly + originalChargesTotal;

  // New fare on chosen cabin (uses cabin.adultFare * passenger count;
  // exact per-discount-type fares will be reconciled by staff at execution)
  const newFareTotal = useMemo(() => {
    if (!selectedCabin) return 0;
    return Number(selectedCabin.adultFare ?? 0) * selectedPassengerIds.length;
  }, [selectedCabin, selectedPassengerIds.length]);

  // Merge the ship's full cabin list with the trip's pricing data so we can show
  // every cabin (matching TMS), with prices when available and "no rate" otherwise.
  const mergedCabins = useMemo(() => {
    if (!selectedTrip) return [] as ITripCabin[];
    const tripCabinsById = new Map<number, ITripCabin>();
    for (const c of selectedTrip.availableCabins ?? []) {
      tripCabinsById.set(c.cabinId, c);
    }
    if (shipCabins.length === 0) {
      return Array.from(tripCabinsById.values());
    }
    return shipCabins.map((sc) => {
      const tripCabin = tripCabinsById.get(sc.id);
      if (tripCabin) return tripCabin;
      // Cabin exists on the ship but no rate on this trip — render as a stub
      return {
        tripId: selectedTrip.id,
        cabinId: sc.id,
        cabin: {
          id: sc.id,
          shipId: sc.ship_id,
          cabinTypeId: sc.cabin_type_id,
          name: sc.name,
          recommendedPassengerCapacity: sc.recommended_passenger_capacity ?? 0,
          cabin_type_name: sc.cabin_type_name ?? undefined,
          cabin_type_description: sc.cabin_type_description ?? undefined,
          cabin_type_code: sc.cabin_type_code ?? undefined,
        },
        cabinCode: sc.cabin_type_code ?? sc.name,
        availablePassengerCapacity: sc.recommended_passenger_capacity ?? 0,
        passengerCapacity: sc.recommended_passenger_capacity ?? 0,
        adultFare: 0,
      } as unknown as ITripCabin;
    });
  }, [selectedTrip, shipCabins]);

  // Computed rebooking fee amount (PERCENT applies to original fare; FIXED is per-passenger)
  const computedRebookingFee = useMemo(() => {
    if (!rebookingFee.amount || !rebookingFee.feeType) return 0;
    if (rebookingFee.feeType === 'PERCENT') {
      return (originalFareTotal * Number(rebookingFee.amount)) / 100;
    }
    // FIXED — apply per passenger
    return Number(rebookingFee.amount) * (selectedPassengerIds.length || 1);
  }, [rebookingFee, originalFareTotal, selectedPassengerIds.length]);

  // Fare adjustment compares fare-to-fare (re-applied charges are unchanged so they
  // don't contribute to the adjustment). Net adjustment is the full delta between
  // new total (fare + re-applied charges + rebooking fee + seat markup) and original total.
  // The original seat markup is already part of `reappliedChargesTotal` (it was a CHARGES
  // line on the original booking), so to avoid double-charging when the new seat costs the
  // same as the old one we credit it back: the new seat markup contribution is just the
  // difference between new and original.
  const seatMarkupAdjustment = totalSeatMarkup - originalSeatMarkupForSelected;
  const fareAdjustment = newFareTotal - originalFareOnly;
  const newTotalEstimated =
    newFareTotal + reappliedChargesTotal + computedRebookingFee + seatMarkupAdjustment;
  const netAdjustment = newTotalEstimated - originalFareTotal;

  const isRemarksValid = passengerRemarks.trim() !== '';

  const handleSubmit = async () => {
    if (!selectedTrip || !selectedCabin || selectedPassengerIds.length === 0) return;
    setSubmitting(true);
    try {
      // ── Pricier rebook ─────────────────────────────────────────────────
      // Passenger pays delta real-time on PayMongo. No method choice — same
      // checkout flow as buying a fresh booking.
      if (netAdjustment > 0) {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : '';
        const successUrl = `${origin}/booking/confirmed/${booking.id}?action=rebook-success`;
        const cancelUrl = `${origin}/booking/confirmed/${booking.id}?action=rebook-cancel`;
        const result = await initiateRebookUpgrade({
          booking_id: booking.id!,
          new_trip_id: cleanTripId(selectedTrip.id),
          old_booking_trip_id: currentTrip?.bookingTripId ?? undefined,
          passenger_changes: selectedPassengerIds.map((id) => ({
            booking_trip_passenger_id: id,
            new_accommodation_id: selectedCabin.cabinId,
            new_seat_id: selectedSeats[id]?.seatId
              ? Number(selectedSeats[id]?.seatId)
              : undefined,
          })),
          old_total: originalFareTotal,
          new_total: newTotalEstimated,
          delta_amount: Number(netAdjustment.toFixed(2)),
          gateway: 'paymongo',
          success_url: successUrl,
          cancel_url: cancelUrl,
          billing: {
            email: booking.contactEmail,
            phone: booking.contactMobile,
          },
        });
        if (result?.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }
        throw new Error('Gateway did not return a checkout URL.');
      }

      // ── Cheaper or same-fare rebook ────────────────────────────────────
      // Apply the rebook immediately. No money moves — the customer absorbs
      // any difference on a downgrade, or it's a straight swap. Only rebook
      // upgrades involve a payment.
      await initiateRebookDowngrade({
        booking_id: booking.id!,
        new_trip_id: cleanTripId(selectedTrip.id),
        old_booking_trip_id: currentTrip?.bookingTripId ?? undefined,
        passenger_changes: selectedPassengerIds.map((id) => ({
          booking_trip_passenger_id: id,
          new_accommodation_id: selectedCabin.cabinId,
          new_seat_id: selectedSeats[id]?.seatId
            ? Number(selectedSeats[id]?.seatId)
            : undefined,
        })),
        old_total: originalFareTotal,
        new_total: newTotalEstimated,
        passenger_remarks: passengerRemarks.trim() || undefined,
      });
      handleClose();
      onSuccess();
    } catch (err: any) {
      alert(`Failed to submit rebook: ${err?.message ?? 'please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rebook trip — Step {step} of 4</DialogTitle>
        </DialogHeader>

        {/* Step 1: pick passengers */}
        {step === 1 && (
          <div className="space-y-3">
            {isRoundTripBooking && (
              <div className="rounded border border-gray-200 p-3">
                <p className="text-sm font-medium mb-2">
                  Which leg do you want to rebook?
                </p>
                <div className="flex flex-wrap gap-2">
                  {allBookingLegs.map((leg) => {
                    const isActive = leg.bookingTripId === selectedLegBookingTripId;
                    const dir = leg.direction === 'return' ? 'Return' : 'Departure';
                    const route = `${leg.trip?.srcPort?.code ?? leg.trip?.srcPortName ?? ''} → ${leg.trip?.destPort?.code ?? leg.trip?.destPortName ?? ''}`;
                    const dateStr = leg.trip?.departureDateIso
                      ? new Date(leg.trip.departureDateIso).toLocaleString()
                      : '';
                    return (
                      <button
                        key={leg.bookingTripId ?? `${leg.tripId}-${leg.direction}`}
                        type="button"
                        onClick={() => {
                          if (leg.bookingTripId !== selectedLegBookingTripId) {
                            setSelectedLegBookingTripId(leg.bookingTripId ?? null);
                            setSelectedPassengerIds([]);
                            setSelectedTrip(null);
                            setSelectedCabin(null);
                          }
                        }}
                        className={`text-left rounded border px-3 py-2 text-xs transition ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 font-semibold'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="uppercase text-[10px] tracking-wide opacity-70">{dir}</div>
                        <div>{route}</div>
                        {dateStr && <div className="opacity-70">{dateStr}</div>}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-gray-500">
                  You can only rebook one leg at a time. Repeat for the other leg if needed.
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Select the passenger(s) you want to rebook to a different trip:
            </p>
            {passengers.length === 0 && (
              <p className="text-sm text-gray-400">No passengers found on this booking.</p>
            )}
            {passengers.map((p) => {
              const name = `${p.passenger?.firstName ?? ''} ${p.passenger?.lastName ?? ''}`.trim();
              return (
                <label
                  key={p.id}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${
                    selectedPassengerIds.includes(p.id!)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPassengerIds.includes(p.id!)}
                    onChange={() => togglePassenger(p.id!)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{name || 'Passenger'}</p>
                    <p className="text-xs text-gray-500">
                      Current cabin: {p.cabin?.name ?? 'N/A'} · {p.discountType ?? 'ADULT'}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {/* Step 2: date + available trips combined */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-50 border rounded p-3 text-sm space-y-1">
              <p className="font-medium text-gray-700">Current Trip</p>
              <p className="text-gray-600">
                <MapPin className="inline h-3 w-3 mr-1" />
                {originName} ({originPortCode}) → {destName} ({destPortCode})
              </p>
              <p className="text-gray-500">
                <Calendar className="inline h-3 w-3 mr-1" />
                Departs {formatDateTime(currentTripDetails?.departureDateIso)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Pick a new departure date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  min={todayStr()}
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  // colorScheme: 'light' forces the browser's calendar
                  // popup to render in light mode regardless of OS dark
                  // mode — without it macOS dark mode paints the popup
                  // black, which clashes with the modal's white surface.
                  style={{ colorScheme: 'light' }}
                  className="flex-1 border rounded px-3 py-2 text-sm bg-white text-gray-900"
                />
                <Button variant="outline" onClick={runSearch} disabled={loadingTrips}>
                  {loadingTrips ? 'Searching...' : 'Search'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Same route ({originPortCode} → {destPortCode}). Trips will appear below.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">
                Available Trips {searchDate ? `on ${searchDate}` : ''}
                {hasSearched && !loadingTrips && trips.length > 0 && (
                  <span className="text-xs font-normal text-green-600 ml-2">
                    ({trips.length} found)
                  </span>
                )}
              </p>

              {loadingTrips && (
                <div className="flex items-center justify-center py-8 gap-2 text-gray-500 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching trips...
                </div>
              )}

              {tripsError && !loadingTrips && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-3">
                  {tripsError}
                </p>
              )}

              {!loadingTrips && !tripsError && !hasSearched && (
                <p className="text-sm text-gray-500 italic bg-gray-50 border rounded p-3">
                  Pick a date and click Search to see available trips.
                </p>
              )}

              {!loadingTrips && trips.length > 0 && (
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {trips.map((trip) => {
                    const isSelected = selectedTrip?.id === trip.id;
                    return (
                      <button
                        key={trip.id}
                        type="button"
                        onClick={() => {
                          setSelectedTrip(trip);
                          setSelectedCabin(null);
                        }}
                        className={`w-full text-left p-3 border rounded transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium flex items-center gap-1.5">
                              <Ship className="h-3.5 w-3.5 text-gray-500" />
                              {trip.shipName ?? trip.ship?.name ?? 'Vessel'}
                              <span className="text-xs text-gray-400">· {trip.referenceNo}</span>
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatDateTime(trip.departureDateIso)} →{' '}
                              {formatDateTime(trip.arrivalTimeDateIso)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {trip.srcPort?.name ?? trip.srcPortName} →{' '}
                              {trip.destPort?.name ?? trip.destPortName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">From</p>
                            <p className="text-sm font-semibold text-gray-700">
                              {trip.availableCabins?.length
                                ? formatCurrency(
                                    Math.min(
                                      ...trip.availableCabins.map((c) =>
                                        Number(c.adultFare ?? 0),
                                      ),
                                    ),
                                  )
                                : '—'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: pick cabin */}
        {step === 3 && selectedTrip && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
              <p className="font-medium text-blue-800">
                {selectedTrip.shipName ?? selectedTrip.ship?.name ?? 'Vessel'}
              </p>
              <p className="text-blue-600 text-xs">
                {formatDateTime(selectedTrip.departureDateIso)}
              </p>
              <p className="text-blue-600 text-xs">
                {(selectedTrip.srcPort?.name ?? selectedTrip.srcPortName)} →{' '}
                {(selectedTrip.destPort?.name ?? selectedTrip.destPortName)}
              </p>
            </div>

            <p className="text-sm font-medium text-gray-700">Pick an Accommodation (cabin)</p>

            {mergedCabins.length === 0 && (
              <p className="text-sm text-gray-500 italic">No cabins on this ship.</p>
            )}

            <div className="space-y-2">
              {mergedCabins.map((c) => {
                const isSelected = selectedCabin?.cabinId === c.cabinId;
                const fare = Number(c.adultFare ?? 0);
                const hasRate = fare > 0;
                const soldOut = (c.availablePassengerCapacity ?? 0) <= 0;
                const disabled = !hasRate || soldOut;
                const totalForPax = fare * (selectedPassengerIds.length || 1);
                return (
                  <button
                    key={c.cabinId}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setSelectedCabin(c)}
                    className={`w-full text-left p-3 border rounded transition ${
                      disabled
                        ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {c.cabin?.name ?? c.cabinCode ?? `Cabin #${c.cabinId}`}
                          {!hasRate && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-600">
                              No rate available
                            </span>
                          )}
                          {hasRate && soldOut && (
                            <span className="ml-2 text-[10px] uppercase tracking-wider text-red-600">
                              Sold out
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c.cabin?.cabin_type_name ?? c.cabin?.cabinType?.name ?? ''}
                          {hasRate ? ` · ${c.availablePassengerCapacity} seats available` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        {hasRate ? (
                          <>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(fare)} / pax
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                              {formatCurrency(totalForPax)}
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Not bookable</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Seat picker — shown when the trip+cabin supports seat selection
                AND the original booking had assigned seats */}
            {selectedTrip.seatSelection && selectedCabin && (
              <div className="pt-2 space-y-2">
                <p className="text-sm font-medium">Pick a Seat</p>
                {!originalHadSeats && (
                  <p className="text-xs text-gray-500 italic">
                    Your original booking didn&apos;t have a seat assignment, so a seat is
                    optional.
                  </p>
                )}
                {loadingSeats && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading available seats...
                  </div>
                )}
                {seatError && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                    {seatError}
                  </p>
                )}
                {!loadingSeats && !seatError && availableSeats.length === 0 && (
                  <p className="text-xs text-gray-500 italic">
                    No seats available on this cabin&apos;s deck for the new trip.
                  </p>
                )}
                {!loadingSeats && availableSeats.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="text-xs text-gray-600">
                        Use the visual seat map to pick a specific seat for each passenger.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSeatPickerOpen(true)}
                      >
                        <Armchair className="h-4 w-4 mr-1.5" />
                        Choose Seats
                      </Button>
                    </div>
                    <ul className="space-y-1.5">
                      {selectedPassengerIds.map((paxId) => {
                        const pax = passengers.find((p) => p.id === paxId);
                        const name =
                          `${pax?.passenger?.firstName ?? ''} ${pax?.passenger?.lastName ?? ''}`.trim() ||
                          'Passenger';
                        const current = selectedSeats[paxId];
                        const seat = current
                          ? availableSeats.find((s) => s.seatId === current.seatId)
                          : null;
                        return (
                          <li
                            key={paxId}
                            className="flex items-center justify-between gap-2 border rounded px-2 py-1.5 bg-gray-50 text-sm"
                          >
                            <span className="font-medium">{name}</span>
                            {current ? (
                              <span className="inline-flex items-center gap-1 text-xs">
                                <Armchair className="h-3 w-3 text-blue-600" />
                                <span className="font-semibold text-blue-700">
                                  Seat {seat?.label ?? current.cellId}
                                </span>
                                {current.rateAmount > 0 && (
                                  <span className="text-gray-500">
                                    +{formatCurrency(current.rateAmount)}
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 italic">
                                Tap &ldquo;Choose Seats&rdquo; or let staff assign
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {totalSeatMarkup > 0 && (
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>
                          New seat markup:{' '}
                          <span className="font-semibold">{formatCurrency(totalSeatMarkup)}</span>
                        </p>
                        {originalSeatMarkupForSelected > 0 && (
                          <p className="text-green-700">
                            Credit (already paid for original seats): −
                            {formatCurrency(originalSeatMarkupForSelected)}
                          </p>
                        )}
                        {originalSeatMarkupForSelected > 0 && (
                          <p className="font-semibold">
                            Net additional seat charge:{' '}
                            {seatMarkupAdjustment <= 0
                              ? formatCurrency(0)
                              : formatCurrency(seatMarkupAdjustment)}
                            {seatMarkupAdjustment <= 0 && (
                              <span className="text-green-700 ml-1">
                                {' '}
                                (no extra charge)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedCabin && netAdjustment > 0 && (
              <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <p className="font-semibold">
                  You'll pay ₱
                  {Math.abs(netAdjustment).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  to confirm this rebook.
                </p>
                <p className="text-xs mt-1">
                  We'll redirect you to PayMongo to complete payment — same flow as buying a
                  new ticket.
                </p>
              </div>
            )}

            {selectedCabin && netAdjustment < 0 && (
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">
                  This rebook is cheaper than your original booking.
                </p>
                <p className="text-xs mt-1">
                  Your booking will be rebooked immediately. No refund will be issued for the
                  difference — the cheaper fare is yours to keep.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">
                Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                value={passengerRemarks}
                onChange={(e) => setPassengerRemarks(e.target.value)}
                className="w-full rounded px-3 py-2 text-sm border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Briefly explain the reason for rebooking..."
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Required — helps staff understand the rebooking context.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: review */}
        {step === 4 && selectedTrip && selectedCabin && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Review Your Rebook Request</h3>

            {(() => {
              // Same-route rebook only: use the codes from the original booking on
              // both sides so the display is identical (e.g., "MNG → TLSY").
              const routeSrc = originPortCode || originName;
              const routeDest = destPortCode || destName;
              const fromSrc = routeSrc;
              const fromDest = routeDest;
              const newSrcName = routeSrc;
              const newDestName = routeDest;

              // Original cabin(s) per selected passenger
              const originalCabinNames = Array.from(
                new Set(
                  selectedPassengers
                    .map((p) => p.cabin?.name)
                    .filter((n): n is string => !!n),
                ),
              );

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="border rounded p-3 bg-white space-y-0.5">
                    <p className="text-[11px] uppercase font-semibold text-gray-500">From</p>
                    <p className="text-sm font-medium">
                      {currentTripDetails?.shipName ??
                        currentTripDetails?.ship?.name ??
                        'Vessel'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {fromSrc} → {fromDest}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDateTime(currentTripDetails?.departureDateIso)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Cabin:{' '}
                      <span className="font-medium">
                        {originalCabinNames.length > 0
                          ? originalCabinNames.join(', ')
                          : '—'}
                      </span>
                    </p>
                  </div>
                  <div className="border rounded p-3 bg-white space-y-0.5">
                    <p className="text-[11px] uppercase font-semibold text-gray-500">To</p>
                    <p className="text-sm font-medium">
                      {selectedTrip.shipName ?? selectedTrip.ship?.name ?? 'Vessel'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {newSrcName} → {newDestName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDateTime(selectedTrip.departureDateIso)}
                    </p>
                    <p className="text-xs text-gray-600">
                      Cabin:{' '}
                      <span className="font-medium">
                        {selectedCabin.cabin?.name ?? selectedCabin.cabinCode}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Payment Summary — mirrors TMS rebook calculation summary */}
            <div className="border rounded bg-gray-50 p-3 space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700">Payment Summary</p>
                <p className="text-[11px] text-gray-500">
                  Estimated rebooking charges and adjustments. Final amounts (including rebooking
                  fee) confirmed by staff.
                </p>
              </div>

              {/* Updated rebooking fares — per passenger + each re-applied charge,
                  matching the TMS calculation summary. Charges that cancel out (re-applied
                  exactly as on the original booking) are listed in blue. */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-gray-500 tracking-wider">
                  Updated Rebooking Fares
                </p>
                <div className="rounded-md border bg-white">
                  {selectedPassengers.map((p) => {
                    const name =
                      `${p.passenger?.firstName ?? ''} ${p.passenger?.lastName ?? ''}`.trim() ||
                      'Passenger';
                    const newPaxFare = Number(selectedCabin.adultFare ?? 0);
                    return (
                      <div
                        key={p.id}
                        className="flex justify-between text-xs px-2 py-1.5 border-b last:border-b-0"
                      >
                        <span className="text-gray-700">
                          {name}{' '}
                          <span className="text-gray-400">
                            ({selectedCabin.cabin?.name ?? selectedCabin.cabinCode})
                          </span>
                        </span>
                        <span className="font-medium">{formatCurrency(newPaxFare)}</span>
                      </div>
                    );
                  })}
                  {newCharges.length > 0
                    ? newCharges.map((c, i) => (
                        <div
                          key={`new-charge-${c.chargeCode}-${i}`}
                          className="flex justify-between text-xs px-2 py-1.5 border-b last:border-b-0 text-blue-600"
                        >
                          <span>{c.chargeName || c.chargeCode}</span>
                          <span className="font-medium">{formatCurrency(c.amount)}</span>
                        </div>
                      ))
                    : originalCharges
                        .filter((c) => c.code !== 'SEAT_MARKUP')
                        .filter((c) => Number(c.amount) > 0)
                        .map((c, i) => (
                          <div
                            key={`charge-${c.code}-${i}`}
                            className="flex justify-between text-xs px-2 py-1.5 border-b last:border-b-0 text-blue-600"
                          >
                            <span>{c.description || c.code}</span>
                            <span className="font-medium">{formatCurrency(c.amount)}</span>
                          </div>
                        ))}
                  {newChargesLoading && (
                    <div className="text-[10px] italic text-gray-500 px-2 py-1">
                      Refreshing charges for the new accommodation…
                    </div>
                  )}
                  {totalSeatMarkup > 0 && (
                    <div className="flex justify-between text-xs px-2 py-1.5 border-b last:border-b-0 text-blue-600">
                      <span>
                        Seat Markup (re-applied,{' '}
                        {Object.values(selectedSeats).filter(Boolean).length} seat
                        {Object.values(selectedSeats).filter(Boolean).length === 1 ? '' : 's'})
                      </span>
                      <span className="font-medium">+{formatCurrency(totalSeatMarkup)}</span>
                    </div>
                  )}
                  {originalSeatMarkupForSelected > 0 && (
                    <div className="flex justify-between text-xs px-2 py-1.5 border-b last:border-b-0 text-green-600">
                      <span>Credited from original seats</span>
                      <span className="font-medium">
                        -{formatCurrency(originalSeatMarkupForSelected)}
                      </span>
                    </div>
                  )}
                </div>
                {(totalSeatMarkup > 0 || originalSeatMarkupForSelected > 0) && (
                  <p className="text-[10px] italic text-gray-500 pl-1">
                    {seatMarkupAdjustment === 0
                      ? 'Same-priced seat — no extra seat charge.'
                      : seatMarkupAdjustment > 0
                        ? `Net seat adjustment: +${formatCurrency(seatMarkupAdjustment)}.`
                        : `Net seat adjustment: ${formatCurrency(seatMarkupAdjustment)} (refund).`}
                  </p>
                )}
              </div>

              {/* Subtotals — mirrors TMS rebook breakdown */}
              <div className="rounded-md border bg-white p-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Original Fare Only:</span>
                  <span className="font-medium">{formatCurrency(originalFareOnly)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">New Fare Only:</span>
                  <span className="font-medium">{formatCurrency(newFareTotal)}</span>
                </div>
                {originalChargesTotal > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Original Charges (already paid):</span>
                    <span className="font-medium">
                      {formatCurrency(originalChargesTotal)}
                    </span>
                  </div>
                )}
                {newChargesTotal > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">New Trip Charges:</span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(newChargesTotal)}
                    </span>
                  </div>
                )}
                {(newChargesTotal !== originalChargesTotal) && (originalChargesTotal > 0 || newChargesTotal > 0) && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Charge Adjustment:</span>
                    <span
                      className={`font-medium ${
                        newChargesTotal - originalChargesTotal > 0
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    >
                      {newChargesTotal - originalChargesTotal > 0 ? '+' : ''}
                      {formatCurrency(newChargesTotal - originalChargesTotal)}
                    </span>
                  </div>
                )}
                {computedRebookingFee > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">
                      Rebooking Fee
                      {rebookingFee.feeType === 'PERCENT'
                        ? ` (${rebookingFee.amount}%)`
                        : rebookingFee.feeType === 'FIXED'
                          ? ` (${formatCurrency(Number(rebookingFee.amount))} × ${selectedPassengerIds.length})`
                          : ''}
                      :
                    </span>
                    <span className="font-medium">{formatCurrency(computedRebookingFee)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-[13px]">
                <span className="text-gray-600">Original Total (Selected):</span>
                <span className="font-medium">{formatCurrency(originalFareTotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-600">New Total (After Rebooking):</span>
                <span className="font-semibold">{formatCurrency(newTotalEstimated)}</span>
              </div>

              <div className="flex justify-between text-[13px] pt-2 border-t">
                <span className="font-semibold">Fare Adjustment:</span>
                <span
                  className={`font-semibold ${
                    fareAdjustment > 0
                      ? 'text-blue-600'
                      : fareAdjustment < 0
                        ? 'text-green-600'
                        : 'text-gray-700'
                  }`}
                >
                  {fareAdjustment > 0 ? '+' : ''}
                  {formatCurrency(fareAdjustment)}
                </span>
              </div>

              <div className="flex justify-between items-center gap-3 pt-2 border-t">
                <span className="font-semibold text-[13px]">Net Adjustment:</span>
                <span
                  className={`text-base font-semibold ${
                    netAdjustment > 0
                      ? 'text-blue-600'
                      : netAdjustment < 0
                        ? 'text-green-600'
                        : 'text-gray-700'
                  }`}
                >
                  {netAdjustment > 0 ? '+' : ''}
                  {formatCurrency(netAdjustment)}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 italic text-center">
                Net = New Total − Original Total.
              </p>
              <p className="text-[10px] text-gray-500 italic text-center">
                {netAdjustment > 0
                  ? '* Additional payment is required.'
                  : netAdjustment < 0
                    ? '* No refund — the cheaper fare is yours to keep.'
                    : '* No net adjustment.'}
              </p>
            </div>

            {netAdjustment > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Payment</span>
                <span className="font-medium">
                  Pay difference online (PayMongo / Maya)
                </span>
              </div>
            )}
            {passengerRemarks && (
              <p className="text-xs text-gray-500 italic">"{passengerRemarks}"</p>
            )}

            <p className="text-xs text-gray-500">
              {netAdjustment > 0
                ? "You'll be redirected to PayMongo to pay the difference (including any rebooking fee). Once the payment succeeds, your booking is rebooked to the new trip automatically — no staff review needed."
                : netAdjustment < 0
                  ? 'Your booking will be rebooked to the new trip immediately. No refund will be issued for the difference — the cheaper fare is yours to keep.'
                  : 'Your booking will be rebooked immediately at the same fare — no payment required.'}
            </p>

            {netAdjustment < 0 && (
              <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
                <p className="font-semibold text-sm">Refund policy — please read</p>
                <ul className="list-disc list-outside pl-4 space-y-1">
                  <li>
                    The price difference of{' '}
                    <span className="font-semibold">
                      {formatCurrency(Math.abs(netAdjustment))}
                    </span>{' '}
                    between your original and new trip is{' '}
                    <span className="font-semibold">non-refundable</span>.
                  </li>
                  <li>
                    By proceeding, you waive any claim to a refund of the fare difference.
                    The amount stays with the carrier; the cheaper fare is yours to keep
                    on the new trip.
                  </li>
                  <li>
                    This rebook executes immediately. Once submitted it cannot be reversed
                    by self-service — staff intervention would be required and is not
                    guaranteed.
                  </li>
                  <li>
                    Standard cancellation, no-show, and refund policies of the shipping
                    line continue to apply to the new trip.
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2 mt-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
              Back
            </Button>
          )}
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && selectedPassengerIds.length === 0) ||
                (step === 2 && (!searchDate || !selectedTrip)) ||
                (step === 3 && (!selectedCabin || !isRemarksValid))
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !isRemarksValid}
            >
              {submitting
                ? 'Processing…'
                : netAdjustment > 0
                  ? `Pay ₱${Math.abs(netAdjustment).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} & rebook`
                  : 'Submit rebook'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      {seatPickerOpen && selectedTrip && selectedCabin && (
        <SeatPickerDialog
          open={seatPickerOpen}
          onClose={() => setSeatPickerOpen(false)}
          trips={[
            {
              tripId: cleanTripId(selectedTrip.id),
              label: `${originPortCode || ''} → ${destPortCode || ''}`.trim(),
              cabinId: selectedCabin.cabinId,
            },
          ]}
          passengers={selectedPassengerIds.map((paxId) => {
            const p = passengers.find((x) => x.id === paxId);
            return {
              key: paxId,
              firstName: p?.passenger?.firstName ?? '',
              lastName: p?.passenger?.lastName ?? '',
              discountType: (p as any)?.discountType ?? '',
            };
          })}
          initialAssignments={Object.entries(selectedSeats).reduce<AssignmentsMap>(
            (acc, [paxId, sel]) => {
              if (!sel) return acc;
              acc[paxId] = { [cleanTripId(selectedTrip.id)]: sel.seatId };
              return acc;
            },
            {},
          )}
          onConfirm={(assignments: AssignmentsMap, _labels: SeatLabelsMap) => {
            const tripKey = cleanTripId(selectedTrip.id);
            const next: typeof selectedSeats = {};
            for (const paxId of selectedPassengerIds) {
              const seatInventoryId = assignments[paxId]?.[tripKey];
              if (!seatInventoryId) {
                next[paxId] = null;
                continue;
              }
              const match = availableSeats.find((s) => s.seatId === seatInventoryId);
              if (!match) {
                next[paxId] = null;
                continue;
              }
              next[paxId] = {
                seatId: match.seatId,
                cellId: match.cellId,
                rateAmount: match.rateAmount,
              };
            }
            setSelectedSeats(next);
            setSeatPickerOpen(false);
          }}
        />
      )}
    </Dialog>
  );
}
