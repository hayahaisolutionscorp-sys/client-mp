export interface CabinDeck {
  id: number;
  cabin_id: number;
  name: string;
  sort_order: number;
  has_active_layout: boolean;
  has_draft_layout: boolean;
}

export interface DeckLayout {
  id: number;
  cabin_deck_id: number;
  rows: number;
  cols: number;
  status: 'draft' | 'active';
  cells: LayoutCell[];
  rates: LayoutRate[];
  merged: MergedRegion[];
  builder_config?: Record<string, any>;
}

export interface LayoutCell {
  row: number;
  col: number;
  type: string;
  cellId?: string;
  cellText?: string;
  upperId?: string;
  lowerId?: string;
  rateId?: string;
  upperRateId?: string;
  lowerRateId?: string;
}

export interface LayoutRate {
  id: number;
  clientId: string;
  name: string;
  type: 'fixed' | 'percent';
  amount: number;
  color: string;
}

export interface MergedRegion {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  title?: string;
  cellType?: string;
  cell_type?: string;
  color?: string;
}

export interface TripSeat {
  id: string;
  trip_id: string;
  cabin_deck_id: number;
  cell_id: string;
  row_idx: number;
  col_idx: number;
  cell_type: string;
  status: 'available' | 'held' | 'booked' | 'blocked';
  held_until?: string | null;
  booking_trip_passenger_id?: string;
}

export interface SeatAssignment {
  passengerKey: string;
  tripId: string;
  seatInventoryId: string;
  cellId: string;
}

// assignments[passengerKey][tripId] = seatInventoryId
export type AssignmentsMap = Record<string, Record<string, string>>;

// labels[passengerKey][tripId] = cell_id label
export type SeatLabelsMap = Record<string, Record<string, string>>;
