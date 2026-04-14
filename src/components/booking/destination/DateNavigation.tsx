"use client";

import { useState, useEffect, FC, Fragment, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

import { toCanonicalDate, toPhilippinesTime } from "helpers/date.helpers";
import { DATE_PRIMARY_DEFAULT_FORMAT, DAY_DEFAULT_FORMAT } from "constants/default";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

const DateNavigation: FC<{ label: string; onDateChange?: (date: string | null) => void }> = ({ label, onDateChange }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const themeSettings = useThemeSettings();

  const [windowStart, setWindowStart] = useState(0);
  const [uniqueDates, setUniqueDates] = useState<{ date: string; day: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState(6);

  useEffect(() => {
    const queryKey = label === "Departure"
      ? ["filterSpecificDepartureDate", "departure_date", "departureDate"]
      : ["filterSpecificReturnDate", "return_date", "returnDate"];

    const dateFromParams = queryKey.reduce<string | null>((acc, key) => acc || searchParams.get(key), null);
    const paramsDate = toCanonicalDate(dateFromParams);
    setSelectedDate(paramsDate);

    // Ensure selected date is the first in the window
    if (paramsDate) {
      const baseDate = new Date();
      const selected = new Date(paramsDate);
      // Calculate the difference in days between baseDate and selected
      const diffTime = selected.setHours(0, 0, 0, 0) - baseDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      // If selected date is in the future, set windowStart so selected is first
      setWindowStart(diffDays >= 0 ? diffDays : 0);
    } else {
      setWindowStart(0);
    }
  }, [searchParams, label]);

  const fetchDates = useCallback(async () => {
    const baseDate = new Date();
    const datesArray: { date: string; day: string }[] = [];

    for (let i = windowStart; i < windowStart + windowSize; i++) {
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() + i);

      const formattedDate = toPhilippinesTime(newDate.toISOString(), DATE_PRIMARY_DEFAULT_FORMAT);
      const day = toPhilippinesTime(newDate.toISOString(), DAY_DEFAULT_FORMAT);

      datesArray.push({ date: formattedDate, day });
    }

    setUniqueDates(datesArray);
    setLoading(false);
  }, [windowStart, windowSize]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  // Adjust windowSize based on screen width
  const adjustWindowSize = () => {
    const width = window.innerWidth;
    if (width < 480) {
      setWindowSize(2); // Small screens (e.g., mobile)
    } else if (width < 768) {
      setWindowSize(3); // Medium screens (e.g., tablet)
    } else if (width < 1024) {
      setWindowSize(4); // Large screens (e.g., small laptops)
    } else {
      setWindowSize(6); // Extra large screens (e.g., desktop)
    }
  };

  useEffect(() => {
    adjustWindowSize();
    window.addEventListener("resize", adjustWindowSize); // Listen to window resize events

    // Cleanup listener on component unmount
    return () => window.removeEventListener("resize", adjustWindowSize);
  }, []);

  const handlePrevious = () => {
    if (windowStart > 0) {
      setWindowStart(windowStart - windowSize);
    }
  };

  const handleNext = () => {
    setWindowStart(windowStart + windowSize);
  };

  // Handle date selection and unselection
  const handleDateClick = (date: string) => {
    const canonicalDate = toCanonicalDate(date);
    if (!canonicalDate) {
      return;
    }

    const selectedDateValue = new Date(canonicalDate);

    // Update state immediately for visual feedback
    setSelectedDate(canonicalDate);

    const queryParams = new URLSearchParams(window.location.search);
    const isDeparture = label === "Departure";
    const departureKey = "filterSpecificDepartureDate";
    const returnKey = "filterSpecificReturnDate";

    // Get current departure and return dates
    const currentDeparture = queryParams.get(departureKey);
    const currentReturn = queryParams.get(returnKey);
    const currentDepartureDate = currentDeparture ? new Date(currentDeparture) : null;
    const currentReturnDate = currentReturn ? new Date(currentReturn) : null;

    if (isDeparture) {
      queryParams.set(departureKey, canonicalDate);
      // If return date exists and is before the new departure date, adjust it
      if (currentReturnDate && currentReturnDate < selectedDateValue) {
        queryParams.set(returnKey, canonicalDate);
      }
    } else {
      // This is return date selection
      queryParams.set(returnKey, canonicalDate);
      // If departure date exists and is after the new return date, adjust it
      if (currentDepartureDate && currentDepartureDate > selectedDateValue) {
        queryParams.set(departureKey, canonicalDate);
      }
    }

    if (onDateChange) {
      onDateChange(canonicalDate);
    }

    router.push(`/booking/destination?${queryParams.toString()}`);

    // Lead user to results
    const anchorId = isDeparture ? "departure-results" : "return-results";
    setTimeout(() => {
      const element = document.getElementById(anchorId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="flex items-center bg-white p-2 mb-5 border rounded-lg shadow-md w-full overflow-hidden lg:mt-6">
      {/* Left Arrow */}
      <button className="p-1 sm:px-2 text-gray-500 bg-white hover:text-gray-700" onClick={handlePrevious} disabled={windowStart === 0} aria-label="Previous dates">
        <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Vertical Line */}
      <div className="h-[60px] sm:h-[76px] w-[1px] bg-gray-300 mx-1 sm:mx-2"></div>

      {/* Loading Indicator or Dates */}
      {loading ? (
        <div className="flex justify-center items-center w-full">
          <FiLoader className="animate-spin text-2xl sm:text-4xl" style={{ color: themeSettings?.accent || "#23abff" }} />
        </div>
      ) : (
        <div className="flex items-center justify-between w-full overflow-x-hidden no-scrollbar hide-scrollbar">
          {uniqueDates.map((item, index) => {
            const itemCanonicalDate = toCanonicalDate(item.date);

            // Compare ISO strings for highlighting
            const isSelected = selectedDate && itemCanonicalDate && selectedDate === itemCanonicalDate;

            return (
              <Fragment key={index}>
                <Button
                  variant={null}
                  onClick={() => handleDateClick(item.date)}
                  className={`flex flex-col items-center justify-center w-full h-full
                    transition-all duration-300 ease-in-out
                    ${isSelected ? "border-b-4 border-[rgba(var(--border-color),1)]" : ""}
                    hover:border-b-4 hover:border-[rgba(var(--border-color),0.5)]`}
                  style={{ "--border-color": hexToRgb(themeSettings?.accent || "#8C1F21") } as React.CSSProperties}
                >
                  <span className="text-sm sm:text-base font-medium">{item.day}</span>
                  <span className="text-xs sm:text-sm font-bold">{item.date}</span>
                </Button>
                {index !== uniqueDates.length - 1 && <div className="h-[60px] sm:h-[76px] w-[1px] bg-gray-300 mx-1 sm:mx-2"></div>}
              </Fragment>
            );
          })}
        </div>
      )}

      {/* Vertical Line */}
      <div className="h-[60px] sm:h-[76px] w-[1px] bg-gray-300 mx-1 sm:mx-2"></div>

      {/* Right Arrow */}
      <button className="p-1 sm:px-2 text-gray-500 bg-white hover:text-gray-700" onClick={handleNext} disabled={uniqueDates.length < windowSize} aria-label="Next dates">
        <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default DateNavigation;
