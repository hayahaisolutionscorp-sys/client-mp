"use client";

import { useState, useEffect, useRef } from 'react';
import { FaMinus, FaPlus } from "react-icons/fa6";
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
    <div ref={dropdownRef} className="relative inline-block w-full h-[40px] text-left">
      {/* Button to toggle dropdown */}
      <button
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex text-sm items-center justify-between w-full h-full px-4 py-2 bg-white border rounded-md focus:outline-none focus:border-[rgba(var(--border-color),1)] focus:border-2"
        style={
          {
            "--border-color": hexToRgb(themeSettings?.accent || "#8C1F21"),
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
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-10 mt-2 p-4 w-full bg-white border rounded-md shadow-sm">
          <div className="flex flex-col space-y-4">
            {/* Passenger */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-semibold">Passenger</span>
                <span className="text-xs text-gray-500">No. of Passengers</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={decrement}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={value <= 1} // Disable minus button when value is 1
                >
                  <FaMinus className="h-5 w-5 text-customText" />
                </button>
                <span aria-live="polite">{value}</span>
                <button
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