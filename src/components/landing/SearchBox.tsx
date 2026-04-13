"use client";

import { useState, useEffect, SetStateAction, Dispatch, useRef } from "react";
import { useRouter } from "next/navigation";
import { LuArrowRightLeft } from "react-icons/lu";
import { BiSolidShip } from "react-icons/bi";
import { FiLoader } from "react-icons/fi";

import PortDropdownFieldset from "@/components/booking/destination/PortDropdownFieldset";
import PassengerDropdown from "@/components/booking/destination/PassengerDropdown";
import VehicleDropdown from "@/components/ui/VehicleDropdown";
import TripDropdown from "@/components/booking/destination/TripDropdown";
import DatePickerFieldset from "@/components/ui/DatePickerFieldset";
import { Button } from "@/components/ui/Button";

import { IPort } from "@/models";
import { useThemeSettings } from "@/hooks/theme-settings";
import {
  DEFAULT_BOOKING_TYPE,
  DEFAULT_NUM_VEHICLES,
  DEFAULT_NUM_PASSENGERS,
} from "constants/default";
import { getPorts, getDestinationPortsByOrigin } from "@/services";
import { isEffectiveClientApiMode } from 'constants/api';

const SearchBox: React.FC = () => {
  const router = useRouter();

  const [passengerCount, setPassengerCount] = useState<number>(DEFAULT_NUM_PASSENGERS);
  const [vehicleCount, setVehicleCount] = useState<number>(DEFAULT_NUM_VEHICLES);
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>(new Date());
  const [selectedOriginPort, setSelectedOriginPort] = useState<IPort | undefined>();
  const [selectedDestinationPort, setSelectedDestinationPort] = useState<IPort | undefined>();
  const [destinationPorts, setDestinationPorts] = useState<IPort[] | undefined>([]);
  const [ports, setPorts] = useState<IPort[] | undefined>([]);
  // const [routes, setRoutes] = useState<IRoute[]>([]); // Removed routes state
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    const fetchPortsAndRoutes = async () => {
      try {
        const allPorts = await getPorts();
        setPorts(allPorts);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchPortsAndRoutes();
  }, []);

  useEffect(() => {
    const fetchDestinations = async () => {
      if (selectedOriginPort) {
        // Clear destinations while fetching
        setDestinationPorts([]);

        const destPorts = await getDestinationPortsByOrigin(selectedOriginPort.code);

        // Filter the main ports list using the codes returned from the service
        // This ensures we have the full IPort object with IDs
        const validDestCodes = new Set(destPorts.map(p => p.code));
        const availableDestPorts = ports?.filter(port => validDestCodes.has(port.code)) ?? [];

        setDestinationPorts(availableDestPorts.sort((a, b) => a.name.localeCompare(b.name)));

        // Clear destination if it's no longer valid
        if (selectedDestinationPort && !validDestCodes.has(selectedDestinationPort.code)) {
          setSelectedDestinationPort(undefined);
        }
      } else {
        setDestinationPorts([]);
      }
    };

    fetchDestinations();
  }, [selectedOriginPort, ports, selectedDestinationPort]);

  // Removed old useEffect for fetchDestinationPorts

  useEffect(() => {
    // Validation logic to enable or disable the search button
    const isValid =
      bookingType &&
      selectedOriginPort &&
      selectedDestinationPort &&
      departureDate &&
      (bookingType.toLowerCase() !== "Round Trip".toLowerCase() || (bookingType.toLowerCase() === "Round Trip".toLowerCase() && returnDate));

    setIsFormValid(Boolean(isValid));
  }, [bookingType, selectedOriginPort, selectedDestinationPort, departureDate, returnDate]);

  const handleOriginPortSelect = (port: IPort | undefined) => {
    setSelectedOriginPort(port);
    setSelectedDestinationPort(undefined);
  };

  const handleDepartureDateChange: Dispatch<SetStateAction<Date | undefined>> = (value) => {
    if (value instanceof Date) {
      setDepartureDate(value);
      setReturnDate(bookingType?.toLowerCase() === "Round Trip".toLowerCase() ? value : undefined);
    }
  };

  const handleReturnDateChange: Dispatch<SetStateAction<Date | undefined>> = (value) => {
    if (value instanceof Date) {
      setReturnDate(value);
    }
  };

  const handleSearchClick = () => {
    setError(null); // Reset error state
    setIsLoading(true); // Set loading state to true

    if (!isFormValid) {
      return;
    }

    // Check if vehicleCount is greater than passengerCount
    if (vehicleCount > passengerCount) {
      setError("Vehicle count must be less than or equal to passenger count.");
      return;
    }

    try {
      // Get the dates in correct format for filtering
      const departureDateForFilter = departureDate ?
        new Date(departureDate.getTime() - departureDate.getTimezoneOffset() * 60000).toISOString() : undefined;

      const returnDateForFilter = returnDate ?
        new Date(returnDate.getTime() - returnDate.getTimezoneOffset() * 60000).toISOString() : undefined;

      // Prepare search values, ensuring number fields are converted to strings
      // Prepare search values, ensuring number fields are converted to strings
      const toNoonISO = (d: Date) => {
        const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        return noon.toISOString();
      };

      const searchValues: any = {
        bookingType: bookingType?.replace("Trip", "").trim() ?? undefined,
        departure_date: departureDate ? toNoonISO(departureDate) : undefined,
        returnDate: bookingType?.toLowerCase() === "round trip" ? (returnDate ? toNoonISO(returnDate) : undefined) : undefined,
        passenger_count: passengerCount !== undefined ? passengerCount.toString() : undefined,
        vehicle_count: vehicleCount !== undefined ? vehicleCount.toString() : undefined,
        sort: "departureDate",
        page: "1",
      };

      if (!isEffectiveClientApiMode) {
        if (selectedOriginPort?.province) searchValues.origin_province = selectedOriginPort.province;
        if (selectedOriginPort?.municipality) searchValues.origin_municipality = selectedOriginPort.municipality;
        if (selectedDestinationPort?.province) searchValues.destination_province = selectedDestinationPort.province;
        if (selectedDestinationPort?.municipality) searchValues.destination_municipality = selectedDestinationPort.municipality;

        // Keep codes as fallback/reference for TripsSelector bridging back
        if (selectedOriginPort?.code) searchValues.origin_code = selectedOriginPort.code;
        if (selectedDestinationPort?.code) searchValues.destination_code = selectedDestinationPort.code;
      } else {
        searchValues.origin_code = selectedOriginPort?.code ?? undefined;
        searchValues.destination_code = selectedDestinationPort?.code ?? undefined;
      }

      // Filter out undefined values to avoid passing empty params
      const queryParams = new URLSearchParams(
        Object.entries(searchValues)
          .filter(([, value]) => value !== undefined) // Filter out undefined values
          .map(([key, value]) => [key, value as string]) // Ensure the values are cast as strings
      ).toString();

      router.push(`/booking/destination?${queryParams}`);

    } catch (error) {
      console.error("Error occurred while searching:", error);

    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  // Sticky State
  const [isSticky, setIsSticky] = useState(false);
  const observerRef = useState<HTMLDivElement | null>(null)[1]; // simplified ref callback pattern or use standard ref

  // Actually, let's use a standard ref and useEffect
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the top of the search box is out of view (scrolled past), show sticky
        // We really want to know if the search box is "above" the viewport. 
        // But IntersectionObserver checks visibility. 
        // Better logic: if boundingClientRect.top < 0 and entry.isIntersecting === false

        // Simpler: Place a 'sentry' div above the search box. When it scrolls out of view to the top, activate sticky.
        setIsSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );

    if (topRef.current) {
      observer.observe(topRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Main Search Box */}
      <div
        ref={topRef}
        className={`flex items-center justify-center absolute z-20 inset-0 w-full px-4 
        ${bookingType?.toLowerCase() === "round trip"
            ? "top-[380px]"
            : "top-[330px]"
          } sm:top-[230px] md:top-[340px] lg:top-[600px]`}
      >
        <div className="bg-white rounded-3xl shadow-2xl p-4 w-full h-auto transition-all duration-300 ease-in-out hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] 
          sm:p-6 md:p-8 md:w-[95%] lg:w-[1300px]"
        >
          <div className="space-y-2 md:space-y-3 mb-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-customText">
              Where Do You Want to Go?
            </h2>
            <p className="text-xs sm:text-sm text-customText/80">
              Travel around the Philippines
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3 w-full h-auto items-start">
            <TripDropdown value={bookingType} onChange={setBookingType} />
            <PassengerDropdown value={passengerCount} onChange={setPassengerCount} />
            <VehicleDropdown value={vehicleCount} onChange={setVehicleCount} />
            <div className="col-span-1 sm:col-span-2 md:col-span-1 flex items-center justify-center">
              {error && (
                <p className="text-red-500 text-xs sm:text-sm animate-fadeIn">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="w-full grid gap-3 mt-2 sm:gap-4 grid-cols-1 sm:grid-cols-[2fr_auto_2fr] lg:grid-cols-[1fr_auto_1fr_auto_auto]">
            <PortDropdownFieldset
              legendText="Origin Port"
              onPortSelect={handleOriginPortSelect}
              ports={ports}
              selectedPort={selectedOriginPort}
            />
            <div className="hidden sm:flex items-center justify-center h-[55px]">
              <LuArrowRightLeft
                className="w-5 h-5"
                style={{ color: themeSettings?.accent || "#23abff" }}
              />
            </div>
            <PortDropdownFieldset
              legendText="Destination Port"
              onPortSelect={setSelectedDestinationPort}
              ports={destinationPorts}
              selectedPort={selectedDestinationPort}
              disabled={destinationPorts?.length === 0}
            />
            <div className="hidden lg:flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 md:space-x-4 items-center justify-center h-auto md:h-[55px]">
              <DatePickerFieldset
                legendText="Departure"
                date={departureDate}
                setDate={handleDepartureDateChange}
              />
              {bookingType?.toLowerCase() === "Round Trip".toLowerCase() && (
                <DatePickerFieldset
                  legendText="Return"
                  date={returnDate}
                  setDate={handleReturnDateChange}
                  disableBeforeDate={departureDate}
                />
              )}
            </div>
            <div className={`hidden lg:flex items-center justify-center col-span-1 sm:col-span-2 md:col-span-1 mt-4 sm:mt-0 h-[55px] pt-2 ${!isFormValid ? "cursor-not-allowed" : ""}`}>
              <Button
                variant="default"
                onClick={handleSearchClick}
                disabled={!isFormValid || isLoading}
                className={`${!isFormValid ? "bg-gray-400" : ""
                  } text-white px-4 py-3 rounded-lg w-full h-[50px] text-md lg:text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:hover:bg-gray-400`}>
                <BiSolidShip className="h-5 w-5 text-white" />
                <span>Search Trip</span>
                {isLoading && (
                  <FiLoader className="h-5 w-5 text-white animate-spin" />
                )}
              </Button>
            </div>
          </div>
          <div className="w-full grid grid-cols-1 gap-4 mt-3 sm:mt-6 md:grid-cols-[2fr_auto] lg:hidden">
            <div className="flex flex-col space-y-3 sm:gap-4 sm:space-y-0 sm:flex-row items-center justify-center ">
              <DatePickerFieldset
                legendText="Departure"
                date={departureDate}
                setDate={handleDepartureDateChange}
              />
              {bookingType?.toLowerCase() === "Round Trip".toLowerCase() && (
                <DatePickerFieldset
                  legendText="Return"
                  date={returnDate}
                  setDate={handleReturnDateChange}
                  disableBeforeDate={departureDate}
                />
              )}
            </div>
            <div className={`flex items-center justify-center mt-2 mb-4 ${!isFormValid ? "cursor-not-allowed" : ""}`}>
              <Button
                variant="default"
                onClick={handleSearchClick}
                disabled={!isFormValid || isLoading}
                className={`${!isFormValid ? "bg-gray-400" : ""
                  } text-white px-4 py-3 rounded-lg w-full h-[50px] text-md lg:text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:hover:bg-gray-400`}>
                <BiSolidShip className="h-5 w-5 text-white" />
                <span>Search Trip</span>
                {isLoading && (
                  <FiLoader className="h-5 w-5 text-white animate-spin" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Search Bar - Only Visible when Main is scrolled past */}
      <div
        className={`hidden md:block fixed top-0 left-0 right-0 bg-white z-[60] shadow-lg transition-transform duration-300 ease-in-out ${isSticky ? 'translate-y-0' : '-translate-y-full'
          }`}
      >
        <div className="container mx-auto px-4 py-4 lg:max-w-[1400px]">
          {/* Row 1: Trip Type Radios */}
          <div className="flex items-center gap-6 mb-3 px-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stickyTripType"
                checked={bookingType?.toLowerCase() !== "Round Trip".toLowerCase()}
                onChange={() => setBookingType("Single Trip")}
                className="w-4 h-4"
                style={{ accentColor: themeSettings?.accent || "#23abff", colorScheme: "light" }}
              />
              <span className="text-sm font-bold text-customText">Single Trip</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stickyTripType"
                checked={bookingType?.toLowerCase() === "Round Trip".toLowerCase()}
                onChange={() => setBookingType("Round Trip")}
                className="w-4 h-4"
                style={{ accentColor: themeSettings?.accent || "#23abff", colorScheme: "light" }}
              />
              <span className="text-sm font-bold text-customText">Round Trip</span>
            </label>
          </div>

          {/* Row 2: Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_auto_1.5fr_1.5fr_1.5fr_auto] gap-3 items-center">
            <PortDropdownFieldset
              legendText="Origin Port"
              onPortSelect={handleOriginPortSelect}
              ports={ports}
              selectedPort={selectedOriginPort}
            />

            <div className="hidden md:flex items-center justify-center">
              <LuArrowRightLeft
                className="w-4 h-4"
                style={{ color: themeSettings?.accent || "#23abff" }}
              />
            </div>

            <PortDropdownFieldset
              legendText="Destination Port"
              onPortSelect={setSelectedDestinationPort}
              ports={destinationPorts}
              selectedPort={selectedDestinationPort}
              disabled={destinationPorts?.length === 0}
            />

            {/* Combined Date Section for Layout Simplicity if needed, or kept separate */}
            <div className="flex gap-2">
              <DatePickerFieldset
                legendText="Depart"
                date={departureDate}
                setDate={handleDepartureDateChange}
              />
              {bookingType?.toLowerCase() === "Round Trip".toLowerCase() && (
                <DatePickerFieldset
                  legendText="Return"
                  date={returnDate}
                  setDate={handleReturnDateChange}
                  disableBeforeDate={departureDate}
                />
              )}
            </div>

            {/* Passengers (Reuse existing component, assume it fits row) */}
            <PassengerDropdown value={passengerCount} onChange={setPassengerCount} />

            <Button
              variant="default"
              onClick={handleSearchClick}
              disabled={!isFormValid || isLoading}
              className={`${!isFormValid ? "bg-gray-400" : ""
                } text-white px-6 py-2 rounded-lg h-[55px] font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap`}
            >
              <BiSolidShip className="h-4 w-4" />
              Search Trip
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchBox;