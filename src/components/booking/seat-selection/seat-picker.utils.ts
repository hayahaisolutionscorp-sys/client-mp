const PWD_DISCOUNT_TYPES = new Set(['pwd', 'senior', 'senior citizen']);

const BOOKABLE_TYPES = new Set([
  'seat',
  'disabled-seat',
  'bed',
  'double-deck',
  'bed-upper',
  'bed-lower',
]);

export function isPwdSenior(discountType: string | null | undefined): boolean {
  if (!discountType) return false;
  return PWD_DISCOUNT_TYPES.has(discountType.trim().toLowerCase());
}

export function isBookable(cellType: string): boolean {
  return BOOKABLE_TYPES.has(cellType);
}

export function getStatusColor(
  status: string,
  cellType: string,
  isAssigned: boolean,
  isFocusedPwd: boolean,
  isHeldBySession?: boolean,
): string {
  if (isAssigned)
    return 'bg-blue-100 border-blue-500 text-blue-800 ring-2 ring-blue-400 ring-offset-1 shadow-sm';
  // Seat held by this session but not yet reflected in local state (e.g. first render after reopen)
  if (isHeldBySession)
    return 'bg-blue-50 border-blue-400 text-blue-700 ring-1 ring-blue-300 ring-offset-1 cursor-pointer';

  switch (status) {
    case 'available':
      if (cellType === 'disabled-seat' && isFocusedPwd)
        return 'bg-violet-100 border-violet-400 text-violet-800 ring-2 ring-violet-400 ring-offset-1 hover:bg-violet-200 cursor-pointer';
      return cellType === 'disabled-seat'
        ? 'bg-violet-50 border-violet-300 text-violet-700 hover:bg-violet-100 cursor-pointer'
        : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 cursor-pointer';
    case 'held':
      return 'bg-amber-50 border-amber-300 text-amber-700 opacity-75 cursor-not-allowed';
    case 'booked':
      return 'bg-zinc-100 border-zinc-300 text-zinc-400 cursor-not-allowed line-through';
    case 'blocked':
      return 'bg-zinc-200 opacity-50 cursor-not-allowed';
    default:
      return 'bg-zinc-100 text-zinc-400';
  }
}

export const CELL_STYLE_MAP: Record<string, string> = {
  seat: 'bg-emerald-50 border-emerald-200',
  'disabled-seat': 'bg-violet-50 border-violet-200',
  bed: 'bg-emerald-50 border-emerald-200',
  'double-deck': 'bg-zinc-50 border-zinc-200',
  blocked: 'bg-zinc-100 border-zinc-200 opacity-50',
  divider: 'bg-transparent border-transparent',
  door: 'bg-amber-50 border-amber-300',
  stairs: 'bg-slate-100 border-slate-200',
  restroom: 'bg-purple-50 border-purple-200',
  'emergency-exit': 'bg-red-50 border-red-200',
  empty: 'bg-transparent border-transparent',
};
