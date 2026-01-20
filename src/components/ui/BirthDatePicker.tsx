"use client";

import { Dispatch, SetStateAction } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { isValid, format, subYears } from "date-fns";

const BirthDatePicker = ({
  date,
  setDate,
  validationErrors,
  allowMinors = false,
}: {
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
  validationErrors: Record<string, string>;
  allowMinors?: boolean;
  }) => {
  const displayDate = date && isValid(date) ? format(date, "yyyy-MM-dd") : "Select Date";
  const eighteenYearsAgo = subYears(new Date(), 18);
  const maxDate = allowMinors ? new Date() : eighteenYearsAgo;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex px-3 py-2 rounded-md border border-input bg-background items-center justify-between w-full h-10 text-sm",
            (!date || !isValid(date)) ? "text-muted-foreground" : "text-customText",
            validationErrors.birthday ? "border-red-500" : ""
          )}
        >
          <span>{displayDate}</span>

          <CalendarIcon
            className="h-5 w-5"
            style={{ color: "#051036" }}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date && isValid(date) ? date : undefined}
          onSelect={setDate}
          required
          captionLayout="dropdown"
          fromDate={new Date("1900-01-01")}
          toDate={maxDate}
          defaultMonth={date && isValid(date) ? date : maxDate}
          disabled={(selectedDate) => {
            // Disable dates in the future or very old dates
            return selectedDate > maxDate || selectedDate < new Date("1900-01-01");
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>);
}
 
export default BirthDatePicker;