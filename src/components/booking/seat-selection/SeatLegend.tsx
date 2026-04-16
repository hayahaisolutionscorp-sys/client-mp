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
          <span className="font-medium">Bunk slots:</span>
          {' Upper / Lower'}
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
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden>
      <path d="M1 2v21h2v-2h18v2h2V7c0-2.21-1.79-4-4-4h-9v5H3V2m3.5 0A2.5 2.5 0 0 0 4 4.5A2.5 2.5 0 0 0 6.5 7A2.5 2.5 0 0 0 9 4.5A2.5 2.5 0 0 0 6.5 2M3 11h18v2.56c-.59-.35-1.27-.56-2-.56h-9v5H3m3.5-6A2.5 2.5 0 0 0 4 14.5A2.5 2.5 0 0 0 6.5 17A2.5 2.5 0 0 0 9 14.5A2.5 2.5 0 0 0 6.5 12" />
    </svg>
  );
}
