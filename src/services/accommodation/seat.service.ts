import axiosInstance from '@/services/core/axios';
import { SEATMAP_PUBLIC_API } from 'constants/api';
import type {
  CabinDeck,
  DeckLayout,
  TripSeat,
} from '@/components/booking/seat-selection/seat-picker.types';

const BASE = SEATMAP_PUBLIC_API;

// Public endpoints (no auth required)

export async function getCabinDecks(cabinId: number): Promise<CabinDeck[]> {
  const { data } = await axiosInstance.get(`${BASE}/cabins/${cabinId}/decks`);
  return (data.data as any[]).map((d) => ({
    ...d,
    has_active_layout: d.active_layout_id != null,
    has_draft_layout: d.draft_layout_id != null,
  }));
}

export async function getDeckLayout(deckId: number): Promise<DeckLayout | null> {
  const { data } = await axiosInstance.get(`${BASE}/cabin-decks/${deckId}/layout`);
  const raw = data.data;
  if (!raw) return null;
  return {
    ...raw,
    cells: (raw.cells ?? []).map((c: any) => ({
      row: c.row_idx,
      col: c.col_idx,
      type: c.cell_type,
      cellId: c.cell_id ?? undefined,
      cellText: c.cell_text ?? undefined,
      upperId: c.upper_id ?? undefined,
      lowerId: c.lower_id ?? undefined,
      rateId: c.rate_id != null ? String(c.rate_id) : undefined,
      upperRateId: c.upper_rate_id != null ? String(c.upper_rate_id) : undefined,
      lowerRateId: c.lower_rate_id != null ? String(c.lower_rate_id) : undefined,
    })),
    rates: (raw.rates ?? []).map((r: any) => ({
      id: r.id,
      clientId: String(r.id),
      name: r.name,
      type: r.type,
      amount: Number(r.amount),
      color: r.color,
    })),
    merged: (
      Array.isArray(raw.merged)
        ? raw.merged
        : Array.isArray(raw.merged_regions)
          ? raw.merged_regions
          : []
    ).map((m: any) => ({
      startRow: m.start_row ?? m.startRow,
      startCol: m.start_col ?? m.startCol,
      endRow: m.end_row ?? m.endRow,
      endCol: m.end_col ?? m.endCol,
      title: m.title,
      cellType: m.cell_type ?? m.cellType,
      color: m.color ?? undefined,
    })),
  };
}

export async function getTripSeats(tripId: string, cabinDeckId: number): Promise<TripSeat[]> {
  const { data } = await axiosInstance.get(`${BASE}/trips/${tripId}/seats`, {
    params: { cabin_deck_id: cabinDeckId },
  });
  return (data.data as any[]).map((s) => ({
    id: s.id,
    trip_id: s.trip_id,
    cabin_deck_id: s.cabin_deck_id,
    cell_id: s.cell_id,
    row_idx: s.row_idx,
    col_idx: s.col_idx,
    cell_type: s.cell_type,
    status: s.status,
    held_until: s.held_until ?? null,
    booking_trip_passenger_id: s.booking_trip_passenger_id ?? undefined,
  }));
}

// Authenticated endpoints (JWT required — axios handles token refresh via interceptors)

export async function holdSeats(
  tripId: string,
  seatIds: string[],
  cabinDeckId: number,
): Promise<void> {
  try {
    await axiosInstance.post(`${BASE}/trips/${tripId}/seats/hold`, {
      seatIds,
      cabinDeckId,
    });
  } catch (err: any) {
    if (err.response?.status === 409) throw new Error('SEAT_CONFLICT');
    throw err;
  }
}

export async function releaseSeats(tripId: string, seatIds: string[]): Promise<void> {
  await axiosInstance.delete(`${BASE}/trips/${tripId}/seats/hold`, {
    data: { seatIds },
  });
}
