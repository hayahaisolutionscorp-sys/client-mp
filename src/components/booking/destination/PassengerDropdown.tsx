"use client";

import { useState, useEffect, useRef } from 'react';
import { FaMinus, FaPlus, FaAngleDown } from "react-icons/fa6";
import { HiUsers } from "react-icons/hi2";

import { DEFAULT_NUM_PASSENGERS } from "constants/default";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

interface PassengerDropdownProps {
  value: number | undefined;
  onChange: (newValue: number) => void;
}

const PassengerDropdown = ({ value = DEFAULT_NUM_PASSENGERS, onChange }: PassengerDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const themeSettings = useThemeSettings();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const increment = () => {
    onChange(value + 1);
  };

  const decrement = () => {
    if (value > 1) onChange(value - 1);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-10 inline-block w-full h-[40px] overflow-visible text-left focus-within:z-[120]">
      {/* Button to toggle dropdown */}
      <button
        data-template-ignore="true"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50"
        style={
          {
            "--primary-color": hexToRgb(themeSettings?.primary || "#8C1F21"),
          } as React.CSSProperties
        }
      >
        <div className="flex items-center space-x-3">
          <HiUsers
            className="h-5 w-5"
            style={{ color: themeSettings?.accent || "#051036" }}
          />
          <span className="text-customText font-natural">
            {value} {value === 1 ? 'Passenger' : 'Passengers'}
          </span>
        </div>
        <FaAngleDown className="w-4 h-4" style={{ color: `rgba(${hexToRgb(themeSettings?.primary || "#8C1F21")}, 1)` }} />
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute left-0 top-full z-[140] mt-2 w-full rounded-md border bg-white p-4 shadow-sm">
          <div className="flex flex-col space-y-4">
            {/* Passenger */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-semibold">Passenger</span>
                <span className="text-xs text-gray-500">No. of Passengers</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  data-template-ignore="true"
                  onClick={decrement}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={value <= 1} // Disable minus button when value is 1
                >
                  <FaMinus className="h-5 w-5 text-customText" />
                </button>
                <span aria-live="polite">{value}</span>
                <button
                  data-template-ignore="true"
                  onClick={increment}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="h-5 w-5 text-customText" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassengerDropdown;
