import type { ChargeLine, FareLine, NormalizedPricing } from '@/types/pricing/contract';
import type { PricingResponse, PricingTrip } from '@/types/booking/pricing';

type PricingData = PricingResponse['data'];

export function normalizePricing(data: PricingData | null | undefined): NormalizedPricing | null {
  if (!data?.trips?.length) return null;

  const fareLines: FareLine[] = [];
  const chargeMap = new Map<string, ChargeLine>();
  const taxMap = new Map<string, ChargeLine>();

  let basePassengers = 0;
  let baseCargo = 0;

  for (const trip of data.trips) {
    for (const p of trip.passengerPrices ?? []) {
      fareLines.push({
        label: p.passengerType,
        amount: p.baseFare,
        tripId: trip.tripId,
        entityType: 'passenger',
        entityIndex: p.index,
      });
      basePassengers += p.baseFare;
    }

    for (const c of trip.cargoPrices ?? []) {
      fareLines.push({
        label: c.cargoClassCode || c.cargoType,
        amount: c.baseFare,
        tripId: trip.tripId,
        entityType: c.cargoType === 'rolling' ? 'rolling' : 'loose',
        entityIndex: c.index,
      });
      baseCargo += c.baseFare;
    }

    for (const charge of trip.charges ?? []) {
      if (!charge.showOnReceipt || charge.amount === 0) continue;
      const map = charge.category === 'TAX' ? taxMap : chargeMap;
      const key = `${charge.chargeCode}:${charge.basis}:${charge.isInclusive ? '1' : '0'}`;
      const existing = map.get(key);
      if (existing) {
        existing.amount += charge.amount;
      } else {
        map.set(key, { ...charge });
      }
    }
  }

  const chargeLines = Array.from(chargeMap.values()).filter((c) => c.amount !== 0);
  const taxLines = Array.from(taxMap.values()).filter((c) => c.amount !== 0);

  const charges = chargeLines.filter((c) => !c.isInclusive).reduce((s, c) => s + c.amount, 0);
  const taxes = taxLines.filter((c) => !c.isInclusive).reduce((s, c) => s + c.amount, 0);
  const baseTotal = basePassengers + baseCargo;

  return {
    fareLines,
    chargeLines,
    taxLines,
    totals: {
      basePassengers,
      baseCargo,
      baseTotal,
      charges,
      taxes,
      grand: data.grandTotal ?? baseTotal + charges + taxes,
    },
  };
}
