'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Armchair, BedDouble, Accessibility } from 'lucide-react';
import type { DeckLayout, LayoutCell, LayoutRate, TripSeat } from './seat-picker.types';
import { isBookable, getStatusColor } from './seat-picker.utils';

const CELL_SIZE = 56; // square cells, matches CreateVesselMap/SeatMapBuilder
const GAP    = 3;
const WL_RADIUS_LOCK_STYLE = { '--wl-br': '0.375rem' } as CSSProperties;

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

function BunkBedIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M1 2v21h2v-2h18v2h2V7c0-2.21-1.79-4-4-4h-9v5H3V2m3.5 0A2.5 2.5 0 0 0 4 4.5A2.5 2.5 0 0 0 6.5 7A2.5 2.5 0 0 0 9 4.5A2.5 2.5 0 0 0 6.5 2M3 11h18v2.56c-.59-.35-1.27-.56-2-.56h-9v5H3m3.5-6A2.5 2.5 0 0 0 4 14.5A2.5 2.5 0 0 0 6.5 17A2.5 2.5 0 0 0 9 14.5A2.5 2.5 0 0 0 6.5 12" />
    </svg>
  );
}


// ── Double-Deck Cell with Badge + Hover Popover ───────────────────────────────

interface DoubleDeckCellProps {
  cell: LayoutCell;
  upperSeat: TripSeat | null;
  lowerSeat: TripSeat | null;
  upperAssigned: boolean;
  lowerAssigned: boolean;
  focusedPassengerIsPwd: boolean;
  onSeatClick: (seat: TripSeat) => void;
  rates: LayoutRate[];
  cellId: string;
  popoverId: string;
  activePopoverId: string | null;
  setActivePopoverId: (value: string | null | ((prev: string | null) => string | null)) => void;
}

