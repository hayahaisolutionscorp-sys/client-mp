"use client";

import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { isValid, format, startOfMonth, setMonth, setYear } from "date-fns";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

interface DatePickerProps {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

const DatePicker = ({
  date,
  setDate,
  placeholder = "Select Date",
  minDate = new Date("1900-01-01"),
  maxDate = new Date("2100-12-31"),
  disabled = false,
  className,
}: DatePickerProps) => {
  const themeSettings = useThemeSettings();
  const primaryRgb = hexToRgb(themeSettings?.primary || "#8C1F21");

  const [viewingMonth, setViewingMonth] = React.useState<Date>(
    date && isValid(date) ? date : new Date()
  );
  const [showMonthGrid, setShowMonthGrid] = React.useState(false);
  const [yearInput, setYearInput] = React.useState(String(viewingMonth.getFullYear()));

  // Sync viewing month when date prop changes
  React.useEffect(() => {
    if (date && isValid(date)) {
      setViewingMonth(date);
      setYearInput(String(date.getFullYear()));
    }
  }, [date]);

  const displayDate = date && isValid(date) ? format(date, "yyyy-MM-dd") : placeholder;

  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYearInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= minDate.getFullYear() && parsed <= maxDate.getFullYear()) {
      setViewingMonth(prev => setYear(prev, parsed));
      if (date && isValid(date)) {
        const newDate = setYear(date, parsed);
        if (isValid(newDate)) {
          setDate(newDate);
        }
      }
    }
  };

  const handleYearBlur = () => {
    const parsed = parseInt(yearInput, 10);
    const clamped = isNaN(parsed) ? viewingMonth.getFullYear() : Math.max(minDate.getFullYear(), Math.min(maxDate.getFullYear(), parsed));
    setYearInput(String(clamped));
    setViewingMonth(prev => setYear(prev, clamped));
    if (date && isValid(date)) {
      const newDate = setYear(date, clamped);
      if (isValid(newDate)) {
        setDate(newDate);
      }
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newMonth = startOfMonth(setMonth(viewingMonth, monthIndex));
    setViewingMonth(newMonth);
    setShowMonthGrid(false);
    if (date && isValid(date)) {
      const newDate = setMonth(date, monthIndex);
      if (isValid(newDate)) {
        setDate(newDate);
      }
    }
  };

  const navigateMonth = (delta: number) => {
    setViewingMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      setYearInput(String(d.getFullYear()));
      return d;
    });
  };

  return (
    <Popover onOpenChange={(open) => { if (open && !disabled) setShowMonthGrid(false); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          data-template-ignore="true"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-black shadow-none focus:outline-none focus:ring-2 focus:ring-[rgba(var(--primary-color),1)]",
            (!date || !isValid(date)) ? "text-gray-500" : "text-black",
            disabled && "cursor-not-allowed bg-white opacity-50",
            className
          )}
          style={{ "--primary-color": primaryRgb } as React.CSSProperties}
        >
          <span>{displayDate}</span>
          <CalendarIcon className="h-5 w-5 text-black" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto border border-gray-200 bg-white p-0 text-black shadow-none" align="start">
        <div className="space-y-3 select-none p-3 text-black">
          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-black opacity-60 transition-colors hover:bg-[rgba(var(--primary-color),0.08)] hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 flex-1 justify-center">
              <button
                type="button"
                onClick={() => setShowMonthGrid(prev => !prev)}
                className={cn(
                  "min-w-[90px] rounded-md px-2 py-1 text-sm font-semibold text-black transition-colors",
                  showMonthGrid ? "border border-gray-300 bg-white" : "hover:bg-[rgba(var(--primary-color),0.08)]"
                )}
              >
                {MONTHS[viewingMonth.getMonth()]}
              </button>

              <input
                type="number"
                value={yearInput}
                onChange={handleYearInput}
                onBlur={handleYearBlur}
                className="w-14 border-0 border-b-2 border-gray-200 bg-transparent py-0.5 text-center text-sm font-semibold text-black transition-colors focus:border-[rgba(var(--primary-color),1)] focus:outline-none sm:py-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ "--primary-color": primaryRgb } as React.CSSProperties}
              />
            </div>

            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-black opacity-60 transition-colors hover:bg-[rgba(var(--primary-color),0.08)] hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── Month Grid ── */}
          {showMonthGrid && (
            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((month, idx) => {
                const isSelected = viewingMonth.getMonth() === idx;
                return (
                  <button
                    key={month}
                    type="button"
                    onClick={() => handleMonthSelect(idx)}
                    className={cn(
                      "rounded-md px-2 py-2 text-xs font-medium transition-colors hover:text-black",
                      isSelected ? "border border-gray-300 bg-white text-black" : "text-gray-700 hover:bg-[rgba(var(--primary-color),0.08)]"
                    )}
                  >
                    {month.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Day Grid ── */}
          {!showMonthGrid && (
            <DayPicker
              mode="single"
              selected={date && isValid(date) ? date : undefined}
              onSelect={setDate}
              month={viewingMonth}
              onMonthChange={m => {
                setViewingMonth(m);
                setYearInput(String(m.getFullYear()));
              }}
              fromDate={minDate}
              toDate={maxDate}
              disabled={(d) => d < minDate || d > maxDate}
              initialFocus
              classNames={{
                months: "flex flex-col",
                month: "space-y-2",
                caption: "hidden",
                nav: "hidden",
                table: "w-full border-collapse",
                head_row: "flex",
                head_cell: "text-muted-foreground w-9 font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-1",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-9 rounded-md bg-transparent p-0 font-normal text-black transition-colors hover:bg-[rgba(var(--primary-color),0.08)]",
                day_selected: "border border-gray-300 bg-white text-black hover:bg-[rgba(var(--primary-color),0.08)]",
                day_today: "bg-gray-100 rounded-md font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
                day_hidden: "invisible",
              }}
              modifiersStyles={{
                selected: { backgroundColor: "#ffffff", color: "#000000", border: "1px solid #d1d5db" },
              }}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
