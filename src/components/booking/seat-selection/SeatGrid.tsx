'use client';

import { useMemo } from 'react';
import { Armchair, BedDouble, Accessibility } from 'lucide-react';
import type { DeckLayout, LayoutCell, LayoutRate, TripSeat } from './seat-picker.types';
import { isBookable, getStatusColor } from './seat-picker.utils';

const CELL_W = 48;
const BUNK_H = 64; // uniform row height — regular cells fill it, bunk cells use full height
const GAP    = 3;

interface SeatGridProps {
  layout: DeckLayout;
  seats: TripSeat[];
  assignedSeatIds: Set<string>;
  focusedPassengerIsPwd: boolean;
  onSeatClick: (seat: TripSeat) => void;
}

function cellKey(row: number, col: number) {
  return `${row}:${col}`;
}

function getCellMergedRegion(row: number, col: number, merged: DeckLayout['merged']) {
  return merged.find(
    (r) => row >= r.startRow && row <= r.endRow && col >= r.startCol && col <= r.endCol,
  );
}

function getMergeStart(row: number, col: number, merged: DeckLayout['merged']) {
  return merged.find((r) => r.startRow === row && r.startCol === col);
}

function getRateColor(rateId: string | undefined, rates: LayoutRate[]): string | undefined {
  if (!rateId) return undefined;
  const rate = rates.find((r) => String(r.id) === rateId || r.clientId === rateId);
  return rate?.color;
}

/** Reliable rate-color strip — a real DOM element, never overridden by border classes */
function RateStrip({ color, height = 4 }: { color?: string; height?: number }) {
  if (!color) return null;
  return (
    <span
      className="w-full shrink-0 block"
      style={{ height, backgroundColor: color }}
    />
  );
}

/** Seat-type icon, sized for the grid cell */
function CellIcon({ type }: { type: string }) {
  if (type === 'disabled-seat') return <Accessibility className="h-3.5 w-3.5 shrink-0" />;
  if (type === 'bed' || type === 'bed-upper' || type === 'bed-lower') return <BedDouble className="h-3.5 w-3.5 shrink-0" />;
  return <Armchair className="h-3.5 w-3.5 shrink-0" />;
}

// ── Structural cell SVG icons (matching CreateVesselMap / SeatMapBuilder) ────

function StairsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 17h4v-4h4V9h4V5h6v2h-4v4h-4v4H9v4H3z" />
    </svg>
  );
}

function RestroomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M7 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z" />
      <path d="M6 8h2v5h2v7H8v-5H6zm8 0h2v12h-2z" />
    </svg>
  );
}

function DoorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 3h10a1 1 0 0 1 1 1v16h2v2H3v-2h3V3zm2 2v15h7V5H8zm5 7.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
    </svg>
  );
}

function EmergencyExitIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M3 5h10v4H3V5zm0 10h10v4H3v-4zm11-2 7-5v3h3v4h-3v3z" />
    </svg>
  );
}

function BlockedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity={0.25} />
      <path d="M5 6l2-2 11 11-2 2L5 6z" />
    </svg>
  );
}

function StructuralIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'stairs': return <StairsIcon className={className} />;
    case 'restroom': return <RestroomIcon className={className} />;
    case 'door': return <DoorIcon className={className} />;
    case 'emergency-exit': return <EmergencyExitIcon className={className} />;
    case 'blocked': return <BlockedIcon className={className} />;
    default: return null;
  }
}

/** Upper bunk SVG — bed elevated, legs visible below */
function UpperBunkSvg() {
  return (
    <svg width="16" height="12" viewBox="0 0 18 14" fill="none" className="shrink-0 opacity-80">
      {/* mattress */}
      <rect x="1" y="1" width="16" height="6" rx="1" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2"/>
      {/* pillow */}
      <rect x="2.5" y="2" width="4" height="3.5" rx="0.5" fill="currentColor" fillOpacity="0.45"/>
      {/* legs hanging down */}
      <line x1="2.5" y1="7" x2="2.5" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="15.5" y1="7" x2="15.5" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      {/* crossbar */}
      <line x1="2.5" y1="10.5" x2="15.5" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5"/>
    </svg>
  );
}

/** Lower bunk SVG — bed at ground level, floor line below */
function LowerBunkSvg() {
  return (
    <svg width="16" height="12" viewBox="0 0 18 14" fill="none" className="shrink-0 opacity-80">
      {/* short legs */}
      <line x1="2.5" y1="1" x2="2.5" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="15.5" y1="1" x2="15.5" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      {/* mattress */}
      <rect x="1" y="5" width="16" height="6" rx="1" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1.2"/>
      {/* pillow */}
      <rect x="2.5" y="6" width="4" height="3.5" rx="0.5" fill="currentColor" fillOpacity="0.45"/>
      {/* floor line */}
      <line x1="0" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4"/>
    </svg>
  );
}