function DoubleDeckCell({
  cell,
  upperSeat,
  lowerSeat,
  upperAssigned,
  lowerAssigned,
  focusedPassengerIsPwd,
  onSeatClick,
  rates,
  cellId,
  popoverId,
  activePopoverId,
  setActivePopoverId,
}: DoubleDeckCellProps) {
  const popoverOpen = activePopoverId === popoverId;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const upperStatus = upperSeat?.status ?? 'none';
  const lowerStatus = lowerSeat?.status ?? 'none';

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openPopover = () => {
    clearCloseTimer();
    setActivePopoverId(popoverId);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(
      () => setActivePopoverId((prev) => (prev === popoverId ? null : prev)),
      120,
    );
  };

  useEffect(() => {
    if (!popoverOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || !wrapRef.current?.contains(target)) {
        setActivePopoverId((prev) => (prev === popoverId ? null : prev));
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePopoverId((prev) => (prev === popoverId ? null : prev));
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [popoverOpen, popoverId, setActivePopoverId]);

  useEffect(
    () => () => {
      clearCloseTimer();
    },
    [],
  );

  // Combined visual state — same logic as TMS TmsBunkCell
  let visualState: 'selected' | 'both-available' | 'both-booked' | 'partial-held' | 'partial' = 'both-available';
  let overlayPosition: 'top' | 'bottom' | null = null;

  if (upperAssigned || lowerAssigned) {
    visualState = 'selected';
  } else if (['booked', 'blocked'].includes(upperStatus) && ['booked', 'blocked'].includes(lowerStatus)) {
    visualState = 'both-booked';
  } else if (upperStatus === 'held' || lowerStatus === 'held') {
    visualState = 'partial-held';
  } else if (upperStatus === 'available' && ['booked', 'blocked'].includes(lowerStatus)) {
    visualState = 'partial'; overlayPosition = 'bottom';
  } else if (['booked', 'blocked'].includes(upperStatus) && lowerStatus === 'available') {
    visualState = 'partial'; overlayPosition = 'top';
  }

  const stateColors: Record<string, { bg: string; border: string; badgeBg: string }> = {
    'both-available': { bg: 'bg-[#E6F1FB]', border: 'border-[#185FA5]', badgeBg: '#185FA5' },
    'both-booked':    { bg: 'bg-[#D3D1C7]', border: 'border-[#5F5E5A]', badgeBg: '#5F5E5A' },
    'partial':        { bg: 'bg-[#E6F1FB]', border: 'border-[#185FA5]', badgeBg: '#185FA5' },
    'partial-held':   { bg: 'bg-amber-50',  border: 'border-amber-300',  badgeBg: '#B45309' },
    'selected':       { bg: 'bg-[#378ADD]', border: 'border-[#0C447C]',  badgeBg: '#0C447C' },
  };

  const dc = stateColors[visualState];
  const rateColor = getRateColor(cell.upperRateId, rates) ?? getRateColor(cell.lowerRateId, rates) ?? getRateColor(cell.rateId, rates);

  return (
    <div ref={wrapRef} className="relative w-full h-full">
      <button
        type="button"
        onClick={() => {
          clearCloseTimer();
          setActivePopoverId((prev) => (prev === popoverId ? null : popoverId));
        }}
        onPointerEnter={openPopover}
        onPointerLeave={scheduleClose}
        onFocus={openPopover}
        onBlur={scheduleClose}
        disabled={visualState === 'both-booked'}
        className={`w-full h-full rounded-md border flex flex-col items-stretch overflow-hidden relative transition-opacity ${
          visualState === 'both-booked' ? 'cursor-not-allowed' : 'cursor-pointer'
        } ${dc.bg} ${dc.border}`}
        title={`Bunk ${cellId}`}
      >
        {/* Rate strip — flush top, same as regular cells */}
        {rateColor && (
          <span className="w-full shrink-0 block" style={{ height: 4, backgroundColor: rateColor }} />
        )}
        {/* Partial overlay */}
        {overlayPosition && (
          <div
            className="absolute left-0 right-0 pointer-events-none"
            style={{
              height: '50%',
              top: overlayPosition === 'top' ? 0 : 'auto',
              bottom: overlayPosition === 'bottom' ? 0 : 'auto',
              backgroundColor: '#D3D1C7',
              opacity: 0.55,
              borderRadius: overlayPosition === 'top' ? '6px 6px 0 0' : '0 0 6px 6px',
            }}
          />
        )}
        {/* 2× badge */}
        <span
          className="absolute top-1 right-1 text-[7px] font-bold px-1 py-0.5 rounded text-white leading-tight z-10"
          style={{ backgroundColor: dc.badgeBg }}
        >
          2×
        </span>
        {/* Centered content */}
        <span className="flex-1 flex flex-col items-center justify-center gap-1 relative z-10">
          <BunkBedIcon className="h-3.5 w-3.5 shrink-0 opacity-80" />
          <span className="text-[11px] font-semibold leading-none">{cellId}</span>
        </span>
      </button>

      {/* Popover */}
      {popoverOpen && (
        <div
          className="absolute bottom-[calc(100%-2px)] left-1/2 -translate-x-1/2 w-44 bg-white border border-zinc-300 rounded-lg shadow-lg p-2 z-50"
          onPointerEnter={openPopover}
          onPointerLeave={scheduleClose}
        >
          {/* Hover bridge to prevent premature close while moving from bunk to popover */}
          <div
            aria-hidden
            className="absolute left-1/2 -translate-x-1/2 top-full h-4 w-44 bg-transparent"
          />
          <div
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #d4d4d8',
            }}
          />
          <div className="text-[9px] font-semibold text-zinc-600 px-1.5 pb-1.5 border-b border-zinc-200 mb-1 uppercase tracking-wide">
            {visualState === 'both-booked' ? `Bunk ${cellId} — fully booked` : `Bunk ${cellId} — select slot`}
          </div>

          {/* Upper slot row */}
          <div
            role="button"
            onClick={() => {
              if (!upperSeat) return;
              const canDeselect = upperAssigned;
              const canSelect = upperStatus === 'available' && !focusedPassengerIsPwd;
              if (canDeselect || canSelect) {
                onSeatClick(upperSeat);
                setActivePopoverId((prev) => (prev === popoverId ? null : prev));
              }
            }}
            className={`grid grid-cols-[8px_minmax(0,1fr)_auto_auto] items-center gap-2 px-1.5 py-1 rounded text-[11px] mb-0.5 transition-colors ${
              upperAssigned ? 'bg-[#E6F1FB] hover:bg-[#D6E8F8] cursor-pointer' :
              upperStatus === 'available' && !focusedPassengerIsPwd ? 'hover:bg-zinc-100 cursor-pointer' :
              'opacity-50 cursor-not-allowed'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: upperAssigned ? '#185FA5' : upperStatus === 'available' ? '#1D9E75' : upperStatus === 'held' ? '#BA7517' : '#888780',
              }}
            />
            <span className={`font-medium whitespace-nowrap ${upperAssigned || (upperStatus === 'available' && !focusedPassengerIsPwd) ? 'text-zinc-800' : 'text-zinc-500'}`}>
              Upper
            </span>
            <span className="text-[10px] font-mono text-zinc-600 whitespace-nowrap">{upperSeat?.cell_id ?? '—'}</span>
            {upperAssigned ? (
              <span className="text-[11px] font-bold text-[#185FA5] whitespace-nowrap">✓</span>
            ) : focusedPassengerIsPwd && upperStatus === 'available' ? (
              <span className="text-[9px] text-zinc-500 whitespace-nowrap">ineligible</span>
            ) : upperStatus === 'held' ? (
              <span className="text-[9px] text-amber-700 whitespace-nowrap">reserved</span>
            ) : ['booked', 'blocked'].includes(upperStatus) ? (
              <span className="text-[9px] text-zinc-500 whitespace-nowrap">taken</span>
            ) : (
              <span className="text-[12px] text-zinc-400 whitespace-nowrap">›</span>
            )}
          </div>

          {/* Lower slot row */}
          <div
            role="button"
            onClick={() => {
              if (!lowerSeat) return;
              const canDeselect = lowerAssigned;
              const canSelect = lowerStatus === 'available';
              if (canDeselect || canSelect) {
                onSeatClick(lowerSeat);
                setActivePopoverId((prev) => (prev === popoverId ? null : prev));
              }
            }}
            className={`grid grid-cols-[8px_minmax(0,1fr)_auto_auto] items-center gap-2 px-1.5 py-1 rounded text-[11px] transition-colors ${
              lowerAssigned ? 'bg-[#E6F1FB] hover:bg-[#D6E8F8] cursor-pointer' :
              lowerStatus === 'available' ? 'hover:bg-zinc-100 cursor-pointer' :
              'opacity-50 cursor-not-allowed'
            }`}
          >
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: lowerAssigned ? '#185FA5' : lowerStatus === 'available' ? '#1D9E75' : lowerStatus === 'held' ? '#BA7517' : '#888780',
              }}
            />
            <span className={`font-medium whitespace-nowrap ${lowerAssigned || lowerStatus === 'available' ? 'text-zinc-800' : 'text-zinc-500'}`}>
              Lower
            </span>
            <span className="text-[10px] font-mono text-zinc-600 whitespace-nowrap">{lowerSeat?.cell_id ?? '—'}</span>
            {lowerAssigned ? (
              <span className="text-[11px] font-bold text-[#185FA5] whitespace-nowrap">✓</span>
            ) : lowerStatus === 'held' ? (
              <span className="text-[9px] text-amber-700 whitespace-nowrap">reserved</span>
            ) : ['booked', 'blocked'].includes(lowerStatus) ? (
              <span className="text-[9px] text-zinc-500 whitespace-nowrap">taken</span>
            ) : (
              <span className="text-[12px] text-zinc-400 whitespace-nowrap">›</span>
            )}
          </div>
        </div>
      )}
    </div>
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
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);

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
    <div className="p-3 select-none" style={WL_RADIUS_LOCK_STYLE}>
      {/* Grid — square cells with overflow:visible for popovers */}
      <div
        className="inline-grid overflow-visible"
        style={{
          gap: GAP,
          gridTemplateColumns: `repeat(${cols}, ${CELL_SIZE}px)`,
          gridAutoRows: `${CELL_SIZE}px`,
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
                const mergedColor = mergeStart?.color;
                const label = mergedTitle ?? cell.cellText ?? LABELS[cell.type] ?? '';
                const icon = <StructuralIcon type={cell.type} className="h-4 w-4 shrink-0" />;
                const hasStructIcon = ['stairs', 'restroom', 'door', 'emergency-exit', 'blocked'].includes(cell.type);
                return (
                  <div
                    key={key}
                    className={`rounded-md border flex flex-col items-center justify-center text-center gap-0.5 ${DECOR[cell.type] ?? 'bg-zinc-100 border-zinc-200 text-zinc-400'}`}
                    style={{
                      ...gridStyle,
                      ...(mergedColor
                        ? {
                            backgroundColor: `${mergedColor}1A`,
                            borderColor: mergedColor,
                            color: mergedColor,
                          }
                        : {}),
                    }}
                    title={mergedTitle ?? cell.type}
                  >
                    {hasStructIcon && icon}
                    {label && (
                      <span
                        className="text-[8px] font-semibold tracking-wide uppercase px-1 leading-tight text-center w-full"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          wordBreak: 'break-word',
                        }}
                      >
                        {label}
                      </span>
                    )}
                  </div>
                );
              }

              // ── Double-deck bunk — badge + hover popover ─────────────────────
              if (cell.type === 'double-deck') {
                const upperSeat = cell.upperId ? inventoryByCellId.get(cell.upperId) : null;
                const lowerSeat = cell.lowerId ? inventoryByCellId.get(cell.lowerId) : null;
                const upperAssigned = upperSeat ? assignedSeatIds.has(upperSeat.id) : false;
                const lowerAssigned = lowerSeat ? assignedSeatIds.has(lowerSeat.id) : false;
                const ddCellId = cell.cellId ?? cell.upperId?.replace(/-U$/, '') ?? '—';

                return (
                  <div key={key} style={{ ...gridStyle, position: 'relative', overflow: 'visible' }}>
                    <DoubleDeckCell
                      cell={cell}
                      upperSeat={upperSeat ?? null}
                      lowerSeat={lowerSeat ?? null}
                      upperAssigned={upperAssigned}
                      lowerAssigned={lowerAssigned}
                      focusedPassengerIsPwd={focusedPassengerIsPwd}
                      onSeatClick={onSeatClick}
                      rates={rates}
                      cellId={ddCellId}
                      popoverId={`bunk-${r}-${c}`}
                      activePopoverId={activePopoverId}
                      setActivePopoverId={setActivePopoverId}
                    />
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
                  className={`rounded-md flex flex-col items-stretch overflow-hidden transition-colors border ${
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
  );
}
