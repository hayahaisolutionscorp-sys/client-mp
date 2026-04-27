import { Ship } from 'lucide-react';
import Image from 'next/image';
import { useThemeSettings } from '@/hooks/theme-settings';

export interface ScheduleItem {
  time: string;
  route: string;
  ship: string;
  fare: string;
  logoUrl?: string;
}

interface ScheduleItemProps {
  item: ScheduleItem;
  rowIndex?: number;
  striped?: boolean;
  rowVariant?: "default" | "striped" | "comfortable" | "high-contrast" | "glassmorphic" | "boarding-pass";
}


const ScheduleItem = ({
  item,
  rowIndex = 0,
  striped = false,
  rowVariant = "default",
}: ScheduleItemProps) => {
  const themeSettings = useThemeSettings();
  const primaryColor = themeSettings?.primaryColor || '#0369a1';
  const isComfortable = rowVariant === "comfortable";
  const isHighContrast = rowVariant === "high-contrast";
  const isGlass = rowVariant === "glassmorphic";
  const isBoardingPass = rowVariant === "boarding-pass";
  const stripedClass = striped && rowIndex % 2 === 1 && !isGlass && !isBoardingPass ? "bg-slate-50/80" : "";

  if (isBoardingPass) {
    return (
      <div className="p-2 sm:p-3">
        <div
          className="relative rounded-xl border-2 overflow-hidden transition-all hover:-translate-y-[1px] hover:shadow-[0_10px_20px_-10px_rgba(15,23,42,0.22)]"
          style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
        >
          <div className="grid grid-cols-[auto_1fr] sm:grid-cols-[auto_1fr_auto]">
            {/* Left stub: row number + time */}
            <div
              className="flex flex-col items-center justify-center px-4 py-4 border-r-2 border-dashed font-mono"
              style={{ borderColor: 'rgba(15,23,42,0.2)', backgroundColor: primaryColor + '0d' }}
            >
              <span className="text-[9px] font-black uppercase tracking-[0.25em] opacity-60">TRIP</span>
              <span className="text-lg font-black" style={{ color: primaryColor }}>
                {String(rowIndex + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Body */}
            <div className="px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] font-black opacity-70">
                <span>{item.time.split(' - ')[0]}</span>
                <span>·</span>
                <span>{item.time.split(' - ')[1]?.replace(/[()]/g, '')}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-mono text-base sm:text-lg font-black">{item.route.split(' → ')[0]}</span>
                <span className="font-mono text-sm opacity-60">→</span>
                <span className="font-mono text-base sm:text-lg font-black">{item.route.split(' → ')[1]}</span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
                {item.logoUrl ? (
                  <Image src={item.logoUrl} alt="Shipping Line Logo" width={60} height={30} className="h-6 w-auto object-contain mt-2" />
                ) : (
                  <Ship className="h-4 w-4 mt-2" style={{ color: themeSettings?.accent || '#0ea5e9' }} />
                )}
                <span className="mt-2 text-sm font-medium">{item.ship}</span>
              </div>
            </div>

            {/* Right fare stub (stacks below on mobile) */}
            <div
              className="col-span-2 sm:col-span-1 px-4 py-3 sm:px-5 sm:py-4 border-t-2 sm:border-t-0 sm:border-l-2 border-dashed flex flex-col items-stretch sm:items-end justify-center gap-1"
              style={{ borderColor: 'rgba(15,23,42,0.2)' }}
            >
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] opacity-60">Fare</span>
              {item.fare === 'No fares available' ? (
                <span className="font-mono text-xs italic opacity-60">No fares available</span>
              ) : (
                <div className="grid gap-0.5 sm:justify-items-end">
                  {item.fare.split(', ').map((fare, idx) => (
                    <div key={idx} className="flex items-baseline gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">{fare.split(': ')[0]}</span>
                      <span className="font-mono text-sm font-black" style={{ color: primaryColor }}>{fare.split(': ')[1]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center transition-colors gap-4 sm:gap-3 ${
        isComfortable || isGlass ? "p-5 sm:p-7" : "p-4 sm:p-6"
      } ${
        isGlass
          ? "hover:bg-white/30 text-slate-800"
        : isHighContrast
          ? "bg-white hover:bg-slate-100"
          : "hover:bg-slate-50"
      } ${stripedClass}`}
    >
      {/* Date & Time */}
      <div className="space-y-2">
        <div className={`font-medium flex items-center justify-between sm:justify-start gap-2 ${isComfortable || isGlass ? "text-lg sm:text-xl" : "text-base sm:text-lg"} ${isGlass ? "text-slate-800" : ""}`}>
          <span className={`sm:hidden text-base ${isHighContrast || isGlass ? "text-slate-800" : "text-slate-600"}`}>Date & Time:</span>
          {item.time.split(' - ')[1].replace(/[()]/g, '')}
        </div>
        <div className={`text-base ${isHighContrast ? "text-slate-700" : isGlass ? "text-slate-600" : "text-muted-foreground"}`}>{item.time.split(' - ')[0]}</div>
      </div>

      {/* Route */}
      <div className="flex items-start sm:items-center gap-3">
        <div className="flex-1">
          <span className={`sm:hidden text-base mb-1 block ${isHighContrast || isGlass ? "text-slate-800" : "text-slate-600"}`}>Route:</span>
          <div className="flex flex-col gap-1">
            <span className={`${isComfortable || isGlass ? "text-lg sm:text-xl" : "text-base sm:text-lg"} font-medium`}>{item.route.split(' → ')[0]}</span>
            <span className={`text-base ${isHighContrast ? "text-slate-700" : isGlass ? "text-slate-600" : "text-muted-foreground"}`}>to</span>
            <span className={`${isComfortable || isGlass ? "text-lg sm:text-xl" : "text-base sm:text-lg"} font-medium`}>{item.route.split(' → ')[1]}</span>
          </div>
        </div>
      </div>

      {/* Ship */}
      <div className="flex items-center gap-3">
        <span className={`sm:hidden text-base ${isHighContrast || isGlass ? "text-slate-800" : "text-slate-600"}`}>Ship:</span>
        {item.logoUrl ? (
          <Image
            src={item.logoUrl}
            alt="Shipping Line Logo"
            width={80}
            height={40}
            className="h-8 w-auto object-contain drop-shadow-sm"
          />
        ) : (
          <Ship className="h-5 w-5" style={{ color: themeSettings?.accent || '#0ea5e9' }} />
        )}
        <div className={`${isComfortable || isGlass ? "text-lg sm:text-xl" : "text-base sm:text-lg"} font-medium`}>{item.ship}</div>
      </div>

      {/* Fare */}
      <div className="space-y-3 sm:text-right">
        <span className={`sm:hidden text-base block ${isHighContrast || isGlass ? "text-slate-800" : "text-slate-600"}`}>Fare:</span>
        {item.fare === 'No fares available' ? (
          <span className={`text-base italic ${isGlass ? "text-slate-600" : "text-muted-foreground"}`}>No fares available</span>
        ) : (
          <div className="grid gap-2 sm:justify-items-end">
            {item.fare.split(', ').map((fare, idx) => (
              <div
                key={idx}
                className="flex flex-row sm:flex-col gap-2 sm:gap-1 items-baseline justify-between sm:items-end"
              >
                <div className={`text-sm sm:text-base ${isGlass ? "text-slate-600" : "text-muted-foreground"}`}>{fare.split(': ')[0]}</div>
                <div
                  className="text-base sm:text-lg font-bold"
                  style={{ color: themeSettings?.primaryColor || '#0369a1' }}
                >
                  {fare.split(': ')[1]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleItem;
