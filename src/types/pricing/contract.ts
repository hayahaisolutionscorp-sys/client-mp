export interface ChargeLine {
  ruleId: string;
  chargeCode: string;
  chargeName: string;
  category: string;
  amount: number;
  isInclusive: boolean;
  calcType: string;
  basis: string;
  showOnReceipt: boolean;
}

export interface FareLine {
  label: string;
  amount: number;
  tripId: string;
  entityType: 'passenger' | 'rolling' | 'loose';
  entityIndex: number;
}

export interface NormalizedPricing {
  fareLines: FareLine[];
  chargeLines: ChargeLine[];
  taxLines: ChargeLine[];
  totals: {
    basePassengers: number;
    baseCargo: number;
    baseTotal: number;
    charges: number;
    taxes: number;
    grand: number;
  };
}
