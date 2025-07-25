"use client";

import { useState, useEffect, useRef } from 'react';
import { GrCar } from 'react-icons/gr';
import { FaMinus, FaPlus } from "react-icons/fa6";

import { DEFAULT_NUM_VEHICLES } from "constants/default";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

interface VehicleDropdownProps {
  value: number | undefined;
  onChange: (newValue: number) => void;
}

const VehicleDropdown: React.FC<VehicleDropdownProps> = ({ value = DEFAULT_NUM_VEHICLES, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const toggleDropdown = () => setIsOpen(!isOpen);
  const themeSettings = useThemeSettings();
  
  const increment = () => {
    onChange(value + 1);
  };

  const decrement = () => {
    if (value > 0) {
      onChange(value - 1);
    }
  };

  // Close dropdown when clicking outside
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
        className="flex text-sm items-center justify-between w-full h-full px-4 py-2 bg-white border rounded-md focus:outline-none focus:border-[rgba(var(--border-color),1)] focus:border-2"
        style={
          {
            "--border-color": hexToRgb(themeSettings?.borderColor || "#23abff"),
          } as React.CSSProperties
        }
      >
        <div className="flex items-center space-x-3">
          <GrCar
            className="h-5 w-5"
            style={{ color: themeSettings?.iconColor || "#051036" }}
          />
          <span className="text-customText font-natural">{value} Vehicle{value !== 1 ? 's' : ''}</span>
        </div>
      </button>

      {/* Dropdown content */}
      {isOpen && (
        <div className="absolute z-[11] mt-2 p-4 w-full bg-white border rounded-md shadow-sm">
          <div className="flex flex-col space-y-4">
            {/* Vehicles */}
            <div className="flex items-center justify-between">
              <div>
                <span className="block font-semibold">Vehicle</span>
                <span className="text-xs text-gray-500">No. of Vehicle</span>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={decrement}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={value == 0} // Disable minus button when value is 0
                >
                  <FaMinus className="h-5 w-5 text-customText" />
                </button>
                <span>{value}</span>
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

export default VehicleDropdown;