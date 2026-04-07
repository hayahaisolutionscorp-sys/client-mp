"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Ship, Clock, Users, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export interface TripData {
    id: string;
    shippingLine: string;
    vesselName: string;
    srcPort: string;
    destPort: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    availableSeats: number;
    tripDate?: string;
}

interface TripCardProps {
    trip: TripData;
    onSelect?: (trip: TripData) => void;
}

export default function TripCard({ trip, onSelect }: TripCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { info } = useToast();

    const formatTime = (time: string) => {
        try {
            const date = new Date(time);
            return date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return time;
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-PH", {
            style: "currency",
            currency: "PHP",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleClick = () => {
        if (onSelect && !isLoading) {
            setIsLoading(true);
            info("Loading trip details...", { title: "Please wait", duration: 8000 });
            onSelect(trip);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all"
        >
            {/* Header with shipping line */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <Ship className="h-4 w-4" />
                    <span className="font-medium text-xs">{trip.shippingLine}</span>
                </div>
                <span className="text-white/80 text-[10px]">{trip.vesselName}</span>
            </div>

            {/* Trip details */}
            <div className="p-3">
                {/* Route and times */}
                <div className="flex items-center justify-between mb-3">
                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">
                            {formatTime(trip.departureTime)}
                        </div>
                        <div className="text-[10px] text-gray-500">{trip.srcPort}</div>
                    </div>

                    <div className="flex-1 mx-3 flex flex-col items-center">
                        <div className="flex items-center gap-1 text-gray-400 text-[10px]">
                            <Clock className="h-3 w-3" />
                            <span>{trip.duration}</span>
                        </div>
                        <div className="w-full flex items-center gap-1 mt-1">
                            <div className="flex-1 h-[2px] bg-gray-200 rounded" />
                            <ArrowRight className="h-3 w-3 text-blue-500" />
                            <div className="flex-1 h-[2px] bg-gray-200 rounded" />
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-lg font-bold text-gray-800">
                            {formatTime(trip.arrivalTime)}
                        </div>
                        <div className="text-[10px] text-gray-500">{trip.destPort}</div>
                    </div>
                </div>

                {/* Price and seats */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div>
                        <div className="text-xl font-bold text-blue-600">
                            {formatPrice(trip.price)}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Users className="h-3 w-3" />
                            <span>{trip.availableSeats} seats left</span>
                        </div>
                    </div>

                    <button
                        onClick={handleClick}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Loading...
                            </>
                        ) : "Choose Trip"}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// Container component for multiple trip cards
export function TripCardsContainer({
    trips,
    onSelectTrip,
    isLoading = false
}: {
    trips: TripData[];
    onSelectTrip?: (trip: TripData) => void;
    isLoading?: boolean;
}) {
    if (isLoading) {
        return (
            <div className="mt-3 space-y-2">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200 h-32 animate-pulse"
                    >
                        <div className="h-8 bg-gray-200 rounded-t-xl" />
                        <div className="p-3 space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-3/4" />
                            <div className="h-4 bg-gray-100 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (trips.length === 0) {
        return (
            <div className="mt-3 text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">No trips found for this date.</p>
            </div>
        );
    }

    return (
        <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
            {trips.map((trip, index) => (
                <TripCard
                    key={trip.id || index}
                    trip={trip}
                    onSelect={onSelectTrip}
                />
            ))}
        </div>
    );
}
