"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import SearchBox from "@/components/landing/SearchBox";
import { TripSearchWidget } from "@oltek/hayahai-sdk/react";
import type { TripData } from "@oltek/hayahai-sdk/react";

type Mode = "form" | "chat";

export default function SearchBoxWrapper() {
    const [mode, setMode] = useState<Mode>("chat"); // Default to AI chat
    const router = useRouter();

    const handleTripSelect = (trip: TripData) => {
        router.push(`/trips/${trip.id}`);
    };

    return (
        <div
            className={`flex items-center justify-center absolute z-10 inset-0 w-full px-4 
      ${mode === "form" ? "top-[330px] sm:top-[210px] md:top-[310px] lg:top-[400px]" : "top-[300px] sm:top-[220px] md:top-[320px] lg:top-[400px]"}`}
        >
            <div className="w-full sm:w-[95%] md:w-[95%] lg:w-[1200px]">
                <AnimatePresence mode="wait">
                    {mode === "chat" ? (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TripSearchWidget
                                tenantId={1}
                                chatApiUrl="/api/chat-booking"
                                routesApiUrl="/api/routes"
                                tripsApiUrl="/api/trips"
                                configApiUrl="/api/agent-config"
                                onSwitchToForm={() => setMode("form")}
                                onTripSelect={handleTripSelect}
                                showFormToggle={true}
                                poweredByText="Powered by AyahAI"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <SearchBoxWithToggle onSwitchToChat={() => setMode("chat")} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Wrapper for SearchBox that adds the toggle button
function SearchBoxWithToggle({ onSwitchToChat }: { onSwitchToChat: () => void }) {
    return (
        <div className="relative">
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8 w-full h-auto transition-all duration-300 ease-in-out hover:shadow-2xl">
                {/* Header with toggle */}
                <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-customText">
                            Where Do You Want to Go?
                        </h2>
                        <p className="text-xs sm:text-sm text-customText/80">
                            Travel around the Philippines
                        </p>
                    </div>
                    <button
                        onClick={onSwitchToChat}
                        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                        </svg>
                        <span className="hidden sm:inline">Ask AyahAI</span>
                    </button>
                </div>

                {/* Original SearchBox content - import the form parts */}
                <SearchBoxFormContent />
            </div>
        </div>
    );
}

// Extracted form content from SearchBox (simplified inline version)
import { useState as useStateForm, useEffect, SetStateAction, Dispatch } from "react";
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
import { getPorts, getTripsDestinationByPortId } from "@/services";

function SearchBoxFormContent() {
    const router = useRouter();

    const [passengerCount, setPassengerCount] = useStateForm<number>(DEFAULT_NUM_PASSENGERS);
    const [vehicleCount, setVehicleCount] = useStateForm<number>(DEFAULT_NUM_VEHICLES);
    const [bookingType, setBookingType] = useStateForm<string | undefined>(DEFAULT_BOOKING_TYPE);
    const [departureDate, setDepartureDate] = useStateForm<Date | undefined>(new Date());
    const [returnDate, setReturnDate] = useStateForm<Date | undefined>(new Date());
    const [selectedOriginPort, setSelectedOriginPort] = useStateForm<IPort | undefined>();
    const [selectedDestinationPort, setSelectedDestinationPort] = useStateForm<IPort | undefined>();
    const [destinationPorts, setDestinationPorts] = useStateForm<IPort[] | undefined>([]);
    const [ports, setPorts] = useStateForm<IPort[] | undefined>([]);
    const [isFormValid, setIsFormValid] = useStateForm<boolean>(false);
    const [error, setError] = useStateForm<string | null>(null);
    const [isLoading, setIsLoading] = useStateForm(false);
    const themeSettings = useThemeSettings();

    useEffect(() => {
        const fetchPorts = async () => {
            try {
                const allPorts = await getPorts();
                setPorts(allPorts);
            } catch (error) {
                console.error("Failed to fetch ports:", error);
            }
        };

        fetchPorts();
    }, []);

    useEffect(() => {
        const fetchDestinationPorts = async () => {
            if (selectedOriginPort) {
                try {
                    const destinations = await getTripsDestinationByPortId(selectedOriginPort.id);
                    setDestinationPorts(destinations);
                } catch (error) {
                    console.error("Failed to fetch destination ports:", error);
                }
            } else {
                setDestinationPorts([]);
            }
        };

        fetchDestinationPorts();
    }, [selectedOriginPort]);

    useEffect(() => {
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
        setError(null);
        setIsLoading(true);

        if (!isFormValid) {
            return;
        }

        if (vehicleCount > passengerCount) {
            setError("Vehicle count must be less than or equal to passenger count.");
            return;
        }

        try {
            const departureDateForFilter = departureDate ?
                new Date(departureDate.getTime() - departureDate.getTimezoneOffset() * 60000).toISOString() : undefined;

            const returnDateForFilter = returnDate ?
                new Date(returnDate.getTime() - returnDate.getTimezoneOffset() * 60000).toISOString() : undefined;

            const searchValues = {
                bookingType: bookingType?.replace("Trip", "").trim() ?? undefined,
                srcPortId: selectedOriginPort?.id ? selectedOriginPort.id.toString() : undefined,
                destPortId: selectedDestinationPort?.id ? selectedDestinationPort.id.toString() : undefined,
                departureDate: departureDate ? departureDate.toISOString() : undefined,
                returnDate: bookingType?.toLowerCase() === "round trip" ? (returnDate ? returnDate.toISOString() : undefined) : undefined,
                passengerCount: passengerCount !== undefined ? passengerCount.toString() : undefined,
                vehicleCount: vehicleCount !== undefined ? vehicleCount.toString() : undefined,
                sortDeparture: "departureDate",
                sortReturn: "departureDate",
                filterSpecificDepartureDate: departureDateForFilter,
                filterSpecificReturnDate: returnDateForFilter,
                page: "1",
            };

            const queryParams = new URLSearchParams(
                Object.entries(searchValues)
                    .filter(([, value]) => value !== undefined)
                    .map(([key, value]) => [key, value as string])
            ).toString();

            router.push(`/booking/destination?${queryParams}`);

        } catch (error) {
            console.error("Error occurred while searching:", error);

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
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
        </>
    );
}
