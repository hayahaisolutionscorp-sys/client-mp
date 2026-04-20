"use client";

import { useState, useRef, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa6";

import { DEFAULT_BOOKING_TYPE } from "constants/default";
import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";

interface TripDropdownProps {
  value: string | undefined;
  onChange: (tripType: string) => void;
}

const TripDropdown = ({ value, onChange }: TripDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const themeSettings = useThemeSettings();

  // Set default value if value is undefined
  const displayedValue = value || DEFAULT_BOOKING_TYPE;

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelection = (trip: string) => {
    onChange(trip); // Call onChange to update the parent state
    setIsOpen(false);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-10 inline-block w-full h-[40px] overflow-visible text-left focus-within:z-[120]">
      <button
        data-template-ignore="true"
        onClick={toggleDropdown}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgba(var(--primary-color),1)] disabled:cursor-not-allowed disabled:opacity-50"
        style={
          {
            "--primary-color": hexToRgb(themeSettings?.primary || "#8C1F21"),
          } as React.CSSProperties
        }
      >
        <span className="font-natural text-customText">{displayedValue}</span>
        <FaAngleDown className="w-4 h-4" style={{ color: `rgba(${hexToRgb(themeSettings?.primary || "#8C1F21")}, 1)` }} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[1100] mt-2 w-full text-sm bg-white border rounded-md shadow-sm">
          <ul className="py-1">
            <li
              onClick={() => handleSelection("Single Trip")}
              className={`px-4 py-2 cursor-pointer ${displayedValue === "Single Trip"
                ? "bg-[rgba(var(--bg-color),0.2)] text-customText"
                : "hover:bg-[rgba(var(--bg-color),0.1)] hover:text-[rgba(var(--bg-color),1)]"
                }`}
              style={
                {
                  "--bg-color": hexToRgb("#FFFFFF"),
                } as React.CSSProperties
              }
            >
              Single Trip
            </li>
            <li
              onClick={() => handleSelection("Round Trip")}
              className={`px-4 py-2 cursor-pointer ${displayedValue === "Round Trip"
                ? "bg-[rgba(var(--bg-color),0.2)] text-customText"
                : "hover:bg-[rgba(var(--bg-color),0.1)] hover:text-[rgba(var(--bg-color),1)]"
                }`}
              style={
                {
                  "--bg-color": hexToRgb("#FFFFFF"),
                } as React.CSSProperties
              }
            >
              Round Trip
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default TripDropdown;
