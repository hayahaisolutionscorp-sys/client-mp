'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Timer } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/use-toast';
import {
  getCabinDecks,
  getDeckLayout,
  getTripSeats,
  holdSeats,
  releaseSeats,
} from '@/services/accommodation/seat.service';
import type {
  AssignmentsMap,
  CabinDeck,
  DeckLayout,
  SeatLabelsMap,
  TripSeat,
} from './seat-picker.types';
import { isPwdSenior } from './seat-picker.utils';
import { SeatGrid } from './SeatGrid';
import { SeatLegend } from './SeatLegend';
import { autoAssignSeats } from './auto-assign';

export interface SeatPickerDialogTrip {
  tripId: string;
  label: string;
  cabinId: number;
}

export interface SeatPickerDialogPassenger {
  key: string;
  firstName: string;
  lastName: string;
  discountType: string;
}

interface SeatPickerDialogProps {
  open: boolean;
  onClose: () => void;
  trips: SeatPickerDialogTrip[];
  passengers: SeatPickerDialogPassenger[];
  initialAssignments?: AssignmentsMap;
  onConfirm: (assignments: AssignmentsMap, labels: SeatLabelsMap) => void;
}

const ZOOM_STEPS = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3] as const;
const DEFAULT_ZOOM_IDX = 4;
const HOLD_SESSION_SECONDS = 15 * 60;

