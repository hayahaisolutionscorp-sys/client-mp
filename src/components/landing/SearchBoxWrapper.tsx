"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { TripSearchWidget } from "@oltek/hayahai-sdk/react";
import type { TripData } from "@oltek/hayahai-sdk/react";
import { DEFAULT_BOOKING_TYPE } from "constants/default";
import { IPort } from "@/models";

type Mode = "form" | "chat";

interface SearchBoxWrapperProps {
    initialTripSearchEnabled?: boolean;
    initialPorts?: IPort[];
}

export default function SearchBoxWrapper({
    initialTripSearchEnabled = true,
    initialPorts = [],
}: SearchBoxWrapperProps) {
    const [mode, setMode] = useState<Mode>("form"); // Default to AI chat
    const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);
    const [tripSearchEnabled, setTripSearchEnabled] = useState<boolean>(initialTripSearchEnabled);
    const [portNameToCode] = useState<Map<string, string>>(
        () => new Map(initialPorts.map((port) => [port.name.toLowerCase(), port.code]))
    );
    const router = useRouter();

    const tenantId = process.env.NEXT_PUBLIC_IS_CLIENT === "true" && process.env.NEXT_PUBLIC_TENANT_ID
        ? Number(process.env.NEXT_PUBLIC_TENANT_ID)
        : 1;

    useEffect(() => {
        (async () => {
            try {
                const configRes = await fetch(`/api/agent-config?tenantId=${tenantId}&type=trip-search`);

                if (configRes.ok) {
                    const data = await configRes.json();
                    const cfg = data?.config;
                    setTripSearchEnabled(cfg?.enabled ?? true);
                }
            } catch {
                // Default to enabled on error
            }
        })();
    }, [tenantId]);

    const handleTripSelect = (trip: TripData) => {
        const depDate = trip.departureTime
            ? new Date(trip.departureTime).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

        const originCode = portNameToCode.get(trip.srcPort.toLowerCase());
        const destCode = portNameToCode.get(trip.destPort.toLowerCase());

        const params = new URLSearchParams({
            departure_date: depDate,
            passenger_count: "1",
            vehicle_count: "0",
            sort: "departureDate",
            page: "1",
        });

        if (originCode) params.set("origin_code", originCode);
        if (destCode) params.set("destination_code", destCode);

        router.push(`/booking/destination?${params.toString()}`);
    };

    return (
        <div
            className={`flex items-center justify-center absolute z-20 inset-0 w-full px-4 
            ${bookingType?.toLowerCase() === "round trip"
                    ? "top-[380px]"
                    : "top-[330px]"
                } sm:top-[230px] md:top-[340px] lg:top-[600px]`}
        >
            <div className="w-full sm:w-[95%] md:w-[95%] lg:w-[1300px]">
                <AnimatePresence mode="wait">
                    {mode === "chat" && tripSearchEnabled ? (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <TripSearchWidget
                                tenantId={process.env.NEXT_PUBLIC_IS_CLIENT === "true" && process.env.NEXT_PUBLIC_TENANT_ID
                                    ? Number(process.env.NEXT_PUBLIC_TENANT_ID)
                                    : undefined}
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
                            <SearchBoxWithToggle
                                onSwitchToChat={() => setMode("chat")}
                                bookingType={bookingType}
                                setBookingType={setBookingType}
                                showChatToggle={tripSearchEnabled}
                                initialPorts={initialPorts}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Wrapper for SearchBox that adds the toggle button
function SearchBoxWithToggle({
    onSwitchToChat,
    bookingType,
    setBookingType,
    showChatToggle = true,
    initialPorts = [],
}: {
    onSwitchToChat: () => void;
    bookingType: string | undefined;
    setBookingType: (value: string | undefined) => void;
    showChatToggle?: boolean;
    initialPorts?: IPort[];
}) {
    return (
        <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-4 w-full h-auto transition-all duration-300 ease-in-out hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] sm:p-6 md:p-8">
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
                    {showChatToggle && (
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
                    )}
                </div>

                {/* Original SearchBox content - import the form parts */}
                <SearchBoxFormContent
                    bookingType={bookingType}
                    setBookingType={setBookingType}
                    initialPorts={initialPorts}
                />
            </div>
        </div>
    );
}

// Extracted form content from SearchBox (simplified inline version)
import { useState as useStateForm, SetStateAction, Dispatch } from "react";
import { LuArrowRightLeft } from "react-icons/lu";
import { BiSolidShip } from "react-icons/bi";
import { FiLoader } from "react-icons/fi";
import PortDropdownFieldset from "@/components/booking/destination/PortDropdownFieldset";
import PassengerDropdown from "@/components/booking/destination/PassengerDropdown";
import VehicleDropdown from "@/components/ui/VehicleDropdown";
import TripDropdown from "@/components/booking/destination/TripDropdown";
import DatePickerFieldset from "@/components/ui/DatePickerFieldset";
import { Button } from "@/components/ui/Button";

import { useThemeSettings } from "@/hooks/theme-settings";
import {
    DEFAULT_NUM_VEHICLES,
    DEFAULT_NUM_PASSENGERS,
} from "constants/default";
import { getPorts, getDestinationPortsByOrigin } from "@/services";

export interface SearchBoxFormContentProps {
    bookingType: string | undefined;
    setBookingType: (value: string | undefined) => void;
    initialPorts?: IPort[];
}

export function SearchBoxFormContent({
    bookingType,
    setBookingType,
    initialPorts = [],
}: SearchBoxFormContentProps) {
    const router = useRouter();

    const [passengerCount, setPassengerCount] = useStateForm<number>(DEFAULT_NUM_PASSENGERS);
    const [vehicleCount, setVehicleCount] = useStateForm<number>(DEFAULT_NUM_VEHICLES);
    const [departureDate, setDepartureDate] = useStateForm<Date | undefined>(new Date());
    const [returnDate, setReturnDate] = useStateForm<Date | undefined>(new Date());
    const [selectedOriginPort, setSelectedOriginPort] = useStateForm<IPort | undefined>();
    const [selectedDestinationPort, setSelectedDestinationPort] = useStateForm<IPort | undefined>();
    const [destinationPorts, setDestinationPorts] = useStateForm<IPort[] | undefined>([]);
    const [ports, setPorts] = useStateForm<IPort[] | undefined>(initialPorts);
    const [isFormValid, setIsFormValid] = useStateForm<boolean>(false);
    const [error, setError] = useStateForm<string | null>(null);
    const [isLoading, setIsLoading] = useStateForm(false);
    const themeSettings = useThemeSettings();

    useEffect(() => {
        if (initialPorts.length > 0) {
            return;
        }

        const fetchPorts = async () => {
            try {
                const allPorts = await getPorts();
                setPorts(allPorts);
            } catch (error) {
                console.error("Failed to fetch ports:", error);
            }
        };

        fetchPorts();
    }, [initialPorts]);

    useEffect(() => {
        const fetchDestinationPorts = async () => {
            if (selectedOriginPort) {
                try {
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
                } catch (error) {
                    console.error("Failed to fetch destination ports:", error);
                }
            } else {
                setDestinationPorts([]);
            }
        };

        fetchDestinationPorts();
    }, [selectedOriginPort, ports, selectedDestinationPort]);

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

        if (!isFormValid) {
            return;
        }

        if (vehicleCount > passengerCount) {
            setError("Vehicle count must be less than or equal to passenger count.");
            return;
        }

        setIsLoading(true);

        try {
            const searchValues = {
                bookingType: bookingType?.replace("Trip", "").trim() ?? undefined,
                origin_code: selectedOriginPort?.code ?? undefined,
                destination_code: selectedDestinationPort?.code ?? undefined,
                departure_date: departureDate ? departureDate.toISOString() : undefined,
                returnDate: bookingType?.toLowerCase() === "round trip" ? (returnDate ? returnDate.toISOString() : undefined) : undefined,
                passenger_count: passengerCount !== undefined ? passengerCount.toString() : undefined,
                vehicle_count: vehicleCount !== undefined ? vehicleCount.toString() : undefined,
                sort: "departureDate",
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
