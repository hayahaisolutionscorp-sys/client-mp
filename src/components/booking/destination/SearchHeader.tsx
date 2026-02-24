'use client';

import { useState, useEffect, SetStateAction, Dispatch } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LuArrowRightLeft } from 'react-icons/lu';
import { BiSolidShip } from 'react-icons/bi';
import { FiLoader } from 'react-icons/fi';
import Image from 'next/image';

import PortDropdownFieldset from '@/components/booking/destination/PortDropdownFieldset';
import PassengerDropdown from '@/components/booking/destination/PassengerDropdown';
import VehicleDropdown from '@/components/ui/VehicleDropdown';
import TripDropdown from '@/components/booking/destination/TripDropdown';
import DatePickerFieldset from '@/components/ui/DatePickerFieldset';
import { Button } from '@/components/ui/Button';

import { useShippingLineForWhiteLabel } from '@/hooks/shipping-line';
import { useThemeSettings } from '@/hooks/theme-settings';
import {
  DEFAULT_BOOKING_TYPE,
  DEFAULT_NUM_VEHICLES,
  DEFAULT_NUM_PASSENGERS,
  SHIPPING_LINE_LOGO
} from 'constants/index';
import { IPort } from '@/models';
import { getPorts, getDestinationPortsByOrigin } from '@/services';
import { getBrandingConfig } from '@/services/ui/branding.service';
import { IBrandingConfig } from '@/models/branding.model';

interface SearchHeaderProps {
  isScroll?: boolean;
  onClose?: () => void;
}

