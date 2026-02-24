"use client";

import { motion } from "framer-motion";
import { Ship, Clock, Users, DollarSign, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TripResult {
    id: string;
    shipName: string;
    shippingLine: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    availableSeats: number;
    price: number;
    currency?: string;
}

interface TripResultCardProps {
    trip: TripResult;
    onSelect: (trip: TripResult) => void;
    isSelected?: boolean;
    disabled?: boolean;
}

export default function TripResultCard({
    trip,
    onSelect,
    isSelected = false,
    disabled = false,
}: TripResultCardProps) {
    const formatPrice = (price: number, currency = "PHP") => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency,
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(trip)}
            disabled={disabled}
            className={cn(
                "w-full text-left bg-white rounded-xl border-2 p-4 shadow-sm transition-all",
                isSelected
                    ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-200"
                    : "border-gray-100 hover:border-blue-200 hover:shadow-md",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Ship className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{trip.shipName}</h4>
                        <p className="text-xs text-gray-500">{trip.shippingLine}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-bold text-lg">
                            {formatPrice(trip.price, trip.currency)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">per person</p>
                </div>
            </div>

            {/* Schedule */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 mb-3">
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                        {trip.departureTime}
                    </div>
                    <div className="text-xs text-gray-500">Depart</div>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 px-4">
                    <div className="h-px flex-1 bg-gray-300" />
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {trip.duration}
                    </div>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                        {trip.arrivalTime}
                    </div>
                    <div className="text-xs text-gray-500">Arrive</div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                        {trip.availableSeats > 20
                            ? "20+ seats"
                            : `${trip.availableSeats} seats left`}
                    </span>
                </div>
                <div
                    className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        isSelected ? "text-blue-600" : "text-gray-500"
                    )}
                >
                    {isSelected ? "Selected" : "Select"}
                    <ChevronRight className="h-4 w-4" />
                </div>
            </div>
        </motion.button>
    );
}

// Multiple trip results container
interface TripResultsListProps {
    trips: TripResult[];
    onSelect: (trip: TripResult) => void;
    selectedTripId?: string;
    disabled?: boolean;
}

export function TripResultsList({
    trips,
    onSelect,
    selectedTripId,
    disabled = false,
}: TripResultsListProps) {
    if (trips.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500">
                <Ship className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No trips available for this route.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 mt-2"
        >
            {trips.map((trip, index) => (
                <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <TripResultCard
                        trip={trip}
                        onSelect={onSelect}
                        isSelected={selectedTripId === trip.id}
                        disabled={disabled}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