export function SeatGrid({
  layout,
  seats,
  assignedSeatIds,
  focusedPassengerIsPwd,
  onSeatClick,
}: SeatGridProps) {
  const { rows, cols, cells, rates, merged } = layout;

  const inventoryByCellId = useMemo(() => {
    const map = new Map<string, TripSeat>();
    seats.forEach((s) => map.set(s.cell_id, s));
    return map;
  }, [seats]);

  const cellMap = useMemo(() => {
    const map = new Map<string, LayoutCell>();
    cells.forEach((c) => map.set(cellKey(c.row, c.col), c));
    return map;
  }, [cells]);

  return (
    <div className="p-3 select-none">
      {/* Column headers */}
      <div
        className="inline-grid mb-1"
        style={{ gap: GAP, gridTemplateColumns: `22px repeat(${cols}, ${CELL_W}px)` }}
      >
        <div />
        {Array.from({ length: cols }, (_, c) => (
          <div key={c} className="text-center text-[10px] font-medium text-zinc-400">
            {c + 1}
          </div>
        ))}
      </div>

      <div className="flex" style={{ gap: GAP }}>
        {/* Row labels — height matches gridAutoRows */}
        <div className="flex flex-col" style={{ gap: GAP }}>
          {Array.from({ length: rows }, (_, r) => (
            <div
              key={r}
              className="flex items-center justify-center text-[10px] font-medium text-zinc-400"
              style={{ width: 22, height: BUNK_H }}
            >
              {String.fromCharCode(65 + r)}
            </div>
          ))}
        </div>

        {/* Grid — uniform BUNK_H rows so double-deck cells never clip */}
        <div
          className="inline-grid"
          style={{
            gap: GAP,
            gridTemplateColumns: `repeat(${cols}, ${CELL_W}px)`,
            gridAutoRows: `${BUNK_H}px`,
          }}
        >
          {Array.from({ length: rows }, (_, r) =>
            Array.from({ length: cols }, (_, c) => {
              const region = getCellMergedRegion(r, c, merged);
              const mergeStart = getMergeStart(r, c, merged);
              if (region && !mergeStart) {
                return <div key={cellKey(r, c)} style={{ gridColumn: c + 1, gridRow: r + 1 }} />;
              }

              const key = cellKey(r, c);
              const cell = cellMap.get(key);
              const spanRows = mergeStart ? mergeStart.endRow - mergeStart.startRow + 1 : 1;
              const spanCols = mergeStart ? mergeStart.endCol - mergeStart.startCol + 1 : 1;
              const gridStyle =
                mergeStart && (spanRows > 1 || spanCols > 1)
                  ? { gridColumn: `${c + 1} / span ${spanCols}`, gridRow: `${r + 1} / span ${spanRows}` }
                  : { gridColumn: c + 1, gridRow: r + 1 };

              if (!cell || cell.type === 'empty') {
                return <div key={key} style={gridStyle} />;
              }

              // ── Non-bookable structural cell ─────────────────────────────────
              if (!isBookable(cell.type)) {
                const LABELS: Record<string, string> = {
                  restroom: 'WC', stairs: 'Stairs', door: 'Door', 'emergency-exit': 'EXIT',
                };
                const DECOR: Record<string, string> = {
                  blocked: 'bg-zinc-200 border-zinc-300 text-zinc-400',
                  divider: 'bg-zinc-100 border-zinc-200 text-zinc-400',
                  stairs: 'bg-slate-100 border-slate-300 text-slate-500',
                  restroom: 'bg-purple-50 border-purple-200 text-purple-500',
                  door: 'bg-amber-50 border-amber-200 text-amber-600',
                  'emergency-exit': 'bg-red-50 border-red-300 text-red-600',
                };
                const mergedTitle = mergeStart?.title;
                const label = mergedTitle ?? cell.cellText ?? LABELS[cell.type] ?? '';
                const icon = <StructuralIcon type={cell.type} className="h-4 w-4 shrink-0" />;
                const hasStructIcon = ['stairs', 'restroom', 'door', 'emergency-exit', 'blocked'].includes(cell.type);
                return (
                  <div
                    key={key}
                    className={`rounded border flex flex-col items-center justify-center text-center gap-0.5 ${DECOR[cell.type] ?? 'bg-zinc-100 border-zinc-200 text-zinc-400'}`}
                    style={gridStyle}
                    title={mergedTitle ?? cell.type}
                  >
                    {hasStructIcon && icon}
                    {label && (
                      <span className="text-[8px] font-semibold leading-none tracking-wide uppercase px-0.5">
                        {label}
                      </span>
                    )}
                  </div>
                );
              }

              // ── Double-deck bunk ─────────────────────────────────────────────
              if (cell.type === 'double-deck') {
                const upperSeat = cell.upperId ? inventoryByCellId.get(cell.upperId) : null;
                const lowerSeat = cell.lowerId ? inventoryByCellId.get(cell.lowerId) : null;
                const upperAssigned = upperSeat ? assignedSeatIds.has(upperSeat.id) : false;
                const lowerAssigned = lowerSeat ? assignedSeatIds.has(lowerSeat.id) : false;
                // Fallback: if per-half rate not set, use cell-level rateId for both
                const upperRateColor = getRateColor(cell.upperRateId, rates) ?? getRateColor(cell.rateId, rates);
                const lowerRateColor = getRateColor(cell.lowerRateId, rates) ?? getRateColor(cell.rateId, rates);
                const upperLabel = upperSeat?.cell_id ?? cell.upperId ?? '—';
                const lowerLabel = lowerSeat?.cell_id ?? cell.lowerId ?? '—';

                return (
                  <div
                    key={key}
                    className="flex flex-col rounded border border-zinc-400 overflow-hidden bg-zinc-600"
                    style={{ ...gridStyle, gap: 1 }}
                  >
                    {/* ↑ Upper bunk */}
                    <button
                      type="button"
                      disabled={
                        !upperSeat ||
                        upperSeat.status === 'booked' ||
                        upperSeat.status === 'blocked' ||
                        upperSeat.status === 'held'
                      }
                      onClick={() => upperSeat && onSeatClick(upperSeat)}
                      className={`relative flex-1 min-h-0 flex flex-col items-stretch overflow-hidden transition-colors rounded-t ${
                        upperSeat
                          ? getStatusColor(upperSeat.status, 'bed-upper', upperAssigned, false)
                          : 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                      }`}
                      title={`Upper bunk: ${upperLabel}`}
                    >
                      <RateStrip color={upperRateColor} height={3} />
                      <span className="flex-1 flex flex-col items-center justify-center gap-0 px-0.5">
                        <UpperBunkSvg />
                        <span className="text-[9px] font-semibold leading-none">{upperLabel}</span>
                      </span>
                    </button>

                    {/* ↓ Lower bunk */}
                    <button
                      type="button"
                      disabled={
                        !lowerSeat ||
                        lowerSeat.status === 'booked' ||
                        lowerSeat.status === 'blocked' ||
                        lowerSeat.status === 'held'
                      }
                      onClick={() => lowerSeat && onSeatClick(lowerSeat)}
                      className={`relative flex-1 min-h-0 flex flex-col items-stretch overflow-hidden transition-colors rounded-b ${
                        lowerSeat
                          ? getStatusColor(lowerSeat.status, 'bed-lower', lowerAssigned, focusedPassengerIsPwd)
                          : 'bg-zinc-100 border border-zinc-200 text-zinc-400'
                      }`}
                      title={`Lower bunk: ${lowerLabel}`}
                    >
                      <RateStrip color={lowerRateColor} height={3} />
                      <span className="flex-1 flex flex-col items-center justify-center gap-0 px-0.5">
                        <LowerBunkSvg />
                        <span className="text-[9px] font-semibold leading-none">{lowerLabel}</span>
                      </span>
                    </button>
                  </div>
                );
              }

              // ── Regular bookable seat / bed ──────────────────────────────────
              const inventorySeat = cell.cellId ? inventoryByCellId.get(cell.cellId) : null;
              const isAssigned = inventorySeat ? assignedSeatIds.has(inventorySeat.id) : false;
              const isClickable = inventorySeat?.status === 'available' || inventorySeat?.status === 'held';
              const rateColor = getRateColor(cell.rateId, rates);

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!inventorySeat || !isClickable}
                  onClick={() => inventorySeat && isClickable && onSeatClick(inventorySeat)}
                  className={`rounded flex flex-col items-stretch overflow-hidden transition-colors border ${
                    inventorySeat
                      ? getStatusColor(inventorySeat.status, cell.type, isAssigned, focusedPassengerIsPwd)
                      : 'bg-zinc-50 text-zinc-300 cursor-not-allowed border-zinc-200'
                  }`}
                  style={gridStyle}
                  title={cell.cellId ?? cell.type}
                >
                  <RateStrip color={rateColor} />
                  <span className="flex-1 flex flex-col items-center justify-center gap-0.5 px-0.5">
                    <CellIcon type={cell.type} />
                    <span className="text-[11px] font-semibold leading-none">{cell.cellId ?? '—'}</span>
                  </span>
                </button>
              );
            }),
          ).flat()}
        </div>
      </div>
    </div>
  );
}
