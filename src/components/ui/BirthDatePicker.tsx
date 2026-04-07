"use client";

import * as React from "react";
import { Dispatch, SetStateAction } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayPicker } from "react-day-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { isValid, format, subYears, setMonth, setYear, startOfMonth } from "date-fns";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const BirthDatePicker = ({
  date,
  setDate,
  validationErrors,
  allowMinors = false,
  disabled = false,
}: {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  validationErrors: Record<string, string>;
  allowMinors?: boolean;
  disabled?: boolean;
}) => {
  const themeSettings = useThemeSettings();
  const primaryRgb = hexToRgb(themeSettings?.primary || "#8C1F21");
  const primaryColor = themeSettings?.primary || "#8C1F21";

  const eighteenYearsAgo = subYears(new Date(), 18);
  const maxDate = allowMinors ? new Date() : eighteenYearsAgo;
  const minYear = 1900;
  const maxYear = maxDate.getFullYear();

  const [viewingMonth, setViewingMonth] = React.useState<Date>(
    date && isValid(date) ? date : maxDate
  );
  const [showMonthGrid, setShowMonthGrid] = React.useState(false);
  const [yearInput, setYearInput] = React.useState(String(viewingMonth.getFullYear()));

  const displayDate = date && isValid(date) ? format(date, "yyyy-MM-dd") : "Select Date";

  const handleYearInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setYearInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed >= minYear && parsed <= maxYear) {
      setViewingMonth(prev => setYear(prev, parsed));
    }
  };

  const handleYearBlur = () => {
    const parsed = parseInt(yearInput, 10);
    const clamped = isNaN(parsed) ? maxYear : Math.max(minYear, Math.min(maxYear, parsed));
    setYearInput(String(clamped));
    setViewingMonth(prev => setYear(prev, clamped));
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewingMonth(prev => startOfMonth(setMonth(prev, monthIndex)));
    setShowMonthGrid(false);
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
          aria-label="Select birthday"
          disabled={disabled}
          className={cn(
            "flex px-3 py-2 rounded-md border border-input bg-background items-center justify-between w-full h-10 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(var(--primary-color),1)]",
            (!date || !isValid(date)) ? "text-muted-foreground" : "text-customText",
            validationErrors.birthday ? "border-red-500" : "",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50"
          )}
          style={{ "--primary-color": primaryRgb } as React.CSSProperties}
        >
          <span>{displayDate}</span>
          <CalendarIcon className="h-5 w-5" style={{ color: "#051036" }} />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-3 select-none">

          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => navigateMonth(-1)}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors opacity-60 hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 flex-1 justify-center">
              {/* Month button */}
              <button
                type="button"
                aria-label={`Select month. Currently ${MONTHS[viewingMonth.getMonth()]}`}
                aria-expanded={showMonthGrid}
                aria-haspopup="listbox"
                onClick={() => setShowMonthGrid(prev => !prev)}
                className={cn(
                  "text-sm font-semibold px-2 py-1 rounded-md transition-colors min-w-[90px]",
                  showMonthGrid ? "text-white" : "hover:bg-gray-100"
                )}
                style={showMonthGrid ? { backgroundColor: primaryColor } : {}}
              >
                {MONTHS[viewingMonth.getMonth()]}
              </button>

              {/* Year input */}
              <input
                type="number"
                min={minYear}
                max={maxYear}
                value={yearInput}
                onChange={handleYearInput}
                onBlur={handleYearBlur}
                aria-label="Year"
                className="w-14 text-sm font-semibold text-center border-0 border-b-2 border-gray-200 bg-transparent focus:outline-none focus:border-[rgba(var(--primary-color),1)] py-0.5 sm:py-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                style={{ "--primary-color": primaryRgb } as React.CSSProperties}
              />
            </div>

            <button
              type="button"
              aria-label="Next month"
              onClick={() => navigateMonth(1)}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors opacity-60 hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* ── Month Grid ── */}
          {showMonthGrid && (
            <div role="listbox" aria-label="Month" className="grid grid-cols-3 gap-1">
              {MONTHS.map((month, idx) => {
                const isSelected = viewingMonth.getMonth() === idx;
                return (
                  <button
                    key={month}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    aria-label={month}
                    onClick={() => handleMonthSelect(idx)}
                    className={cn(
                      "text-xs py-2 px-2 rounded-md transition-colors font-medium",
                      isSelected ? "text-white" : "hover:bg-gray-100 text-gray-700"
                    )}
                    style={isSelected ? { backgroundColor: primaryColor } : {}}
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
              fromDate={new Date("1900-01-01")}
              toDate={maxDate}
              disabled={(d) => d > maxDate || d < new Date("1900-01-01")}
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
                day: "h-9 w-9 p-0 font-normal text-black bg-transparent hover:bg-gray-100 rounded-md transition-colors",
                day_selected: "text-white rounded-md hover:opacity-90",
                day_today: "bg-gray-100 rounded-md font-semibold",
                day_outside: "text-muted-foreground opacity-50",
                day_disabled: "text-muted-foreground opacity-30 cursor-not-allowed",
                day_hidden: "invisible",
              }}
              modifiersStyles={{
                selected: { backgroundColor: primaryColor },
              }}
            />
          )}

        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BirthDatePicker;