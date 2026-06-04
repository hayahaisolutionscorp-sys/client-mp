import { getCabinDecks, getTripSeats, holdSeats, releaseSeats } from '@/services/accommodation/seat.service';
import type { AssignmentsMap, SeatLabelsMap, TripSeat } from './seat-picker.types';
import { isPwdSenior } from './seat-picker.utils';

export interface AutoAssignTripInput {
  tripId: string;
  cabinId: number;
}

export interface AutoAssignPassengerInput {
  key: string;
  discountType: string;
}

export interface AutoAssignResult {
  assignments: AssignmentsMap;
  labels: SeatLabelsMap;
  requestedCount: number;
  assignedCount: number;
  unassigned: Array<{ passengerKey: string; tripId: string }>;
}

interface AutoAssignOptions {
  trips: AutoAssignTripInput[];
  passengers: AutoAssignPassengerInput[];
  currentAssignments?: AssignmentsMap;
  currentLabels?: SeatLabelsMap;
  releaseExisting?: boolean;
  sessionId?: string;
}

interface SeatCandidate {
  seat: TripSeat;
  deckId: number;
}

function cloneAssignments(source: AssignmentsMap): AssignmentsMap {
  const cloned: AssignmentsMap = {};
  for (const [passengerKey, tripMap] of Object.entries(source)) {
    cloned[passengerKey] = { ...tripMap };
  }
  return cloned;
}

function cloneLabels(source: SeatLabelsMap): SeatLabelsMap {
  const cloned: SeatLabelsMap = {};
  for (const [passengerKey, tripMap] of Object.entries(source)) {
    cloned[passengerKey] = { ...tripMap };
  }
  return cloned;
}

function isSeatConflict(error: unknown): boolean {
  return error instanceof Error && error.message === 'SEAT_CONFLICT';
}

function findCandidateIndex(candidates: SeatCandidate[], preferNonUpper: boolean): number {
  if (!preferNonUpper) return candidates.length > 0 ? 0 : -1;
  const nonUpperIndex = candidates.findIndex((candidate) => candidate.seat.cell_type !== 'bed-upper');
  if (nonUpperIndex >= 0) return nonUpperIndex;
  return candidates.length > 0 ? 0 : -1;
}

function seatSorter(a: TripSeat, b: TripSeat): number {
  if (a.row_idx !== b.row_idx) return a.row_idx - b.row_idx;
  if (a.col_idx !== b.col_idx) return a.col_idx - b.col_idx;
  return a.cell_id.localeCompare(b.cell_id);
}

export async function autoAssignSeats({
  trips,
  passengers,
  currentAssignments = {},
  currentLabels = {},
  releaseExisting = false,
  sessionId,
}: AutoAssignOptions): Promise<AutoAssignResult> {
  const tripIds = new Set(trips.map((trip) => trip.tripId));
  const assignments = cloneAssignments(currentAssignments);
  const labels = cloneLabels(currentLabels);

  if (releaseExisting) {
    const seatIdsByTrip = new Map<string, Set<string>>();

    for (const [passengerKey, tripMap] of Object.entries(assignments)) {
      for (const [tripId, seatId] of Object.entries(tripMap)) {
        if (!tripIds.has(tripId)) continue;
        if (!seatIdsByTrip.has(tripId)) seatIdsByTrip.set(tripId, new Set<string>());
        seatIdsByTrip.get(tripId)?.add(seatId);

        delete assignments[passengerKey]?.[tripId];
        if (assignments[passengerKey] && Object.keys(assignments[passengerKey]).length === 0) {
          delete assignments[passengerKey];
        }

        delete labels[passengerKey]?.[tripId];
        if (labels[passengerKey] && Object.keys(labels[passengerKey]).length === 0) {
          delete labels[passengerKey];
        }
      }
    }

    for (const [tripId, seatIds] of seatIdsByTrip.entries()) {
      if (seatIds.size > 0) {
        await releaseSeats(tripId, Array.from(seatIds)).catch(() => {});
      }
    }
  }

  let requestedCount = 0;
  const unassigned: Array<{ passengerKey: string; tripId: string }> = [];

  for (const trip of trips) {
    const activeDecks = (await getCabinDecks(trip.cabinId))
      .filter((deck) => deck.has_active_layout)
      .sort((a, b) => a.sort_order - b.sort_order);

    const passengersForTrip = passengers.filter((passenger) => !assignments[passenger.key]?.[trip.tripId]);

    requestedCount += passengersForTrip.length;

    if (passengersForTrip.length === 0) {
      continue;
    }

    if (activeDecks.length === 0) {
      for (const passenger of passengersForTrip) {
        unassigned.push({ passengerKey: passenger.key, tripId: trip.tripId });
      }
      continue;
    }

    const seatLookupById = new Map<string, TripSeat>();
    const candidates: SeatCandidate[] = [];

    for (const deck of activeDecks) {
      const seats = await getTripSeats(trip.tripId, deck.id);
      const availableSeats = seats.filter((seat) => seat.status === 'available').sort(seatSorter);

      for (const seat of seats) {
        seatLookupById.set(seat.id, seat);
      }

      for (const seat of availableSeats) {
        candidates.push({ seat, deckId: deck.id });
      }
    }

    for (const [passengerKey, tripMap] of Object.entries(assignments)) {
      const seatId = tripMap[trip.tripId];
      if (!seatId) continue;
      const existingSeat = seatLookupById.get(seatId);
      if (existingSeat) {
        labels[passengerKey] = {
          ...(labels[passengerKey] ?? {}),
          [trip.tripId]: existingSeat.cell_id,
        };
      }
    }

    const usedSeatIds = new Set<string>();
    for (const tripMap of Object.values(assignments)) {
      const seatId = tripMap[trip.tripId];
      if (seatId) usedSeatIds.add(seatId);
    }

    for (const passenger of passengersForTrip) {
      let assignedSeat: TripSeat | null = null;

      const attemptReserve = async (preferNonUpper: boolean): Promise<TripSeat | null> => {
        while (true) {
          const candidateIndex = findCandidateIndex(candidates, preferNonUpper);
          if (candidateIndex < 0) return null;

          const [candidate] = candidates.splice(candidateIndex, 1);
          if (!candidate || usedSeatIds.has(candidate.seat.id)) continue;

          try {
            await holdSeats(trip.tripId, [candidate.seat.id], candidate.deckId, sessionId);
            usedSeatIds.add(candidate.seat.id);
            return candidate.seat;
          } catch (error) {
            if (isSeatConflict(error)) continue;
            throw error;
          }
        }
      };

      if (isPwdSenior(passenger.discountType)) {
        assignedSeat = await attemptReserve(true);
        if (!assignedSeat) {
          assignedSeat = await attemptReserve(false);
        }
      } else {
        assignedSeat = await attemptReserve(false);
      }

      if (!assignedSeat) {
        unassigned.push({ passengerKey: passenger.key, tripId: trip.tripId });
        continue;
      }

      assignments[passenger.key] = {
        ...(assignments[passenger.key] ?? {}),
        [trip.tripId]: assignedSeat.id,
      };
      labels[passenger.key] = {
        ...(labels[passenger.key] ?? {}),
        [trip.tripId]: assignedSeat.cell_id,
      };
    }
  }

  const assignedCount = requestedCount - unassigned.length;

  return {
    assignments,
    labels,
    requestedCount,
    assignedCount,
    unassigned,
  };
}
