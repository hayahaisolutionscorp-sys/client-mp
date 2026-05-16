'use client';

import { formatCurrency } from 'helpers/general.helpers';

interface FareLineProps {
  label: string;
  amount: number;
  muted?: boolean;
}

export function FareLine({ label, amount, muted = false }: FareLineProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className={muted ? 'text-gray-400' : 'text-customText'}>{label}</span>
      <span className={muted ? 'text-gray-400' : 'font-semibold text-customText'}>
        {formatCurrency(amount)}
      </span>
    </div>
  );
}
