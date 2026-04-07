export interface SelectedSegment {
  segmentId: number | string;
  shippingLineId?: number;
  cabinId: number;
  cabinTypeId: number;
  cabinType: string;
  cabinFare: number;
  departureDateIso: string;
}

export interface SelectedTrip {
  tripId: number | string;
  shippingLineId?: number;
  totalFare: number;
  segmentSelections: SelectedSegment[];

  // Keep these for backward compatibility/ease of access for direct trips (optional, or just use helper)
  // For direct trips, these will populate from the 0th segment
  cabinId?: number;
  cabinTypeId?: number;
  cabinType?: string;
  cabinFare?: number;
  departureDateIso?: string;
}
