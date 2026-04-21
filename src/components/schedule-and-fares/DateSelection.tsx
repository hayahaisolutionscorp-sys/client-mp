"use client";

import { useState, useEffect, FC, Fragment, useCallback } from "react";
import { FiChevronLeft, FiChevronRight, FiLoader } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

import { toPhilippinesTime } from "helpers/date.helpers";
import { DATE_PRIMARY_DEFAULT_FORMAT, DAY_DEFAULT_FORMAT } from "constants/default";


interface DateSelectionProps {
  onDateChange?: (date: string | null) => void;
  accentColor?: string;
  variant?: string;
}

const DateSelection: FC<DateSelectionProps> = ({ onDateChange, accentColor = '#23abff', variant = 'default' }) => {

  const [windowStart, setWindowStart] = useState(0);
  const [uniqueDates, setUniqueDates] = useState<{ date: string; day: string; iso: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [windowSize, setWindowSize] = useState(6);

  const fetchDates = useCallback(async () => {
    const baseDate = new Date();
    const datesArray: { date: string; day: string; iso: string }[] = [];

    for (let i = windowStart; i < windowStart + windowSize; i++) {
      const newDate = new Date(baseDate);
      newDate.setDate(baseDate.getDate() + i);

      const isoString = newDate.toISOString();
      const formattedDate = toPhilippinesTime(isoString, DATE_PRIMARY_DEFAULT_FORMAT);
      const day = toPhilippinesTime(isoString, DAY_DEFAULT_FORMAT);

      datesArray.push({ date: formattedDate, day, iso: isoString });
    }

    setUniqueDates(datesArray);

    // Set selectedDate to the first available date as ISO string
    if (datesArray.length > 0) {
      setSelectedDate(datesArray[0].iso);
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

  const handleDateClick = (iso: string) => {
    setSelectedDate(iso);
  };

  const isGlass = variant === 'glassmorphic';
  const isBoardingPass = variant === 'boarding-pass';

  return (
    <div className={`flex items-center p-2 w-full overflow-hidden ${isBoardingPass ? "bg-transparent border-none" : `border rounded-lg ${isGlass ? "bg-transparent border-none shadow-none md:mt-2" : "bg-white mb-5 shadow-md lg:mt-6"}`}`}>
      <button className={`p-1 sm:px-2 hover:text-gray-900 transition-colors ${isBoardingPass ? "rounded-md border-2 border-dashed bg-white" : isGlass ? "bg-white/50 rounded-full text-slate-800 shadow-sm" : "text-gray-500 bg-white"}`} style={isBoardingPass ? { borderColor: 'rgba(15,23,42,0.2)' } : undefined} onClick={handlePrevious} disabled={windowStart === 0} aria-label="Previous dates">
        <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <div className={`h-[60px] sm:h-[76px] w-[1px] mx-1 sm:mx-2 ${isBoardingPass ? "border-l-2 border-dashed w-0 h-[60px] sm:h-[76px]" : isGlass ? "bg-white/30" : "bg-gray-300"}`} style={isBoardingPass ? { borderColor: 'rgba(15,23,42,0.2)' } : undefined}></div>
      {loading ? (
        <div className="flex justify-center items-center w-full">
          <FiLoader className="animate-spin text-2xl sm:text-4xl" style={{ color: accentColor }} />
        </div>
      ) : (
        <div className="flex items-center justify-between w-full overflow-x-hidden no-scrollbar hide-scrollbar">
          {uniqueDates.map((item, index) => {
            const isSelected = item.iso === selectedDate;

            return (
              <Fragment key={index}>
                <Button
                  variant={null}
                  onClick={() => handleDateClick(item.iso)}
                  className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
                    isBoardingPass
                      ? `rounded-md border-2 ${isSelected ? "text-white font-mono" : "border-dashed hover:-translate-y-[1px]"} py-2`
                      : `rounded-2xl ${isSelected && !isGlass ? "border-b-4 border-[var(--border-color)]" : isSelected && isGlass ? "bg-white/60 shadow-inner" : isGlass ? "hover:bg-white/30 text-slate-700" : ""}`
                  }`}
                  style={isBoardingPass
                    ? {
                        borderColor: isSelected ? accentColor : 'rgba(15,23,42,0.2)',
                        backgroundColor: isSelected ? accentColor : 'transparent',
                        color: isSelected ? '#fff' : undefined,
                      }
                    : ({ "--border-color": accentColor, color: isSelected && isGlass ? accentColor : undefined } as React.CSSProperties)}
                >
                  <span className={`${isBoardingPass ? "font-mono text-[10px] uppercase tracking-[0.2em] font-black" : "text-sm sm:text-base font-medium"}`}>{item.day}</span>
                  <span className={`${isBoardingPass ? "font-mono text-sm font-black mt-0.5" : "text-xs sm:text-sm font-bold"}`}>{item.date}</span>
                </Button>
                {index !== uniqueDates.length - 1 && <div className={`${isBoardingPass ? "border-l-2 border-dashed w-0 h-[60px] sm:h-[76px] mx-1 sm:mx-2" : `h-[60px] sm:h-[76px] w-[1px] mx-1 sm:mx-2 ${isGlass ? "bg-white/30" : "bg-gray-300"}`}`} style={isBoardingPass ? { borderColor: 'rgba(15,23,42,0.2)' } : undefined}></div>}
              </Fragment>
            );
          })}
        </div>
      )}
      <div className={`${isBoardingPass ? "border-l-2 border-dashed w-0 h-[60px] sm:h-[76px] mx-1 sm:mx-2" : `h-[60px] sm:h-[76px] w-[1px] mx-1 sm:mx-2 ${isGlass ? "bg-white/30" : "bg-gray-300"}`}`} style={isBoardingPass ? { borderColor: 'rgba(15,23,42,0.2)' } : undefined}></div>
      <button className={`p-1 sm:px-2 hover:text-gray-900 transition-colors ${isBoardingPass ? "rounded-md border-2 border-dashed bg-white" : isGlass ? "bg-white/50 rounded-full text-slate-800 shadow-sm" : "text-gray-500 bg-white"}`} style={isBoardingPass ? { borderColor: 'rgba(15,23,42,0.2)' } : undefined} onClick={handleNext} disabled={uniqueDates.length < windowSize} aria-label="Next dates">
        <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );
};

export default DateSelection;
