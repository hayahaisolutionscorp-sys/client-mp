"use client";

import { useState, useEffect, FC, Fragment, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

import { toPhilippinesTime } from "helpers/date.helpers";
import { DATE_PRIMARY_DEFAULT_FORMAT, DAY_DEFAULT_FORMAT } from "constants/default";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

const DateSelection: FC<{ onDateChange?: (date: string | null) => void }> = ({ onDateChange }) => {
  const themeSettings = useThemeSettings();

  const [windowStart, setWindowStart] = useState(0);
  const [uniqueDates, setUniqueDates] = useState<{ date: string; day: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState(6);

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

    // Set selectedDate to the first available date as ISO string
    if (datesArray.length > 0) {
      const isoDate = new Date(datesArray[0].date).toISOString();
      setSelectedDate(isoDate);
    } else {
      setSelectedDate(new Date().toISOString());
    }

    setLoading(false);
  }, [windowStart, windowSize]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  useEffect(() => {
    if (onDateChange && selectedDate) {
      onDateChange(selectedDate);
    }
  }, [selectedDate, onDateChange]);

  const adjustWindowSize = () => {
    const width = window.innerWidth;
    if (width < 480) {
      setWindowSize(2);
    } else if (width < 768) {
      setWindowSize(3);
    } else if (width < 1024) {
      setWindowSize(4);
    } else {
      setWindowSize(6);
    }
  };

  useEffect(() => {
    adjustWindowSize();
    window.addEventListener("resize", adjustWindowSize);
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

  const handleDateClick = (date: string) => {
    const clickedDateISO = new Date(date).toISOString();
    setSelectedDate(clickedDateISO);
  };

  return (
    <div className="flex items-center bg-white p-2 mb-5 border rounded-lg shadow-md w-full overflow-hidden lg:mt-6">
      <button className="p-1 sm:px-2 text-gray-500 bg-white hover:text-gray-700" onClick={handlePrevious} disabled={windowStart === 0}>
        <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <div className="h-[60px] sm:h-[76px] w-[1px] bg-gray-300 mx-1 sm:mx-2"></div>
      {loading ? (
        <div className="flex justify-center items-center w-full">
          <FiLoader className="animate-spin text-2xl sm:text-4xl" style={{ color: themeSettings?.iconColor || "#23abff" }} />
        </div>
      ) : (
        <div className="flex items-center justify-between w-full overflow-x-hidden no-scrollbar hide-scrollbar">
          {uniqueDates.map((item, index) => {
            const itemDateISO = new Date(item.date).toISOString();
            const isSelected = itemDateISO === selectedDate;

            return (
              <Fragment key={index}>
                <Button
                  variant={null}
                  onClick={() => handleDateClick(item.date)}
                  className={`flex flex-col items-center justify-center w-full h-full ${isSelected ? "border-b-4 border-[rgba(var(--border-color),1)]" : ""}`}
                  style={{ "--border-color": hexToRgb(themeSettings?.borderColor || "#23abff") } as React.CSSProperties}
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
      <div className="h-[60px] sm:h-[76px] w-[1px] bg-gray-300 mx-1 sm:mx-2"></div>
      <button className="p-1 sm:px-2 text-gray-500 bg-white hover:text-gray-700" onClick={handleNext} disabled={uniqueDates.length < windowSize}>
        <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default DateSelection;
