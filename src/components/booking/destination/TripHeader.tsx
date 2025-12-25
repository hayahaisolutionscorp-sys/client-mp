'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { CgSortAz } from 'react-icons/cg';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

import { getPorts } from '@/services';
import { SORT_BY_OPTIONS } from 'constants/default';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';

interface HeaderProps {
  label: string;
}

export default function TripHeader({ label }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const departurePortId = parseInt(searchParams.get('srcPortId') || '0', 10);
  const arrivalPortId = parseInt(searchParams.get('destPortId') || '0', 10);

  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>('earliest');
  const [departureName, setDepartureName] = useState<string | null>(null);
  const [arrivalName, setArrivalName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const themeSettings = useThemeSettings();

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Utility function to clean query parameters
  const cleanQueryParams = (queryParams: URLSearchParams) => {
    for (const [key, value] of queryParams.entries()) {
      if (value === 'undefined') {
        queryParams.delete(key);
      }
    }
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
    setDropdownOpen(false);

    const queryParams = new URLSearchParams(searchParams.toString());
    const queryKey = label === 'Departure' ? 'sortDeparture' : 'sortReturn';
    queryParams.set(queryKey, value);

    // Remove any query parameters with the value 'undefined'
    cleanQueryParams(queryParams);

    // Update the URL with the new 'sort' query parameter
    router.push(`/booking/destination?${queryParams.toString()}`);
  };

  // Fetch all ports first and then map the departure and arrival ports
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const allPorts = await getPorts(); // Fetch all ports from the service

        // Map the departure and arrival ports by their IDs
        const departurePort = allPorts?.find((port) => port.id === departurePortId);
        const arrivalPort = allPorts?.find((port) => port.id === arrivalPortId);

        if (departurePort) setDepartureName(departurePort.name);
        if (arrivalPort) setArrivalName(arrivalPort.name);
      } catch (error) {
        console.error('Error fetching ports:', error);
      }
    };

    fetchPorts();
  }, [departurePortId, arrivalPortId]);

  // Find the label for the selected value
  const selectedLabel = SORT_BY_OPTIONS.find((option) => option.value === selectedOption)?.label;

  // Close the dropdown if clicked outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col justify-between items-start sm:items-center bg-transparent pb-3 sm:pb-0 sm:flex-row">
      {/* Header Content */}
      <div className="hidden w-full sm:block sm:w-auto">
        <h2 className="text-sm text-gray-500 font-normal">{label}</h2>
        <div className="flex flex-wrap items-center text-base sm:text-lg font-semibold text-customText">
          <span className="break-words">{departureName}</span>
          {departureName && arrivalName && (
            <Image
              src="/assets/images/ship-icon.png"
              alt="Ship Icon"
              width={100}
              height={100}
              className="h-4 w-8 sm:w-10 mx-2 flex-shrink-0"
            />
          )}
          <span className="break-words">{arrivalName}</span>
        </div>
      </div>

      {/* Sort Button with Dropdown */}
      <div className="relative w-full sm:w-auto" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center w-full sm:w-[185px] space-x-1 px-2 py-2 bg-white text-customText border rounded-md shadow-sm hover:bg-gray-100 focus:border-2 focus:border-[rgba(var(--border-color),1)]"
          style={
            {
              '--border-color': hexToRgb(themeSettings?.borderColor || '#23abff')
            } as React.CSSProperties
          }
        >
          <CgSortAz className="text-xl flex-shrink-0" />
          <span className="text-sm font-medium truncate">{`Sort by: ${selectedLabel}`}</span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 z-10 mt-2 w-full bg-white border rounded-md shadow-lg">
            {SORT_BY_OPTIONS.map((option) => (
              <Button
                variant={selectedOption === option.value ? 'default' : null}
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className="w-full justify-start text-sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
