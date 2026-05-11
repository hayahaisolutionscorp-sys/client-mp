'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { IBooking } from '@/models';
import {
  getUpgradeDowngradeOptions,
  ICabinOption,
} from '@/services/passenger-requests/passenger-requests.service';
import {
  cabinDowngrade,
  initiateCabinUpgrade,
} from '@/services/passenger-actions/passenger-actions.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking;
  onSuccess: () => void;
}

const formatCurrency = (n: number) =>
  `₱${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RequestUpgradeDowngradeModal({
  isOpen,
  onClose,
  booking,
  onSuccess,
}: Props) {
  const [step, setStep] = useState(1);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string>('');
  const [selectedCabinId, setSelectedCabinId] = useState<number | null>(null);
  const [options, setOptions] = useState<ICabinOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [passengerRemarks, setPassengerRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Round-trip support: list legs so the customer picks which leg to change
  // a cabin on. Each btp + cabin selection scopes to one leg — backend
  // operates per-(tripId, btpId), same as TMS's UpgradeDowngradeModal.
  const allLegs = useMemo(() => booking.bookingTrips ?? [], [booking.bookingTrips]);
  const isRoundTrip = allLegs.length > 1;
  const [selectedLegBookingTripId, setSelectedLegBookingTripId] = useState<
    string | null
  >(null);
  useEffect(() => {
    if (allLegs.length === 0) {
      setSelectedLegBookingTripId(null);
      return;
    }
    const stillValid = allLegs.some(
      (leg) => leg.bookingTripId === selectedLegBookingTripId,
    );
    if (!stillValid) {
      setSelectedLegBookingTripId(allLegs[0].bookingTripId ?? null);
    }
  }, [allLegs, selectedLegBookingTripId]);

  const trip = useMemo(() => {
    if (!isRoundTrip) return allLegs[0];
    return (
      allLegs.find((leg) => leg.bookingTripId === selectedLegBookingTripId) ??
      allLegs[0]
    );
  }, [allLegs, isRoundTrip, selectedLegBookingTripId]);
  const tripId = trip?.tripId ?? trip?.trip?.id;
  const passengers = trip?.bookingTripPassengers?.filter((p) => !p.removedReason) ?? [];

  const selectedPassenger = passengers.find((p) => p.id === selectedPassengerId);
  const selectedOption = options.find((o) => o.cabinId === selectedCabinId);
  const isUpgrade = selectedOption ? selectedOption.fareDifference > 0 : false;
  const isDowngrade = selectedOption ? selectedOption.fareDifference < 0 : false;

  // Fetch cabin options when entering step 2 with a passenger selected
  useEffect(() => {
    if (step !== 2 || !selectedPassengerId || !tripId || !booking.id) return;
    let cancelled = false;
    setLoadingOptions(true);
    setOptionsError(null);
    setOptions([]);
    setSelectedCabinId(null);

    getUpgradeDowngradeOptions(
      booking.id,
      String(tripId),
      selectedPassengerId,
      selectedPassenger?.discountType ?? undefined,
    )
      .then((result) => {
        if (cancelled) return;
        setOptions(result);
      })
      .catch(() => {
        if (cancelled) return;
        setOptionsError('Could not load available cabins. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoadingOptions(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, selectedPassengerId, tripId, booking.id, selectedPassenger?.discountType]);

  const handleClose = () => {
    setStep(1);
    setSelectedPassengerId('');
    setSelectedCabinId(null);
    setOptions([]);
    setOptionsError(null);
    setPassengerRemarks('');
    onClose();
  };

  const isRemarksValid = passengerRemarks.trim() !== '';

  const handleSubmit = async () => {
    if (!selectedPassengerId || !selectedOption) return;
    setSubmitting(true);
    try {
      const oldTotal =
        Number(selectedPassenger?.totalPrice ?? 0) || 0;
      const newTotal = oldTotal + selectedOption.fareDifference;

      // Self-serve downgrade or same-fare swap — instant, no payment, no refund.
      if (!isUpgrade) {
        await cabinDowngrade({
          booking_id: booking.id!,
          booking_trip_passenger_id: selectedPassengerId,
          new_accommodation_id: selectedOption.cabinId,
          old_total: oldTotal,
          new_total: newTotal,
        });
        handleClose();
        onSuccess();
        return;
      }

      // Self-serve upgrade — passenger pays delta in real-time.
      if (isUpgrade) {
        const origin =
          typeof window !== 'undefined' ? window.location.origin : '';
        // Provisional success URL — actionId gets appended after the action is
        // created so the success page can finalize via fallback.
        const cancelUrl = `${origin}/booking/confirmed/${booking.id}?action=upgrade-cancel`;
        const successUrl = `${origin}/booking/confirmed/${booking.id}?action=upgrade-success`;
        const result = await initiateCabinUpgrade({
          booking_id: booking.id!,
          booking_trip_passenger_id: selectedPassengerId,
          new_accommodation_id: selectedOption.cabinId,
          old_total: oldTotal,
          new_total: newTotal,
          delta_amount: selectedOption.fareDifference,
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
    } catch (err: any) {
      alert(`Failed to process: ${err?.message ?? 'please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change cabin — Step {step} of 3</DialogTitle>
        </DialogHeader>

        {/* Step 1: Pick passenger */}
        {step === 1 && (
          <div className="space-y-3">
            {isRoundTrip && (
              <div className="rounded border border-gray-200 p-3">
                <p className="text-sm font-medium mb-2">
                  Which leg do you want to change?
                </p>
                <div className="flex flex-wrap gap-2">
                  {allLegs.map((leg, i) => {
                    const isActive = leg.bookingTripId === selectedLegBookingTripId;
                    const direction =
                      (leg as any).direction === 'return'
                        ? 'Return'
                        : (leg as any).direction === 'departure'
                          ? 'Departure'
                          : i === 0
                            ? 'Departure'
                            : 'Return';
                    const route =
                      `${leg.trip?.srcPort?.name ?? leg.trip?.srcPortName ?? ''} → ${leg.trip?.destPort?.name ?? leg.trip?.destPortName ?? ''}`.trim();
                    return (
                      <button
                        key={leg.bookingTripId ?? i}
                        type="button"
                        onClick={() => {
                          setSelectedLegBookingTripId(leg.bookingTripId ?? null);
                          setSelectedPassengerId('');
                          setSelectedCabinId(null);
                          setOptions([]);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">{direction}</span>
                        {route && <span className="ml-1 opacity-80">· {route}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600">Select the passenger to upgrade or downgrade:</p>
            {passengers.length === 0 && (
              <p className="text-sm text-gray-400">No passengers found on this booking.</p>
            )}
            {passengers.map((p) => {
              const name = `${p.passenger?.firstName ?? ''} ${p.passenger?.lastName ?? ''}`.trim();
              return (
                <label
                  key={p.id}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${
                    selectedPassengerId === p.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="passenger"
                    checked={selectedPassengerId === p.id}
                    onChange={() => setSelectedPassengerId(p.id!)}
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

        {/* Step 2: Pick cabin from real options */}
        {step === 2 && (
          <div className="space-y-3">
            {selectedPassenger && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                <p className="font-medium text-blue-800">
                  {`${selectedPassenger.passenger?.firstName ?? ''} ${selectedPassenger.passenger?.lastName ?? ''}`.trim()}
                </p>
                <p className="text-blue-600">
                  Current cabin: {selectedPassenger.cabin?.name ?? 'N/A'} ·{' '}
                  {selectedPassenger.discountType ?? 'ADULT'}
                </p>
              </div>
            )}

            <p className="text-sm font-medium text-gray-700">Available Cabins</p>

            {loadingOptions && (
              <div className="flex items-center justify-center py-8 gap-2 text-gray-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading available cabins...
              </div>
            )}

            {optionsError && (
              <p className="text-sm text-red-600 bg-red-50 rounded p-2">{optionsError}</p>
            )}

            {!loadingOptions && !optionsError && options.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No alternative cabins available for this trip.
              </p>
            )}

            {!loadingOptions && options.length > 0 && (
              <div className="border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-700">Cabin</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-700">New Fare</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-700">
                        Difference
                      </th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {options.map((opt) => {
                      const upgrade = opt.fareDifference > 0;
                      const downgrade = opt.fareDifference < 0;
                      return (
                        <tr
                          key={opt.cabinId}
                          onClick={() => setSelectedCabinId(opt.cabinId)}
                          className={`cursor-pointer border-t ${
                            selectedCabinId === opt.cabinId ? 'bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <td className="px-3 py-2 font-medium">{opt.cabinName}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(opt.newFare)}</td>
                          <td className="px-3 py-2 text-right">
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                upgrade
                                  ? 'text-orange-600'
                                  : downgrade
                                    ? 'text-green-600'
                                    : 'text-gray-500'
                              }`}
                            >
                              {upgrade && <ArrowUp className="h-3 w-3" />}
                              {downgrade && <ArrowDown className="h-3 w-3" />}
                              {formatCurrency(Math.abs(opt.fareDifference))}
                              {downgrade ? ' (refund)' : upgrade ? ' (pay)' : ''}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="radio"
                              name="cabin"
                              checked={selectedCabinId === opt.cabinId}
                              onChange={() => setSelectedCabinId(opt.cabinId)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedOption && isUpgrade && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                You'll be redirected to the secure online checkout to pay the
                difference of{' '}
                <span className="font-semibold">
                  {formatCurrency(selectedOption.fareDifference)}
                </span>
                . Choose your payment method (card, GCash, Maya, etc.) on the
                payment page.
              </div>
            )}

            {selectedOption && isDowngrade && (
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">
                  This cabin is cheaper than your current one.
                </p>
                <p className="text-xs mt-1">
                  Your cabin will be downgraded immediately. No refund will be issued
                  for the difference — the cheaper fare is yours to keep.
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
                placeholder="Briefly explain the reason for the upgrade/downgrade..."
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Required — helps staff understand the request context.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && selectedOption && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Review Your Request</h3>

            <div className="bg-gray-50 rounded p-3 text-sm space-y-2">
              {isRoundTrip && trip && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Leg</span>
                  <span className="font-medium">
                    {((trip as any).direction === 'return' ? 'Return' : 'Departure')}
                    {trip.trip?.srcPort?.name && trip.trip?.destPort?.name
                      ? ` · ${trip.trip.srcPort.name} → ${trip.trip.destPort.name}`
                      : ''}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Passenger</span>
                <span className="font-medium">
                  {`${selectedPassenger?.passenger?.firstName ?? ''} ${selectedPassenger?.passenger?.lastName ?? ''}`.trim() ||
                    'Passenger'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Cabin</span>
                <span className="font-medium">{selectedPassenger?.cabin?.name ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Cabin</span>
                <span className="font-medium">{selectedOption.cabinName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Fare</span>
                <span className="font-medium">{formatCurrency(selectedOption.newFare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isUpgrade
                    ? 'Amount to Pay'
                    : isDowngrade
                      ? 'Fare Difference (non-refundable)'
                      : 'Difference'}
                </span>
                <span
                  className={`font-semibold ${
                    isUpgrade ? 'text-orange-600' : isDowngrade ? 'text-amber-700' : ''
                  }`}
                >
                  {formatCurrency(Math.abs(selectedOption.fareDifference))}
                </span>
              </div>
              {isUpgrade && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment</span>
                  <span className="font-medium">Online checkout (PayMongo)</span>
                </div>
              )}
              {isDowngrade && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Refund</span>
                  <span className="font-medium">No refund — cheaper fare is yours to keep</span>
                </div>
              )}
              {passengerRemarks && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 italic">"{passengerRemarks}"</p>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              {isUpgrade
                ? "You'll be redirected to PayMongo to pay the difference. Once the payment succeeds, your cabin is upgraded automatically — no staff review needed."
                : isDowngrade
                  ? 'Cabin downgrades are instant and final. Your booking will reflect the new cabin right away — no staff review needed.'
                  : 'Cabin swap is instant and free. Your booking will reflect the new cabin right away.'}
            </p>

            {isDowngrade && (
              <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
                <p className="font-semibold text-sm">Refund policy — please read</p>
                <ul className="list-disc list-outside pl-4 space-y-1">
                  <li>
                    The price difference of{' '}
                    <span className="font-semibold">
                      {formatCurrency(Math.abs(selectedOption.fareDifference))}
                    </span>{' '}
                    between your current cabin and the new cabin is{' '}
                    <span className="font-semibold">non-refundable</span>.
                  </li>
                  <li>
                    By proceeding, you waive any claim to a refund of the fare difference.
                    The amount stays with the carrier; the cheaper cabin fare is yours to
                    keep.
                  </li>
                  <li>
                    This downgrade executes immediately. Once submitted it cannot be
                    reversed by self-service — staff intervention would be required and is
                    not guaranteed.
                  </li>
                  <li>
                    Standard cancellation, no-show, and refund policies of the shipping
                    line continue to apply to the booking.
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
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={
                (step === 1 && !selectedPassengerId) ||
                (step === 2 &&
                  (!selectedCabinId ||
                    loadingOptions ||
                    !isRemarksValid))
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
                : isUpgrade && selectedOption
                  ? `Pay ₱${selectedOption.fareDifference.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} & upgrade`
                  : isDowngrade
                    ? 'Confirm downgrade'
                    : 'Confirm change'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