export default function SearchHeader({ isScroll, onClose }: SearchHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  const [branding, setBranding] = useState<IBrandingConfig | null>(null);

  // Utility to check if a date string is valid
  const isValidDate = (dateString: string | null) => {
    const date = dateString ? new Date(dateString) : null;
    return date instanceof Date && !isNaN(date.getTime());
  };

  // Initialize with default values
  const [passengerCount, setPassengerCount] = useState<number>(DEFAULT_NUM_PASSENGERS);
  const [vehicleCount, setVehicleCount] = useState<number>(DEFAULT_NUM_VEHICLES);
  const [bookingType, setBookingType] = useState<string>(DEFAULT_BOOKING_TYPE);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>(new Date());
  const [selectedOriginPort, setSelectedOriginPort] = useState<IPort | undefined>();
  const [selectedDestinationPort, setSelectedDestinationPort] = useState<IPort | undefined>();
  const [ports, setPorts] = useState<IPort[] | undefined>([]);
  const [destinationPorts, setDestinationPorts] = useState<IPort[]>([]);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const themeSettings = useThemeSettings();

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typically md breakpoint in Tailwind
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const allPorts = await getPorts();
        setPorts(allPorts);

        // Pre-fill Origin Port if query param exists
        const originCode = searchParams.get('origin_code');
        if (originCode) {
          const foundPort = allPorts?.find((port) => port.code === originCode);
          if (foundPort) setSelectedOriginPort(foundPort);
        } else {
          // Fallback for ID if code is missing (backward compatibility or direct ID usage)
          const originPortId = searchParams.get('srcPortId');
          if (originPortId) {
            const foundPort = allPorts?.find((port) => port.id.toString() === originPortId);
            if (foundPort) setSelectedOriginPort(foundPort);
          }
        }
      } catch (error) {
        console.error('Failed to fetch ports:', error);
      }
    };

    fetchPorts();
  }, [searchParams]);

  useEffect(() => {
    const fetchBranding = async () => {
      const config = await getBrandingConfig();
      setBranding(config);
    };

    fetchBranding();
  }, []);

  useEffect(() => {
    const fetchDestinationPorts = async () => {
      if (selectedOriginPort) {
        try {
          const destPorts = await getDestinationPortsByOrigin(selectedOriginPort.code);

          // Filter ports to get full objects with IDs
          // Note: destPorts from service has code and name, but might not have ID if the API doesn't return it.
          // However, we have 'ports' state which has all ports.
          // Let's filter 'ports' based on the codes.
          const validDestCodes = new Set(destPorts.map(p => p.code));
          const availableDestPorts = ports?.filter(port => validDestCodes.has(port.code)) ?? [];

          setDestinationPorts(availableDestPorts);

          // Pre-fill Destination Port if query param exists
          const destinationCode = searchParams.get('destination_code');
          if (destinationCode) {
            const foundPort = availableDestPorts.find((port) => port.code === destinationCode);
            if (foundPort) setSelectedDestinationPort(foundPort);
          } else {
            // Fallback
            const destinationPortId = searchParams.get('destPortId');
            if (destinationPortId) {
              const foundPort = availableDestPorts.find((port) => port.id.toString() === destinationPortId);
              if (foundPort) setSelectedDestinationPort(foundPort);
            }
          }
        } catch (error) {
          console.error('Failed to fetch destination ports:', error);
        }
      } else {
        setDestinationPorts([]);
      }
    };

    fetchDestinationPorts();
  }, [selectedOriginPort, searchParams]);

  useEffect(() => {
    setPassengerCount(parseInt(searchParams.get('passenger_count') || searchParams.get('passengerCount') || DEFAULT_NUM_PASSENGERS.toString(), 10));
    setVehicleCount(parseInt(searchParams.get('vehicle_count') || searchParams.get('vehicleCount') || DEFAULT_NUM_VEHICLES.toString(), 10));
    setBookingType(searchParams.get('bookingType') ? searchParams.get('bookingType') + ' Trip' : DEFAULT_BOOKING_TYPE);
    setDepartureDate(
      isValidDate(searchParams.get('departure_date'))
        ? new Date(searchParams.get('departure_date')!)
        : isValidDate(searchParams.get('departureDate'))
          ? new Date(searchParams.get('departureDate')!)
          : new Date()
    );
    // ... return date logic similar if needed, keeping simple for now
    const retDateRaw = searchParams.get('returnDate');
    const depDateRaw = searchParams.get('departure_date') || searchParams.get('departureDate');
    setReturnDate(
      isValidDate(retDateRaw)
        ? new Date(retDateRaw!)
        : isValidDate(depDateRaw)
          ? new Date(depDateRaw!)
          : new Date()
    );
  }, [searchParams]);

  const handleOriginPortSelect = (port: IPort | undefined) => {
    setSelectedOriginPort(port);
    setSelectedDestinationPort(undefined);
  };

  const handleDepartureDateChange: Dispatch<SetStateAction<Date | undefined>> = (value) => {
    if (value instanceof Date) {
      setDepartureDate(value);
      if (bookingType.toLowerCase() === 'round trip' && returnDate && value > returnDate) {
        setReturnDate(undefined);
      }
    }
  };

  const handleReturnDateChange: Dispatch<SetStateAction<Date | undefined>> = (value) => {
    if (value instanceof Date) {
      setReturnDate(value);
    }
  };

  useEffect(() => {
    const isRoundTrip = bookingType?.toLowerCase() === 'round trip';
    const isValid =
      !!selectedOriginPort &&
      !!selectedDestinationPort &&
      !!departureDate &&
      (passengerCount > 0 || vehicleCount > 0) &&
      (!isRoundTrip || !!returnDate);

    setIsFormValid(isValid);
  }, [
    selectedOriginPort,
    selectedDestinationPort,
    departureDate,
    returnDate,
    bookingType,
    passengerCount,
    vehicleCount
  ]);

  const handleSearchClick = () => {
    setError(null); // Reset error state
    setIsLoading(true); // Set loading state to true

    if (!isFormValid) {
      return;
    }

    // Check if vehicleCount is greater than passengerCount
    if (vehicleCount > passengerCount) {
      setError('Vehicle count must be less than or equal to passenger count.');
      return;
    }

    try {
      // Get the dates in correct format for filtering
      const departureDateForFilter = departureDate
        ? new Date(departureDate.getTime() - departureDate.getTimezoneOffset() * 60000).toISOString()
        : undefined;

      const returnDateForFilter = returnDate
        ? new Date(returnDate.getTime() - returnDate.getTimezoneOffset() * 60000).toISOString()
        : undefined;

      // Prepare search values, ensuring number fields are converted to strings
      const searchValues = {
        bookingType: bookingType?.replace('Trip', '').trim() ?? undefined,
        origin_code: selectedOriginPort?.code ?? undefined,
        destination_code: selectedDestinationPort?.code ?? undefined,
        departure_date: departureDate ? departureDate.toISOString() : undefined,
        returnDate:
          bookingType?.toLowerCase() === 'round trip' ? (returnDate ? returnDate.toISOString() : undefined) : undefined,
        passenger_count: passengerCount !== undefined ? passengerCount.toString() : undefined,
        vehicle_count: vehicleCount !== undefined ? vehicleCount.toString() : undefined,
        sort: 'departureDate',
        page: '1'
      };

      // Filter out undefined values to avoid passing empty params
      const queryParams = new URLSearchParams(
        Object.entries(searchValues)
          .filter(([, value]) => value !== undefined) // Filter out undefined values
          .map(([key, value]) => [key, value as string]) // Ensure the values are cast as strings
      ).toString();

      router.push(`/booking/destination?${queryParams}`);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error occurred while searching:', error);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleCancelEdit = () => {
    setIsExpanded(false);
  };

  const renderMobileHeader = () => (
    <div className="bg-white shadow-md">
      {/* Collapsed Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-none">
              {selectedOriginPort?.name || 'Origin'} - {selectedDestinationPort?.name || 'Destination'}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-gray-600">
            <span className="whitespace-nowrap">{departureDate?.toLocaleDateString()}</span>
            {bookingType.toLowerCase() === 'round trip' && returnDate && (
              <>
                <span>-</span>
                <span className="whitespace-nowrap">{returnDate.toLocaleDateString()}</span>
              </>
            )}
            <span>•</span>
            <span className="whitespace-nowrap">
              {passengerCount} {passengerCount === 1 ? 'Adult' : 'Adults'}
            </span>
          </div>
        </div>
        <Button
          variant="default"
          onClick={() => setIsExpanded(true)}
          className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap"
        >
          Edit Search
        </Button>
      </div>

      {/* Expanded Search Form */}
      {isExpanded && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-3 sm:p-4 md:p-6 w-full h-full max-w-full max-h-full overflow-auto">
            <div className="text-xl mb-6 border-b pt-2 pb-4">Search Filters</div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full items-center">
              <TripDropdown value={bookingType} onChange={setBookingType} />
              <PassengerDropdown value={passengerCount} onChange={setPassengerCount} />
              <VehicleDropdown value={vehicleCount} onChange={setVehicleCount} />
              <div className="flex items-center justify-center h-full">
                {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_auto_2fr_2fr_auto] mt-4 sm:mt-5 w-full items-start">
              <PortDropdownFieldset
                legendText="Origin Port"
                onPortSelect={handleOriginPortSelect}
                ports={ports}
                selectedPort={selectedOriginPort}
              />
              <div className="hidden lg:flex items-center justify-center h-[55px]">
                <LuArrowRightLeft className="w-5 h-5" style={{ color: themeSettings?.accent || '#23abff' }} />
              </div>
              <PortDropdownFieldset
                legendText="Destination Port"
                onPortSelect={setSelectedDestinationPort}
                ports={destinationPorts}
                selectedPort={selectedDestinationPort}
                disabled={destinationPorts.length === 0}
              />
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-stretch sm:items-center justify-center h-full">
                <DatePickerFieldset legendText="Departure" date={departureDate} setDate={handleDepartureDateChange} />
                {bookingType.toLowerCase() === 'Round Trip'.toLowerCase() && (
                  <DatePickerFieldset
                    legendText="Return"
                    date={returnDate}
                    setDate={handleReturnDateChange}
                    disableBeforeDate={departureDate}
                  />
                )}
              </div>
              <div className="flex items-end justify-center gap-2 h-full mt-3 sm:mt-0">
                <Button variant="outline" onClick={handleCancelEdit} className="flex-1 sm:flex-none h-[47.5px] text-md">
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={handleSearchClick}
                  disabled={!isFormValid || isLoading}
                  className="flex-1 sm:flex-none h-[47.5px] flex items-center justify-center text-md "
                >
                  <BiSolidShip className="h-5 w-5 text-white" />
                  <span>Search Trip</span>
                  {isLoading && <FiLoader className="ml-2 h-5 w-5 text-white animate-spin" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDesktopHeader = () => (
    <div className="flex flex-row items-center justify-center gap-6 bg-white shadow-md sticky top-0 z-50 p-6">
      {/* Logo and Tagline */}
      <div className="flex flex-col items-center justify-center w-[280px]">
        <div className={isScroll ? 'block' : 'hidden'}>
          {/* <Image
            src={
              branding?.logo?.dark || '/assets/images/ayahay_logo_blue.png'
            }
            alt={branding?.brand_name || 'Ayahay Logo'}
            height={500}
            width={800}
            className={`w-auto object-contain h-[100px]`}
          /> */}
          <p className="mt-2 text-center">Kay Ang Pagsakay, Dapat AYAHAY!</p>
        </div>
      </div>

      <div className="flex-1 w-full z-[12] inset-0 flex items-center justify-center">
        <div className="bg-white w-full max-w-[1920px] mx-auto">
          <div className="grid gap-3 grid-cols-3 w-full items-center">
            <TripDropdown value={bookingType} onChange={setBookingType} />
            <PassengerDropdown value={passengerCount} onChange={setPassengerCount} />
            <VehicleDropdown value={vehicleCount} onChange={setVehicleCount} />
            <div className="flex items-center justify-center h-full">
              {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_1fr_auto_auto] mt-2 w-full items-start">
            <PortDropdownFieldset
              legendText="Origin Port"
              onPortSelect={handleOriginPortSelect}
              ports={ports}
              selectedPort={selectedOriginPort}
            />
            <div className="hidden lg:flex items-center justify-center h-[55px]">
              <LuArrowRightLeft className="w-5 h-5" style={{ color: themeSettings?.accent || '#23abff' }} />
            </div>
            <PortDropdownFieldset
              legendText="Destination Port"
              onPortSelect={setSelectedDestinationPort}
              ports={destinationPorts}
              selectedPort={selectedDestinationPort}
              disabled={destinationPorts.length === 0}
            />
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 items-stretch sm:items-center justify-center h-full">
              <DatePickerFieldset legendText="Departure" date={departureDate} setDate={handleDepartureDateChange} />
              {bookingType.toLowerCase() === 'Round Trip'.toLowerCase() && (
                <DatePickerFieldset
                  legendText="Return"
                  date={returnDate}
                  setDate={handleReturnDateChange}
                  disableBeforeDate={departureDate}
                />
              )}
            </div>
            <div
              className={`flex items-center justify-center sm:justify-start h-[55px] pt-2 ${!isFormValid ? 'cursor-not-allowed' : ''
                }`}
            >
              <Button
                variant="default"
                onClick={handleSearchClick}
                disabled={!isFormValid || isLoading}
                className={`${!isFormValid ? 'cursor-not-allowed' : ''
                  } w-full h-full text-sm flex items-center justify-center gap-2`}
              >
                <BiSolidShip className="h-5 w-5 text-white" />
                <span className="whitespace-nowrap">Search Trip</span>
                {isLoading && <FiLoader className="h-4 w-4 text-white animate-spin" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return isMobile ? renderMobileHeader() : renderDesktopHeader();
}
