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
import { IBooking } from '@/models';
import { createPassengerRequest } from '@/services/passenger-requests/passenger-requests.service';
import { getRefundPreview, type RefundPreview } from '@/services/booking/booking.service';

const REFUND_METHODS = [
  { value: 'OTC', label: 'Over-the-Counter (at port)' },
  { value: 'GCASH', label: 'GCash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'MAYA', label: 'Maya' },
];

const GATEWAY_LABEL: Record<string, string> = {
  paymongo: 'PayMongo',
  maya: 'Maya',
};

// Maps the persisted booking_payments.epayment_method (or the legacy lowercase
// PayMongo source.type) to a passenger-friendly label. The marketplace
// booking flow currently writes the mixed-case forms ('GCash', 'PayMaya',
// 'OnlineBanking', 'QRPh', 'GrabPay', 'Maya', 'PayMongo'); older gateway
// payloads may surface lowercase codes ('gcash', 'dob', 'grab_pay').
// Unknown values fall back to a Title-Cased version of the raw value.
const SUBMETHOD_LABEL: Record<string, string> = {
  // Lowercase (gateway-native)
  card: 'Card',
  gcash: 'GCash',
  paymaya: 'PayMaya',
  qrph: 'QR Ph',
  dob: 'Online Banking',
  grab_pay: 'GrabPay',
  // Mixed-case (what booking.service writes via epaymentMethodForDB)
  GCash: 'GCash',
  PayMaya: 'PayMaya',
  QRPh: 'QR Ph',
  OnlineBanking: 'Online Banking',
  GrabPay: 'GrabPay',
  Maya: 'Card',     // Maya gateway only handles cards
  PayMongo: '',     // unrestricted-checkout fallback — same as gateway, drop
  // Legacy high-level types (display nothing useful — drop)
  ONLINE: '',
  OTC: '',
};

function formatSubMethod(raw?: string | null): string | null {
  if (!raw) return null;
  // Direct hit on the stored value (preserves casing nuance)
  if (raw in SUBMETHOD_LABEL) {
    const mapped = SUBMETHOD_LABEL[raw];
    return mapped || null; // empty string → no label
  }
  // Lowercase fallback for gateway-native codes
  const lower = raw.toLowerCase();
  if (SUBMETHOD_LABEL[lower]) return SUBMETHOD_LABEL[lower];
  // Last-resort Title-Case
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function isGatewayPaid(booking: IBooking): boolean {
  const code = (booking.gatewayCode ?? '').toLowerCase();
  return code === 'paymongo' || code === 'maya';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  booking: IBooking;
  onSuccess: () => void;
}

export default function RequestRefundModal({ isOpen, onClose, booking, onSuccess }: Props) {
  const [step, setStep] = useState(1);
  const [selectedPassengerIds, setSelectedPassengerIds] = useState<string[]>([]);
  const [refundMethod, setRefundMethod] = useState('OTC');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [passengerRemarks, setPassengerRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<RefundPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || step !== 2 || selectedPassengerIds.length === 0 || !booking.id) {
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    getRefundPreview(booking.id, {
      passengerIds: selectedPassengerIds,
      faultType: 'passenger_fault',
    })
      .then((data) => {
        if (!cancelled) setPreview(data);
      })
      .catch(() => {
        if (!cancelled) setPreview(null);
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, step, selectedPassengerIds, booking.id]);

  // Round-trip support: customer picks a leg first, then selects passengers
  // on that leg. One refund request per leg — same pattern as the rebook
  // and cabin-change modals. Each btp id is per-leg and the backend's
  // getRefundPreview / createPassengerRequest already accept flat btp ids.
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

  const currentLeg = useMemo(() => {
    if (!isRoundTrip) return allLegs[0];
    return (
      allLegs.find((leg) => leg.bookingTripId === selectedLegBookingTripId) ??
      allLegs[0]
    );
  }, [allLegs, isRoundTrip, selectedLegBookingTripId]);

  const legDirection = (leg: any, idx: number) =>
    leg?.direction === 'return'
      ? 'Return'
      : leg?.direction === 'departure'
        ? 'Departure'
        : idx === 0
          ? 'Departure'
          : 'Return';
  const legRoute = (leg: any) =>
    `${leg?.trip?.srcPort?.name ?? leg?.trip?.srcPortName ?? ''} → ${leg?.trip?.destPort?.name ?? leg?.trip?.destPortName ?? ''}`.trim();

  const passengers =
    currentLeg?.bookingTripPassengers?.filter(
      (p) =>
        !p.removedReason &&
        (p as any).bookingStatus !== 'Rebooked' &&
        p.removedReasonType !== ('Rebooked' as any),
    ) ?? [];

  const gatewayPaid = isGatewayPaid(booking);
  const requiresAccountDetails = !gatewayPaid && refundMethod !== 'OTC';

  const handleClose = () => {
    setStep(1);
    setSelectedPassengerIds([]);
    setRefundMethod('OTC');
    setAccountName('');
    setAccountNumber('');
    setBankName('');
    setPassengerRemarks('');
    onClose();
  };

  const togglePassenger = (id: string) => {
    setSelectedPassengerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const isAccountValid =
    !requiresAccountDetails ||
    (accountName.trim() !== '' &&
      accountNumber.trim() !== '' &&
      (refundMethod !== 'BANK_TRANSFER' || bankName.trim() !== ''));
  const isRemarksValid = passengerRemarks.trim() !== '';

  const handleSubmit = async () => {
    if (!isAccountValid) {
      alert('Please complete the refund account details.');
      return;
    }
    if (!isRemarksValid) {
      alert('Please add a brief note explaining the refund request.');
      return;
    }
    setSubmitting(true);
    try {
      await createPassengerRequest({
        booking_id: booking.id!,
        request_type: 'REFUND',
        passenger_items: selectedPassengerIds.map((id) => ({ booking_trip_passenger_id: id })),
        fault_type: 'passenger_fault',
        refund_method: gatewayPaid ? undefined : refundMethod,
        refund_account_name: requiresAccountDetails ? accountName : undefined,
        refund_account_number: requiresAccountDetails ? accountNumber : undefined,
        refund_bank_name:
          requiresAccountDetails && refundMethod === 'BANK_TRANSFER' ? bankName : undefined,
        passenger_remarks: passengerRemarks.trim(),
      });
      handleClose();
      onSuccess();
    } catch {
      alert('Failed to submit refund request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Refund — Step {step} of 3</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-3">
            {isRoundTrip && (
              <div className="rounded border border-gray-200 p-3">
                <p className="text-sm font-medium mb-2">
                  Which leg do you want to refund from?
                </p>
                <div className="flex flex-wrap gap-2">
                  {allLegs.map((leg, i) => {
                    const isActive = leg.bookingTripId === selectedLegBookingTripId;
                    const dir = legDirection(leg, i);
                    const route = legRoute(leg);
                    return (
                      <button
                        key={leg.bookingTripId ?? i}
                        type="button"
                        onClick={() => {
                          if (leg.bookingTripId !== selectedLegBookingTripId) {
                            setSelectedLegBookingTripId(leg.bookingTripId ?? null);
                            setSelectedPassengerIds([]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">{dir}</span>
                        {route && <span className="ml-1 opacity-80">· {route}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600">
              Select the passenger(s) you want to refund:
            </p>
            {passengers.length === 0 && (
              <p className="text-sm text-gray-400">No passengers found on this leg.</p>
            )}
            {passengers.map((p) => {
              const name = `${p.passenger?.firstName ?? ''} ${p.passenger?.lastName ?? ''}`.trim();
              return (
                <label key={p.id} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPassengerIds.includes(p.id!)}
                    onChange={() => togglePassenger(p.id!)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{name || 'Passenger'}</p>
                    <p className="text-xs text-gray-500">
                      {p.cabin?.name ?? 'N/A'} · {p.discountType ?? 'ADULT'}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
              This will be marked as <strong>Passenger's Fault</strong>. Applicable charges may
              apply based on shipping line policy.
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs text-gray-700">
              <p className="font-medium mb-2">Refund breakdown</p>
              {previewLoading && <p className="text-gray-500">Calculating…</p>}
              {!previewLoading && !preview && (
                <p className="text-gray-500">Unable to load breakdown — staff will confirm the final amount.</p>
              )}
              {!previewLoading && preview && (
                <div className="space-y-1">
                  {preview.items.map((it, i) => (
                    <div
                      key={i}
                      className={`flex justify-between gap-2 ${
                        it.is_refundable ? '' : 'text-gray-400 line-through'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {it.description}
                        {!it.is_refundable && (
                          <span className="text-[10px] not-italic no-underline px-1 py-0.5 bg-red-50 text-red-700 rounded border border-red-200">
                            Non-refundable
                          </span>
                        )}
                      </span>
                      <span className="font-mono">₱{it.amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-1 mt-1 flex justify-between">
                    <span>Refundable subtotal</span>
                    <span className="font-mono">₱{preview.subtotal_refundable.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Refund rate</span>
                    <span className="font-mono">{preview.refund_percentage}%</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900">
                    <span>Estimated refund</span>
                    <span className="font-mono">₱{preview.estimated_refund_total.toFixed(2)}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 pt-1">
                    Final amount confirmed by staff on approval.
                  </p>
                </div>
              )}
            </div>

            {gatewayPaid ? (() => {
              const gatewayLabel =
                GATEWAY_LABEL[(booking.gatewayCode ?? '').toLowerCase()] ?? 'Online';
              const subLabel = formatSubMethod(booking.paymentMethod);
              const channel = subLabel
                ? `${gatewayLabel} · ${subLabel}`
                : gatewayLabel;
              return (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    Refund will go to your original payment:{' '}
                    <span className="font-semibold">{channel}</span>
                  </p>
                  <p className="text-xs">
                    Because this booking was paid online, the refund is routed
                    automatically to the original {subLabel ? subLabel.toLowerCase() : 'card / e-wallet'}{' '}
                    on staff approval. No account details required.
                  </p>
                </div>
              );
            })() : (
              <div>
                <label className="block text-sm font-medium mb-1">Refund Method</label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                >
                  {REFUND_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {requiresAccountDetails && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="Full name on account"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number / Mobile Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                    placeholder="e.g. 09XX XXX XXXX"
                  />
                </div>
                {refundMethod === 'BANK_TRANSFER' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full border rounded px-3 py-2 text-sm"
                      placeholder="e.g. BDO, BPI, Metrobank"
                    />
                  </div>
                )}
              </>
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
                placeholder="Briefly explain the reason for the refund..."
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Required — helps staff process your refund request.
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="border rounded overflow-hidden">
              {isRoundTrip && currentLeg && (
                <div className="bg-gray-50 px-3 py-2 flex items-center justify-between border-b">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                    {legDirection(currentLeg, allLegs.indexOf(currentLeg))}
                  </span>
                  <span className="text-xs text-gray-500">{legRoute(currentLeg)}</span>
                </div>
              )}
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium">Passenger</th>
                    <th className="text-left px-3 py-2 font-medium">Cabin</th>
                    <th className="text-left px-3 py-2 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {passengers
                    .filter((p) => selectedPassengerIds.includes(p.id!))
                    .map((p) => (
                      <tr key={p.id}>
                        <td className="px-3 py-2">
                          {`${p.passenger?.firstName ?? ''} ${p.passenger?.lastName ?? ''}`.trim() ||
                            'Passenger'}
                        </td>
                        <td className="px-3 py-2">{p.cabin?.name ?? 'N/A'}</td>
                        <td className="px-3 py-2">{p.discountType ?? 'ADULT'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 rounded p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Refund Method</span>
                <span className="font-medium">
                  {gatewayPaid
                    ? (() => {
                        const gw =
                          GATEWAY_LABEL[(booking.gatewayCode ?? '').toLowerCase()] ?? 'Online';
                        const sub = formatSubMethod(booking.paymentMethod);
                        return sub
                          ? `Original ${gw} · ${sub} payment`
                          : `Original ${gw} payment`;
                      })()
                    : REFUND_METHODS.find((m) => m.value === refundMethod)?.label}
                </span>
              </div>
              {requiresAccountDetails && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Name</span>
                    <span className="font-medium">{accountName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Number</span>
                    <span className="font-medium">{accountNumber || '—'}</span>
                  </div>
                  {refundMethod === 'BANK_TRANSFER' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bank</span>
                      <span className="font-medium">{bankName || '—'}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <p className="text-xs text-gray-500">
              By submitting, you acknowledge that your refund request is subject to the shipping
              line's refund policy. Refund amounts will be determined by staff upon review.
            </p>
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
                (step === 1 && selectedPassengerIds.length === 0) ||
                (step === 2 && (!isAccountValid || !isRemarksValid))
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !isAccountValid || !isRemarksValid}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
