"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { CalendarIcon } from "lucide-react";
import { useThemeSettings } from "@/hooks/theme-settings";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";

interface ScheduleAndFaresClientPageProps {
  heroVariant: string;
  datePickerVariant: string;
  fareTableVariant: "default" | "striped" | "comfortable" | "high-contrast" | "glassmorphic" | "boarding-pass";
}

const ScheduleAndFares = dynamic(() => import("@/components/schedule-and-fares/ScheduleAndFares"), {
  ssr: false,
});

export function ScheduleAndFaresClientPage({
  heroVariant,
  datePickerVariant,
  fareTableVariant,
}: ScheduleAndFaresClientPageProps) {
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || "#0060df";
  const heroCompact = heroVariant === "compact" || heroVariant === "modern-clean";
  const heroReadable = heroVariant === "readable";
  const pickerMinimal = datePickerVariant === "minimal" || datePickerVariant === "simple";

  const isGlass = heroVariant === "glassmorphic";
  const isBoardingPass = heroVariant === "boarding-pass";

  if (isBoardingPass) {
    const d = new Date();
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(d.getDate()).padStart(2, '0');
    const yr = d.getFullYear();
    return (
      <div
        className="relative container max-w-[1100px] mx-auto px-3 sm:px-6 py-6 sm:py-10"
        style={{ backgroundColor: '#FAF7F0', '--primary-color': primaryColor } as CSSProperties}
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(15,23,42,0.4) 1px, transparent 0)', backgroundSize: '14px 14px' }}
        />
        <div
          className="relative rounded-2xl border-2 overflow-hidden shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25)]"
          style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
        >
          <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-b-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
              ⚓ Schedule · {month} {day}
            </span>
            <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-[0.25em] font-black px-2 py-1 border-2 rotate-[-3deg]"
              style={{ borderColor: primaryColor, color: primaryColor }}>
              ★ Live Fares
            </span>
          </div>

          <div className="px-4 py-5 sm:px-8 sm:py-8">
            <div className="mb-5 flex flex-col items-center text-center gap-2">
              <span
                className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
                style={{ borderColor: primaryColor, color: primaryColor }}
              >
                <CalendarIcon className="inline h-3 w-3 mr-1" style={{ color: primaryColor }} />
                Select Travel Date
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Pick Your Departure</h2>
            </div>

            <ScheduleAndFares
              datePickerVariant={datePickerVariant as "default" | "minimal" | "simple" | "outlined" | "glassmorphic" | "boarding-pass"}
              tableVariant={fareTableVariant}
            />
          </div>

          <div className="flex items-center justify-between px-5 py-3 sm:px-7 border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.18)' }}>
            <div className="flex gap-[2px] items-end h-4 overflow-hidden flex-1 opacity-75 mr-3">
              {Array.from({ length: 40 }).map((_, i) => (
                <span key={i} className="block" style={{ backgroundColor: '#0f172a', width: (i % 6 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + 'px', height: '100%', opacity: i % 5 === 0 ? 0.85 : 0.6 }} />
              ))}
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] opacity-50 whitespace-nowrap">
              SCH-{yr.toString().slice(-2)}
            </span>
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Schedule and fares · Prices may vary based on availability
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative container max-w-[1500px] mx-auto px-4 sm:px-6 ${heroCompact ? "py-3 sm:py-6" : isGlass ? "py-8 sm:py-16" : "py-4 sm:py-8"} ${isGlass ? "overflow-hidden" : ""}`}
      style={{ "--primary-color": primaryColor } as CSSProperties}
    >
      {isGlass && (
        <div 
            className="absolute left-1/4 top-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-[120px] opacity-[0.15]"
            style={{ backgroundColor: primaryColor }}
        />
      )}
      <Card className={`w-full max-w-none ${heroCompact ? "border-slate-200" : ""} ${heroReadable ? "border-slate-300 shadow-sm" : ""} ${isGlass ? "rounded-[3rem] border border-white/40 bg-white/10 backdrop-blur-xl shadow-2xl p-4 sm:p-8" : ""}`}>
        <CardContent className={pickerMinimal ? "p-4 sm:p-6" : isGlass ? "p-2 sm:p-4" : "p-5 sm:p-8"}>
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${pickerMinimal ? "mb-4" : "mb-6"}`}
          >
            <h2
              className={`font-semibold flex items-center gap-2 px-2 ${
                heroReadable ? "text-2xl sm:text-3xl" : heroCompact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
              }`}
            >
              <CalendarIcon className="w-6 h-6" style={{ color: primaryColor }} />
              <span>Select Travel Date</span>
            </h2>
          </div>

          <ScheduleAndFares
            datePickerVariant={datePickerVariant as "default" | "minimal" | "simple" | "outlined" | "glassmorphic"}
            tableVariant={fareTableVariant}
          />
        </CardContent>
        <CardFooter className={isGlass ? "bg-white/20 py-4 sm:py-5 px-6 sm:px-8 text-sm sm:text-base text-slate-700/80 border-t border-white/30 backdrop-blur-md rounded-b-[3rem]" : "bg-slate-50 py-4 sm:py-5 px-6 sm:px-8 text-sm sm:text-base text-muted-foreground border-t"}>
          Schedule and fares for the selected date. Prices may vary based on availability.
        </CardFooter>
      </Card>
    </div>
  );
}
