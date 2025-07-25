import { useState, Dispatch, SetStateAction, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import TimePicker from "@/components/ui/TimePickerCustom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";

import { toPhilippinesTime } from "helpers/date.helpers";
import { DATE_PRIMARY_DEFAULT_FORMAT, TIME_DEFAULT_FORMAT } from "constants/default";

const DateTimePickerFieldset = ({
  legendText,
  date,
  setDate
}: {
  legendText: string;
  date: Date | undefined;
  setDate: Dispatch<SetStateAction<Date | undefined>>;
}) => {
  // Set the default time to 12:00 AM
  const initializeTime = () => {
    const currentDate = new Date(date || new Date());
    currentDate.setHours(0, 0, 0, 0); // Set time to 12:00 AM
    return currentDate;
  };

  const [selectedTime, setSelectedTime] = useState(initializeTime());

  // Helper function to compare dates
  const isEqual = (d1: Date | undefined, d2: Date | undefined) => {
    if (!d1 || !d2) return false; // Return false if either date is undefined
    return d1.getTime() === d2.getTime();
  };

  const handleTimeChange = (newTime: Date | undefined) => {
    if (newTime && !isEqual(newTime, selectedTime)) {
      setSelectedTime(newTime);
    }
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Set the time of the newDate to match selectedTime, only if the date is different
      if (!isEqual(newDate, date)) {
        newDate.setHours(
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          selectedTime.getSeconds(),
          selectedTime.getMilliseconds()
        );
        setDate(newDate);
      }
    } else {
      setDate(undefined);
    }
  };

  useEffect(() => {
    if (date && selectedTime) {
      // Synchronize date and selectedTime if they are mismatched
      if (!isEqual(date, selectedTime)) {
        date.setHours(
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          selectedTime.getSeconds(),
          selectedTime.getMilliseconds()
        );
        setDate(date); // Update date only if it's truly updated
      }
    }
  }, [selectedTime, date, setDate]); // Add setDate to the dependency array  

  const isValidDate = (date: Date | undefined) => {
    return date instanceof Date && !isNaN(date.getTime());
  };

  return (
    <fieldset className="border rounded-md bg-white w-full h-[55px] focus-within:outline-none focus-within:border-customBlue focus-within:border-2">
      <legend className="font-natural text-xs text-customText">{legendText}</legend>
      <div className="relative flex items-center justify-center text-left w-full h-full">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={null}
              className={cn(
                "w-full justify-start text-left font-normal text-customText",
                !date ? "text-muted-foreground" : ""
              )}
            >
              <CalendarIcon className="mr-2 mb-1 h-5 w-5 text-customText" />
              {date && isValidDate(date)
                ? `${toPhilippinesTime(date.toISOString(), DATE_PRIMARY_DEFAULT_FORMAT)} at ${toPhilippinesTime(selectedTime.toISOString(), TIME_DEFAULT_FORMAT)}`
                : <span>Select Date & Time</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <>
              {/* Calendar Component */}
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(selectedDate) => {
                  // Disable dates before today
                  const today = new Date();
                  today.setHours(0, 0, 0, 0); // Normalize today's date to 12:00 AM
                  return selectedDate < today; // Disable dates before today
                }}
                initialFocus
                className="rounded-md"
              />

              {/* Time Picker Component */}
              <div className="relative flex items-center justify-center text-left w-full h-full py-4">
                <TimePicker selectedTime={selectedTime} onChange={handleTimeChange} />
              </div>
            </>
          </PopoverContent>
        </Popover>
      </div>
    </fieldset>
  );
};

export default DateTimePickerFieldset;