/** Format seconds as MM:SS */
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function DeckStackIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} aria-hidden>
      <path d="M12 5 4 9l8 4 8-4-8-4Z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m4 13 8 4 8-4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SeatPickerDialog({
  open,
  onClose,
  trips,
  passengers,
  initialAssignments = {},
  onConfirm,
}: SeatPickerDialogProps) {
  const { error: toastError, warn: toastWarn } = useToast();
  const toastErrorRef = useRef(toastError);
  useEffect(() => { toastErrorRef.current = toastError; }, [toastError]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTripIndex, setActiveTripIndex] = useState(0);
  const [activeDeckId, setActiveDeckId] = useState<number | null>(null);
  const [focusedIdx, setFocusedIdx] = useState<number>(0);
  const [assignments, setAssignments] = useState<AssignmentsMap>(initialAssignments);
  const [isSkipping, setIsSkipping] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(DEFAULT_ZOOM_IDX);

  const [decks, setDecks] = useState<CabinDeck[]>([]);
  const [layout, setLayout] = useState<DeckLayout | null>(null);
  const [seats, setSeats] = useState<TripSeat[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  // Hold session timer (resets on open)
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const assignmentsRef = useRef<AssignmentsMap>(initialAssignments);
  const confirmedRef = useRef(false);

  const activeTrip = trips[activeTripIndex];
  const zoom = ZOOM_STEPS[zoomIdx] ?? 1.0;

  // Keep assignmentsRef in sync so timer/beforeunload always see current state
  useEffect(() => {
    assignmentsRef.current = assignments;
  }, [assignments]);

  // ── Reset state when dialog opens ─────────────────────────────────────────
  useEffect(() => {
    if (open) {
      setActiveTripIndex(0);
      setActiveDeckId(null);
      setLayout(null);
      setSeats([]);
      setFocusedIdx(0);
      setAssignments(initialAssignments);
      assignmentsRef.current = initialAssignments;
      confirmedRef.current = false;
      setZoomIdx(DEFAULT_ZOOM_IDX);
      setHoldSecondsLeft(HOLD_SESSION_SECONDS);
    } else {
      // Cleanup polling & timer on close
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  // initialAssignments intentionally included: when open transitions false→true,
  // the effect must capture the current prop value, not a stale closure.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialAssignments]);

  // ── Fetch decks when trip changes ─────────────────────────────────────────
  useEffect(() => {
    if (!open || !activeTrip) return;
    setDecks([]);
    setActiveDeckId(null);
    setLayout(null);

    getCabinDecks(activeTrip.cabinId).then((d) => {
      setDecks(d);
      const firstActive = d.find((deck) => deck.has_active_layout);
      if (firstActive) setActiveDeckId(firstActive.id);
    });
  }, [open, activeTrip?.cabinId]);

  // ── Fetch layout when deck changes ────────────────────────────────────────
  useEffect(() => {
    if (!activeDeckId) return;
    getDeckLayout(activeDeckId).then((l) => setLayout(l));
  }, [activeDeckId]);

  // ── Fetch + poll seats (5s for near-real-time hold visibility) ────────────
  const fetchSeats = useCallback(async () => {
    if (!activeTrip || !activeDeckId) return;
    setSeatsLoading(true);
    try {
      const s = await getTripSeats(activeTrip.tripId, activeDeckId);
      setSeats(s);
    } finally {
      setSeatsLoading(false);
    }
  }, [activeTrip?.tripId, activeDeckId]);

  useEffect(() => {
    if (!open) return;
    fetchSeats();
    pollRef.current = setInterval(fetchSeats, 5_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSeats, open]);

  // ── Release holds on hard page close / reload ────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handleUnload = () => {
      if (confirmedRef.current) return;
      const currentAssignments = assignmentsRef.current;
      const seatsByTrip: Record<string, string[]> = {};
      for (const [, tripMap] of Object.entries(currentAssignments)) {
        for (const [tripId, seatId] of Object.entries(tripMap)) {
          if (!seatsByTrip[tripId]) seatsByTrip[tripId] = [];
          seatsByTrip[tripId]!.push(seatId);
        }
      }
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
      for (const [tripId, seatIds] of Object.entries(seatsByTrip)) {
        if (seatIds.length === 0) continue;
        // sendBeacon is the only reliable unload mechanism in modern browsers;
        // sync XHR is blocked by Chrome 80+. Backend has a POST /seats/release alias.
        navigator.sendBeacon(
          `${apiBase}/public/trips/${tripId}/seats/release`,
          new Blob([JSON.stringify({ seatIds })], { type: 'application/json' }),
        );
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [open]);

  // ── Hold session timer — always starts at 15:00 on open ──────────────────
  useEffect(() => {
    if (!open) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const tick = () => {
      setHoldSecondsLeft((prev) => {
        if (prev === null) return prev;
        const next = Math.max(0, prev - 1);
        if (next === 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          toastErrorRef.current('Your seat hold time expired. Please reselect your seats.');
          // Use ref so we always release seats assigned up to this moment
          const currentAssignments = assignmentsRef.current;
          const seatsByTrip: Record<string, string[]> = {};
          for (const [pKey, tripMap] of Object.entries(currentAssignments)) {
            for (const [tripId, seatId] of Object.entries(tripMap)) {
              if (!seatsByTrip[tripId]) seatsByTrip[tripId] = [];
              seatsByTrip[tripId]!.push(seatId);
            }
          }
          for (const [tripId, seatIds] of Object.entries(seatsByTrip)) {
            releaseSeats(tripId, seatIds).catch(() => {});
          }
          setAssignments({});
          fetchSeats();
        }
        return next;
      });
    };

    timerIntervalRef.current = setInterval(tick, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [open, fetchSeats]); // toastErrorRef is stable via ref — no need in deps; assignments excluded — use assignmentsRef

  async function handleClose() {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const seatsByTrip: Record<string, string[]> = {};
    for (const [, tripMap] of Object.entries(assignments)) {
      for (const [tripId, seatId] of Object.entries(tripMap)) {
        if (!seatsByTrip[tripId]) seatsByTrip[tripId] = [];
        seatsByTrip[tripId]!.push(seatId);
      }
    }
    for (const [tripId, seatIds] of Object.entries(seatsByTrip)) {
      await releaseSeats(tripId, seatIds).catch(() => {});
    }
    setAssignments({});
    onClose();
  }

  // ── Cinema cycling ─────────────────────────────────────────────────────────
  function advancePassenger(fromIdx: number, currentAssignments: AssignmentsMap, tripId: string) {
    const n = passengers.length;
    if (n <= 1) return;
    for (let offset = 1; offset < n; offset++) {
      const nextIdx = (fromIdx + offset) % n;
      const nextKey = passengers[nextIdx]?.key;
      if (nextKey && !currentAssignments[nextKey]?.[tripId]) {
        setFocusedIdx(nextIdx);
        return;
      }
    }
    setFocusedIdx(0);
  }

  // ── Seat click ─────────────────────────────────────────────────────────────
  async function handleSeatClick(seat: TripSeat) {
    if (!activeTrip || !activeDeckId) return;
    const passenger = passengers[focusedIdx];
    if (!passenger) return;

    const passengerKey = passenger.key;
    const tripId = activeTrip.tripId;

    if (seat.cell_type === 'bed-upper' && isPwdSenior(passenger.discountType)) {
      toastWarn(`Upper bunk may not be suitable for ${passenger.discountType} passengers.`);
    }

    const currentSeatId = assignments[passengerKey]?.[tripId];

    // Deselect: tapping the same seat again
    if (currentSeatId === seat.id) {
      try { await releaseSeats(tripId, [seat.id]); } catch { /* best effort */ }
      setAssignments((prev) => {
        const updated = { ...prev };
        if (updated[passengerKey]) {
          const rest = { ...updated[passengerKey] };
          delete rest[tripId];
          updated[passengerKey] = rest;
        }
        return updated;
      });
      return;
    }

    // Guard: already assigned to another passenger
    const alreadyTakenByOther = assignedSeatIds.has(seat.id) && currentSeatId !== seat.id;
    if (alreadyTakenByOther) {
      toastWarn('This seat is already assigned to another passenger.');
      return;
    }

    // Hold new seat
    try {
      await holdSeats(tripId, [seat.id], activeDeckId);
    } catch (err: unknown) {
      const isSeatConflict = err instanceof Error && err.message === 'SEAT_CONFLICT';
      if (isSeatConflict) {
        toastError('This seat was just reserved by another passenger.');
        fetchSeats();
      } else {
        toastError('Could not reserve this seat. Please try again.');
      }
      return;
    }

    // Release old seat if reassigning
    if (currentSeatId) {
      releaseSeats(tripId, [currentSeatId]).catch(() => {});
    }

    const newAssignments: AssignmentsMap = {
      ...assignments,
      [passengerKey]: { ...(assignments[passengerKey] ?? {}), [tripId]: seat.id },
    };
    setAssignments(newAssignments);
    advancePassenger(focusedIdx, newAssignments, tripId);
    fetchSeats();
  }

  // ── Skip ───────────────────────────────────────────────────────────────────
  async function handleSkip() {
    setIsSkipping(true);
    try {
      const result = await autoAssignSeats({
        trips: trips.map((trip) => ({ tripId: trip.tripId, cabinId: trip.cabinId })),
        passengers: passengers.map((passenger) => ({
          key: passenger.key,
          discountType: passenger.discountType,
        })),
        currentAssignments: assignments,
        releaseExisting: true,
      });

      if (result.unassigned.length > 0) {
        toastWarn(
          `${result.unassigned.length} seat ${result.unassigned.length === 1 ? 'assignment is' : 'assignments are'} still unavailable. Assigned seats were kept.`,
        );
      }

      confirmedRef.current = true;
      onConfirm(result.assignments, result.labels);
    } catch {
      toastError('Auto-assign failed. Please try again.');
    } finally {
      setIsSkipping(false);
    }
  }

  // ── Confirm ────────────────────────────────────────────────────────────────
  function handleConfirm() {
    const labels: SeatLabelsMap = {};
    for (const [pKey, tripMap] of Object.entries(assignments)) {
      labels[pKey] = {};
      for (const [tId, seatId] of Object.entries(tripMap)) {
        const seat = seats.find((s) => s.id === seatId);
        if (seat) labels[pKey][tId] = seat.cell_id;
      }
    }
    confirmedRef.current = true;
    onConfirm(assignments, labels);
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const assignedSeatIds = new Set(
    Object.values(assignments).flatMap((tm) => Object.values(tm)),
  );
  const assignedCount = passengers.filter(
    (p) => assignments[p.key]?.[activeTrip?.tripId ?? ''],
  ).length;
  const focusedPassenger = passengers[focusedIdx] ?? null;
  const focusedIsPwd = isPwdSenior(focusedPassenger?.discountType ?? '');
  const hasPwd = passengers.some((p) => isPwdSenior(p.discountType));
  const activeDecks = decks.filter((d) => d.has_active_layout);

  const timerIsUrgent = holdSecondsLeft !== null && holdSecondsLeft <= 60;
  const timerIsExpired = holdSecondsLeft === 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="z-[1001] p-0 max-w-[96vw] md:max-w-[1200px] lg:max-w-[1400px] xl:max-w-[1500px] w-full h-[92dvh] flex flex-col overflow-hidden gap-0 [&>button.absolute]:hidden">
        <DialogTitle className="sr-only">Select Your Seats</DialogTitle>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-4 border-b border-zinc-200 bg-white shrink-0"
          style={{ height: 52 }}
        >
          {/* Close */}
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-[13px] font-semibold text-zinc-800 leading-tight">Select Your Seats</h1>
            <p className="text-[11px] text-zinc-400">Optional — skip to auto-assign</p>
          </div>

          {/* Hold countdown timer */}
          {holdSecondsLeft !== null && holdSecondsLeft > 0 && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold shrink-0 transition-all ${
                timerIsUrgent
                  ? 'bg-red-100 text-red-700 animate-pulse'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              <Timer className="h-4 w-4" />
              <span>{formatCountdown(holdSecondsLeft)}</span>
            </div>
          )}
          {timerIsExpired && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold bg-red-100 text-red-700 shrink-0">
              <Timer className="h-4 w-4" />
              <span>Expired</span>
            </div>
          )}

          {/* Trip tabs */}
          {trips.length > 1 && (
            <div className="flex gap-1 shrink-0">
              {trips.map((trip, i) => (
                <button
                  key={trip.tripId}
                  onClick={() => setActiveTripIndex(i)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-lg border transition-colors ${
                    i === activeTripIndex
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  {trip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Left: passenger list — desktop only */}
          <div className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-zinc-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-zinc-200 shrink-0">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[.06em]">Passengers</p>
            </div>

            <div className="flex-1 overflow-y-auto py-1">
              {passengers.map((p, i) => {
                const assigned = assignments[p.key]?.[activeTrip?.tripId ?? ''];
                const seat = assigned ? seats.find((s) => s.id === assigned) : null;
                const isFocused = focusedIdx === i;
                const isPwd = isPwdSenior(p.discountType);

                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setFocusedIdx(i)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left border-l-2 transition-colors ${
                      isFocused
                        ? 'border-l-blue-600 bg-blue-50/60'
                        : 'border-l-transparent hover:bg-zinc-50'
                    }`}
                  >
                    <span
                      className={`flex-none w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isFocused
                          ? 'bg-blue-600 text-white'
                          : assigned
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-zinc-200 text-zinc-500'
                      }`}
                    >
                      {assigned ? (
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5 min-w-0">
                        <span className="text-[12px] font-medium text-zinc-800 truncate">
                          {p.firstName} {p.lastName}
                        </span>
                        {isPwd && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-violet-100 text-violet-700 font-medium shrink-0">
                            {p.discountType}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-none ${assigned ? 'text-emerald-600 font-medium' : 'text-zinc-400'}`}>
                        {seat ? seat.cell_id : 'No seat selected'}
                      </p>
                    </div>

                    {isFocused && !assigned && (
                      <span className="text-[9px] text-blue-500 font-semibold shrink-0 uppercase tracking-wide">
                        Selecting
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Progress */}
            <div className="px-4 py-2.5 border-t border-zinc-200 bg-white shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[.06em]">Progress</span>
                <span className="text-[11px] font-semibold text-zinc-600">{assignedCount}/{passengers.length}</span>
              </div>
              <div className="h-1 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${passengers.length > 0 ? (assignedCount / passengers.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: map area */}
          <div className="flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">

            {/* Mobile: passenger chips */}
            <div className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-zinc-200 bg-white shrink-0 overflow-x-auto">
              {passengers.map((p, i) => {
                const assigned = assignments[p.key]?.[activeTrip?.tripId ?? ''];
                const isFocused = focusedIdx === i;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setFocusedIdx(i)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap border transition-colors shrink-0 ${
                      isFocused
                        ? 'bg-blue-600 text-white border-blue-600'
                        : assigned
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    <span>{p.firstName}</span>
                    {assigned && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {isFocused && !assigned && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Deck tabs + zoom */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 bg-white shrink-0">
              <DeckStackIcon className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[.06em] mr-1">Deck</span>
              <div className="flex gap-1 flex-1 overflow-x-auto">
                {activeDecks.map((deck) => (
                  <button
                    key={deck.id}
                    type="button"
                    onClick={() => setActiveDeckId(deck.id)}
                    className={`px-3 py-1.5 text-[12px] font-medium rounded-lg border whitespace-nowrap transition-colors shrink-0 ${
                      deck.id === activeDeckId
                        ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                        : 'bg-white border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    {deck.name}
                  </button>
                ))}
                {activeDecks.length === 0 && (
                  <span className="text-[11px] text-amber-700">
                    No active seatmap for this cabin. Seat selection is unavailable.
                  </span>
                )}
              </div>

              {layout && (
                <div className="flex items-center gap-1 shrink-0 ml-2 pl-2 border-l border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setZoomIdx((z) => Math.max(0, z - 1))}
                    disabled={zoomIdx === 0}
                    className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomIdx(DEFAULT_ZOOM_IDX)}
                    className="px-1.5 py-1 rounded text-[10px] font-semibold text-zinc-500 hover:bg-zinc-100 transition-colors tabular-nums min-w-[36px] text-center"
                    title="Reset zoom"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomIdx((z) => Math.min(ZOOM_STEPS.length - 1, z + 1))}
                    disabled={zoomIdx === ZOOM_STEPS.length - 1}
                    className="p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 transition-colors"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Legend */}
            {layout && <SeatLegend rates={layout.rates ?? []} showPwd={hasPwd} />}

            {/* Selecting for banner */}
            {focusedPassenger && (
              <div className="px-4 py-1.5 bg-blue-50 border-b border-blue-100 shrink-0">
                <p className="text-[11px] text-blue-700">
                  <span className="font-semibold">Selecting for:</span>{' '}
                  {focusedPassenger.firstName} {focusedPassenger.lastName}
                  {assignedCount === passengers.length && (
                    <span className="ml-2 text-emerald-600 font-semibold">— All assigned. Click any seat to reassign.</span>
                  )}
                </p>
              </div>
            )}

            {/* Seat grid */}
            <div className="flex-1 min-h-0 overflow-auto">
              {!layout && (
                <div className="flex items-center justify-center h-full text-[13px] text-zinc-400">
                  {activeDeckId
                    ? 'Loading layout…'
                    : activeDecks.length === 0
                      ? 'No active seatmap for this cabin. You can continue and seats will be auto-assigned.'
                      : 'Select a deck to view seats'}
                </div>
              )}
              {layout && seats.length === 0 && !seatsLoading && (
                <div className="flex flex-col items-center justify-center h-full gap-2 p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-1">
                    <RotateCcw className="w-5 h-5 text-zinc-400" />
                  </div>
                  <p className="text-[13px] font-semibold text-zinc-700">All seats taken</p>
                  <p className="text-[12px] text-zinc-400">Skip to let the system auto-assign adjacent seats.</p>
                </div>
              )}
              {layout && (
                <div style={{ zoom }}>
                  <SeatGrid
                    layout={layout}
                    seats={seats}
                    assignedSeatIds={assignedSeatIds}
                    focusedPassengerIsPwd={focusedIsPwd}
                    onSeatClick={handleSeatClick}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 border-t border-zinc-200 bg-white shrink-0"
          style={{ height: 52 }}
        >
          <span className="text-[10px] text-zinc-400">
            Seats are not saved until you confirm. Closing releases holds.
          </span>

          <span className="text-[11px] text-zinc-400">
            <span className="font-semibold text-zinc-700">{assignedCount}</span>
            {' of '}
            <span className="font-semibold text-zinc-700">{passengers.length}</span>
            {' assigned'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isSkipping}
              className="px-4 py-2 text-[12px] font-medium text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
            >
              {isSkipping ? 'Auto-assigning…' : 'Skip — Auto-assign'}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-[12px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Confirm Seats
            </button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
