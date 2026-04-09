'use client';

import type { LayoutRate } from './seat-picker.types';

interface SeatLegendProps {
  rates: LayoutRate[];
  showPwd?: boolean;
}

export function SeatLegend({ rates, showPwd }: SeatLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 text-[11px] text-zinc-500 border-b bg-zinc-50 shrink-0">
      {/* Status items */}
      <LegendItem swatch="bg-emerald-50 border-emerald-300" label="Available" />
      <LegendItem swatch="bg-blue-100 border-blue-500 ring-1 ring-blue-400" label="Selected" />
      <LegendItem swatch="bg-amber-50 border-amber-300 opacity-75" label="Held" />
      <LegendItem swatch="bg-zinc-100 border-zinc-300" label="Booked" strikethrough />
      {showPwd && (
        <LegendItem swatch="bg-violet-50 border-violet-300" label="Accessible (PWD/Senior)" />
      )}

      {/* Bunk orientation guide */}
      <span className="text-zinc-300 select-none">|</span>
      <span className="flex items-center gap-1 text-[11px] text-zinc-500">
        <BunkSwatch />
        <span>
          <span className="font-medium">↑ Upper</span>
          {' / '}
          <span className="font-medium">↓ Lower</span>
          {' bunk'}
        </span>
      </span>

      {/* Rate tier legend */}
      {rates.length > 0 && (
        <>
          <span className="text-zinc-300 select-none">|</span>
          <span className="text-[10px] uppercase tracking-[.06em] text-zinc-400 font-semibold">Rates:</span>
          {rates.map((r) => (
            <span key={r.id ?? r.clientId} className="flex items-center gap-1">
              <span
                className="w-3 h-3 rounded-sm border border-zinc-200 bg-white inline-block"
                style={{ borderTopColor: r.color, borderTopWidth: 3 }}
              />
              <span>{r.name}</span>
              <span className="font-semibold text-emerald-600">
                {r.type === 'fixed' ? `+₱${r.amount}` : `+${r.amount}%`}
              </span>
            </span>
          ))}
        </>
      )}
    </div>
  );
}

function LegendItem({
  swatch,
  label,
  strikethrough,
}: {
  swatch: string;
  label: string;
  strikethrough?: boolean;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded-sm border inline-block ${swatch}`} />
      <span className={strikethrough ? 'line-through' : ''}>{label}</span>
    </span>
  );
}

/** Mini bunk swatch showing upper/lower split */
function BunkSwatch() {
  return (
    <span
      className="inline-flex flex-col rounded border border-zinc-400 overflow-hidden bg-zinc-600 shrink-0"
      style={{ width: 18, height: 22, gap: 2 }}
    >
      <span className="flex-1 bg-zinc-50 flex items-center justify-center">
        <span className="text-[6px] text-zinc-400">↑</span>
      </span>
      <span className="flex-1 bg-zinc-100 flex items-center justify-center">
        <span className="text-[6px] text-zinc-400">↓</span>
      </span>
    </span>
  );
}
