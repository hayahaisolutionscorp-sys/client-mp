'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
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
  TripSeat,
} from './seat-picker.types';
import { isPwdSenior } from './seat-picker.utils';
import { SeatGrid } from './SeatGrid';
import { SeatLegend } from './SeatLegend';

export interface SeatPickerTrip {
  tripId: string;
  label: string;
  cabinId: number;
}

export interface SeatPickerPassenger {
  key: string;
  firstName: string;
  lastName: string;
  discountType: string;
}

export type SeatLabelsMap = Record<string, Record<string, string>>;

interface SeatPickerProps {
  trips: SeatPickerTrip[];
  passengers: SeatPickerPassenger[];
  initialAssignments?: AssignmentsMap;
  onConfirm: (assignments: AssignmentsMap, labels: SeatLabelsMap) => void;
  onSkip: () => void;
  onBack?: () => void;
}

const ZOOM_STEPS = [0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3] as const;
const DEFAULT_ZOOM_IDX = 4; // 1.0

export function SeatPicker({
  trips,
  passengers,
  initialAssignments = {},
  onConfirm,
  onSkip,
  onBack,
}: SeatPickerProps) {
  const { error: toastError, warn: toastWarn } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTripIndex, setActiveTripIndex] = useState(0);
  const [activeDeckId, setActiveDeckId] = useState<number | null>(null);
  // focusedIdx is ALWAYS set to a valid index (never null) — cinema cycling
  const [focusedIdx, setFocusedIdx] = useState<number>(0);
  const [assignments, setAssignments] = useState<AssignmentsMap>(initialAssignments);
  const [isSkipping, setIsSkipping] = useState(false);
  const [zoomIdx, setZoomIdx] = useState(DEFAULT_ZOOM_IDX);

  const [decks, setDecks] = useState<CabinDeck[]>([]);
  const [layout, setLayout] = useState<DeckLayout | null>(null);
  const [seats, setSeats] = useState<TripSeat[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTrip = trips[activeTripIndex];
  const zoom = ZOOM_STEPS[zoomIdx] ?? 1.0;

  // ── Mount: validate cached assignments ────────────────────────────────────
  useEffect(() => {
    const validKeys = new Set(passengers.map((p) => p.key));
    const orphanedSeatIds: string[] = [];
    const pruned: AssignmentsMap = {};

    for (const [key, tripMap] of Object.entries(initialAssignments)) {
      if (validKeys.has(key)) {
        pruned[key] = tripMap;
      } else {
        orphanedSeatIds.push(...Object.values(tripMap));
      }
    }

    if (orphanedSeatIds.length > 0) {
      for (const trip of trips) {
        releaseSeats(trip.tripId, orphanedSeatIds).catch(() => {});
      }
      setAssignments(pruned);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch decks when trip changes ─────────────────────────────────────────
  useEffect(() => {
    if (!activeTrip) return;
    setDecks([]);
    setActiveDeckId(null);
    setLayout(null);

    getCabinDecks(activeTrip.cabinId).then((d) => {
      setDecks(d);
      const firstActive = d.find((deck) => deck.has_active_layout);
      if (firstActive) setActiveDeckId(firstActive.id);
    });
  }, [activeTrip?.cabinId]);

  // ── Fetch layout when deck changes ────────────────────────────────────────
  useEffect(() => {
    if (!activeDeckId) return;
    getDeckLayout(activeDeckId).then((l) => setLayout(l));
  }, [activeDeckId]);

  // ── Fetch + poll seats ────────────────────────────────────────────────────
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
    fetchSeats();
    pollRef.current = setInterval(fetchSeats, 10_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchSeats]);

  // ── Cinema cycling: advance to next passenger after assignment ────────────
  function advancePassenger(fromIdx: number, currentAssignments: AssignmentsMap, tripId: string) {
    const n = passengers.length;
    if (n <= 1) return; // only one passenger, nothing to advance

    // Rotate: start from the passenger AFTER current, wrap around
    for (let offset = 1; offset < n; offset++) {
      const nextIdx = (fromIdx + offset) % n;
      const nextKey = passengers[nextIdx]?.key;
      if (nextKey && !currentAssignments[nextKey]?.[tripId]) {
        setFocusedIdx(nextIdx);
        return;
      }
    }
    // All assigned — wrap back to first passenger (stay "active" for re-assignment)
    setFocusedIdx(0);
  }

  // ── Seat click handler ─────────────────────────────────────────────────────
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
      try {
        await releaseSeats(tripId, [seat.id]);
      } catch {
        // best effort
      }
      setAssignments((prev) => {
        const updated = { ...prev };
        if (updated[passengerKey]) {
          const { [tripId]: _, ...rest } = updated[passengerKey];
          updated[passengerKey] = rest;
        }
        return updated;
      });
      return;
    }

    // Client-side guard: already assigned to another passenger
    const alreadyTakenByOther = assignedSeatIds.has(seat.id) && currentSeatId !== seat.id;
    if (alreadyTakenByOther) {
      toastWarn('This seat is already assigned to another passenger.');
      return;
    }

    // Hold new seat
    try {
      await holdSeats(tripId, [seat.id], activeDeckId);
    } catch (err: any) {
      if (err.message === 'SEAT_CONFLICT') {
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

    // Cinema cycle to next unassigned passenger
    advancePassenger(focusedIdx, newAssignments, tripId);
    fetchSeats();
  }

  // ── Skip handler ──────────────────────────────────────────────────────────
  async function handleSkip() {
    setIsSkipping(true);
    const allSeatIds = Object.values(assignments).flatMap((tripMap) =>
      Object.values(tripMap),
    );
    if (allSeatIds.length > 0) {
      for (const trip of trips) {
        await releaseSeats(trip.tripId, allSeatIds).catch(() => {});
      }
    }
    setAssignments({});
    onSkip();
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const assignedSeatIds = new Set(
    Object.values(assignments).flatMap((tripMap) => Object.values(tripMap)),
  );

  const assignedCount = passengers.filter(
    (p) => assignments[p.key]?.[activeTrip?.tripId ?? ''],
  ).length;

  const focusedPassenger = passengers[focusedIdx] ?? null;
  const focusedIsPwd = isPwdSenior(focusedPassenger?.discountType ?? '');
  const hasPwd = passengers.some((p) => isPwdSenior(p.discountType));
  const activeDecks = decks.filter((d) => d.has_active_layout);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col bg-white overflow-hidden" style={{ height: '100dvh' }}>

      {/* ── Header (52px) ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 border-b border-zinc-200 bg-white shrink-0"
        style={{ height: 52 }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-[13px] font-semibold text-zinc-800 leading-tight">Select Your Seats</h1>
          <p className="text-[11px] text-zinc-400">Step 3 of 4</p>
        </div>

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

      {/* ── Body ──────────────────────────────────────────────────────────── */}
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
                  {/* Number badge */}
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

                  {/* Selecting indicator */}
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

          {/* Deck tabs + zoom controls row */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-200 bg-white shrink-0">
            {/* Deck tabs */}
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
            </div>

            {/* Zoom controls */}
            {layout && (
              <div className="flex items-center gap-1 shrink-0 ml-2">
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

          {/* Currently selecting indicator */}
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

          {/* Seat grid area */}
          <div className="flex-1 min-h-0 overflow-auto">
            {!layout && (
              <div className="flex items-center justify-center h-full text-[13px] text-zinc-400">
                {activeDeckId ? 'Loading layout…' : 'Select a deck to view seats'}
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
              /* CSS zoom scales the grid visually without breaking overflow */
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

      {/* ── Footer (52px) ─────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 border-t border-zinc-200 bg-white shrink-0"
        style={{ height: 52 }}
      >
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSkipping}
          className="px-4 py-2 text-[12px] font-medium text-zinc-600 border border-zinc-300 rounded-lg hover:bg-zinc-50 disabled:opacity-50 transition-colors"
        >
          {isSkipping ? 'Releasing…' : 'Skip — Auto-assign'}
        </button>

        <span className="text-[11px] text-zinc-400">
          <span className="font-semibold text-zinc-700">{assignedCount}</span>
          {' of '}
          <span className="font-semibold text-zinc-700">{passengers.length}</span>
          {' assigned'}
        </span>

        <button
          type="button"
          onClick={() => {
            const labels: SeatLabelsMap = {};
            for (const [pKey, tripMap] of Object.entries(assignments)) {
              labels[pKey] = {};
              for (const [tId, seatId] of Object.entries(tripMap)) {
                const seat = seats.find((s) => s.id === seatId);
                if (seat) labels[pKey][tId] = seat.cell_id;
              }
            }
            onConfirm(assignments, labels);
          }}
          className="px-4 py-2 text-[12px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
