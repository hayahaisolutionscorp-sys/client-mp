'use client';

import type { ChargeLine } from '@/types/pricing/contract';
import { FareLine } from './FareLine';

interface ChargeListProps {
  charges: ChargeLine[];
  emptyLabel?: string;
}

export function ChargeList({ charges, emptyLabel }: ChargeListProps) {
  if (charges.length === 0) {
    return emptyLabel ? (
      <p className="text-xs text-gray-400">{emptyLabel}</p>
    ) : null;
  }

  return (
    <div className="space-y-1">
      {charges.map((charge) => (
        <div key={`${charge.chargeCode}-${charge.ruleId}`} className="space-y-0.5">
          <FareLine
            label={charge.chargeName}
            amount={charge.amount}
            muted={charge.isInclusive}
          />
          {charge.isInclusive && (
            <p className="text-right text-[10px] text-green-600 font-medium">Inclusive</p>
          )}
        </div>
      ))}
    </div>
  );
}
