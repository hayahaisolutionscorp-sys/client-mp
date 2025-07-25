"use client";

import { useEffect, useState, Dispatch, SetStateAction } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { toPhilippinesTime } from "helpers/date.helpers";
import { DATE_PRIMARY_DEFAULT_FORMAT } from "constants/default";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

const DatePickerFieldset = ({
  legendText,
  date,
  setDate,
  disableBeforeDate,
}: {
  legendText: string;
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  disableBeforeDate?: Date | null; // Accepts a Date or null
}) => {
  const [isClient, setIsClient] = useState(false);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    setIsClient(true); // Ensure hydration consistency
  }, []);

  const isValidDate = (date: Date | undefined) => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  return (
    <fieldset 
      className="border rounded-md bg-white w-full min-w-[165px] h-[55px] focus-within:outline-none focus-within:border-[rgba(var(--border-color),1)] focus-within:border-2"
      style={
        {
          "--border-color": hexToRgb(themeSettings?.borderColor || "#23abff"),
        } as React.CSSProperties
      }
    >
      <legend className="font-natural text-xs text-customText">
        {legendText}
      </legend>
      <div className="relative flex items-center justify-center text-sm text-left w-full h-full">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex w-full h-full px-4 py-2 items-center justify-start text-left font-normal text-customText",
                !isClient || !date ? "text-muted-foreground" : ""
              )}
            >
              <CalendarIcon
                className="mr-3 h-5 w-5"
                style={{ color: themeSettings?.iconColor || "#051036" }}
              />
              {isClient && date && isValidDate(date) 
                ? toPhilippinesTime(date.toISOString(), DATE_PRIMARY_DEFAULT_FORMAT) 
                : <span>Select Date</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            {isClient && (
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(selectedDate) => {
                  // Disable dates before disableBeforeDate if it's provided
                  if (disableBeforeDate) {
                    return selectedDate < disableBeforeDate;
                  }
                  // Disable dates before today's date or before "1900-01-01"
                  return (
                    selectedDate < new Date(new Date().setHours(0, 0, 0, 0)) ||
                    selectedDate < new Date("1900-01-01")
                  );
                }}
                initialFocus
                className="rounded-md"
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </fieldset>
  );
};

export default DatePickerFieldset;