"use client";

import { useState, useRef, useEffect } from "react";
import { BiSolidShip } from "react-icons/bi";
import { IoMdPin } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

import { useThemeSettings } from "@/hooks/theme-settings";
import { hexToRgb } from "helpers/theme.helpers";
import { IPort } from "@/models/shipping-line/port.model";

type DestinationPortDropdownProps = {
  legendText: string;
  onPortSelect: (port: IPort | undefined) => void;
  ports: IPort[] | undefined;
  selectedPort: IPort | undefined;
  disabled?: boolean;
};

const PortDropdownFieldset = ({
  legendText,
  onPortSelect,
  ports,
  selectedPort,
  disabled = false,
}: DestinationPortDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDelayedEnabled, setIsDelayedEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPorts, setFilteredPorts] = useState<IPort[]>([]);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayedEnabled(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsHydrated(true);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (ports) {
      setFilteredPorts(
        ports
          .filter((port) => port.name.trim() !== "")
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  }, [ports]);

  const toggleDropdown = () => {
    if (!disabled && isDelayedEnabled) {
      setIsOpen((prev) => !prev);
      clearSearch();
      if (!isOpen) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    }
  };

  const handleSelection = (port: IPort) => {
    if (!disabled && isDelayedEnabled) {
      onPortSelect(port);
      setIsOpen(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value.toLowerCase();
    setSearchTerm(query);

    if (ports) {
      setFilteredPorts(
        ports
          .filter((port) => port.name.toLowerCase().includes(query))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
    if (ports) {
      setFilteredPorts(
        ports.sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  };

  return (
    <fieldset
      className="border rounded-md bg-white w-full h-[55px] focus-within:outline-none focus-within:border-[rgba(var(--border-color),1)] focus-within:border-2"
      style={
        {
          "--border-color": hexToRgb(themeSettings?.accent || "#8C1F21"),
        } as React.CSSProperties
      }
    >
      <legend className="font-natural text-xs text-customText">{legendText}</legend>
      <div ref={dropdownRef} className="relative w-full h-full">
        <button
          onClick={toggleDropdown}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={`flex text-sm items-center justify-start w-full h-full px-4 py-2 bg-white rounded-md shadow-sm ${disabled || !isDelayedEnabled ? "cursor-not-allowed opacity-60" : ""
            }`}
          disabled={disabled || !isDelayedEnabled}
        >
          <BiSolidShip
            className="w-5 h-5 mr-3"
            style={{ color: themeSettings?.accent || "#051036" }}
          />
          <span className="text-customText font-natural">
            {!isHydrated
              ? "Loading..."
              : selectedPort
                ? selectedPort.name
                : disabled
                  ? "Select origin first"
                  : ports === undefined
                    ? "Loading ports..."
                    : ports.length === 0
                      ? "No destinations available"
                      : "Select Port"}
          </span>
        </button>

        {isOpen && !disabled && isDelayedEnabled && (
          <div className="absolute z-10 mt-2 w-full bg-white border rounded-md shadow-sm">
            <div className="p-2 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search port..."
                className="w-full p-2 text-sm border border-gray-300 rounded-md focus-within:outline-none focus-within:border-[rgba(var(--border-color),1)] focus-within:border-2 bg-white text-gray-900"
                style={
                  {
                    "--border-color": hexToRgb(themeSettings?.accent || "#8C1F21"),
                  } as React.CSSProperties
                }
              />
              {searchTerm && (
                <IoMdClose
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={clearSearch}
                />
              )}
            </div>

            <ul className="pb-1 max-h-[150px] overflow-y-auto 
                  [&::-webkit-scrollbar]:w-1.5
                  [&::-webkit-scrollbar-track]:bg-gray-100 
                  [&::-webkit-scrollbar-thumb]:bg-[rgba(var(--bg-color),1)] 
                  [&::-webkit-scrollbar-thumb]:rounded-md"
              style={
                {
                  "--bg-color": hexToRgb("#FFFFFF"),
                } as React.CSSProperties
              }
            >
              {filteredPorts.length > 0 ? (
                filteredPorts.map((port) => (
                  <li
                    key={port.id}
                    onClick={() => handleSelection(port)}
                    className={`group flex items-center px-4 py-2 cursor-pointer ${selectedPort?.id === port.id
                      ? "bg-[rgba(var(--bg-color),0.2)]"
                      : "hover:bg-[rgba(var(--bg-color),0.1)]"
                      }`}
                    style={
                      {
                        "--bg-color": hexToRgb("#FFFFFF"),
                      } as React.CSSProperties
                    }
                  >
                    <IoMdPin
                      className="w-4 h-4 mr-3 text-gray-400 group-hover:text-[rgba(var(--icon-color),1)]"
                      style={{
                        "--icon-color": hexToRgb(themeSettings?.accent || "#23abff"),
                        color: selectedPort?.id === port.id
                          ? "rgba(var(--icon-color),1)"
                          : "",
                      } as React.CSSProperties}
                    />
                    <span
                      className="text-sm font-medium group-hover:text-[rgba(var(--icon-color),1)]"
                      style={{
                        "--icon-color": hexToRgb(themeSettings?.accent || "#23abff"),
                        color: selectedPort?.id === port.id
                          ? "rgba(var(--icon-color),1)"
                          : "",
                      } as React.CSSProperties}
                    >
                      {port.name}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-center text-gray-500 p-2">No ports found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default PortDropdownFieldset;