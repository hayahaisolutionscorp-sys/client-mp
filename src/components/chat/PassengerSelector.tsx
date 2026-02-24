"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Minus, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PassengerCounts {
    adults: number;
    children: number;
    seniors: number;
    pwd: number;
}

interface PassengerSelectorProps {
    initialCounts?: Partial<PassengerCounts>;
    onConfirm: (counts: PassengerCounts) => void;
    disabled?: boolean;
}

const PASSENGER_TYPES = [
    { key: "adults" as const, label: "Adults", sublabel: "18+ years" },
    { key: "children" as const, label: "Children", sublabel: "2-17 years" },
    { key: "seniors" as const, label: "Seniors", sublabel: "60+ years" },
    { key: "pwd" as const, label: "PWD", sublabel: "With ID" },
];

export default function PassengerSelector({
    initialCounts = {},
    onConfirm,
    disabled = false,
}: PassengerSelectorProps) {
    const [counts, setCounts] = useState<PassengerCounts>({
        adults: initialCounts.adults ?? 1,
        children: initialCounts.children ?? 0,
        seniors: initialCounts.seniors ?? 0,
        pwd: initialCounts.pwd ?? 0,
    });

    const totalPassengers = counts.adults + counts.children + counts.seniors + counts.pwd;

    const handleIncrement = (type: keyof PassengerCounts) => {
        if (totalPassengers >= 10) return;
        setCounts((prev) => ({ ...prev, [type]: prev[type] + 1 }));
    };

    const handleDecrement = (type: keyof PassengerCounts) => {
        if (type === "adults" && counts.adults <= 1) return;
        if (counts[type] <= 0) return;
        setCounts((prev) => ({ ...prev, [type]: prev[type] - 1 }));
    };

    const handleConfirm = () => {
        onConfirm(counts);
    };

    const formatSummary = () => {
        const parts = [];
        if (counts.adults > 0) parts.push(`${counts.adults} adult${counts.adults > 1 ? "s" : ""}`);
        if (counts.children > 0) parts.push(`${counts.children} child${counts.children > 1 ? "ren" : ""}`);
        if (counts.seniors > 0) parts.push(`${counts.seniors} senior${counts.seniors > 1 ? "s" : ""}`);
        if (counts.pwd > 0) parts.push(`${counts.pwd} PWD`);
        return parts.join(", ");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-full max-w-[320px] mt-2"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-gray-800">Passengers</span>
                <span className="ml-auto text-sm text-gray-500">{totalPassengers}/10</span>
            </div>

            {/* Passenger Type Rows */}
            <div className="space-y-3">
                {PASSENGER_TYPES.map(({ key, label, sublabel }) => (
                    <div key={key} className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-gray-800 text-sm">{label}</div>
                            <div className="text-xs text-gray-400">{sublabel}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleDecrement(key)}
                                disabled={disabled || (key === "adults" ? counts[key] <= 1 : counts[key] <= 0)}
                                className={cn(
                                    "h-8 w-8 rounded-full border flex items-center justify-center transition-all",
                                    counts[key] > 0 || key === "adults"
                                        ? "border-gray-300 text-gray-600 hover:bg-gray-100"
                                        : "border-gray-200 text-gray-300 cursor-not-allowed"
                                )}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-6 text-center font-semibold text-gray-800">
                                {counts[key]}
                            </span>
                            <button
                                onClick={() => handleIncrement(key)}
                                disabled={disabled || totalPassengers >= 10}
                                className={cn(
                                    "h-8 w-8 rounded-full border flex items-center justify-center transition-all",
                                    totalPassengers < 10
                                        ? "border-blue-300 text-blue-600 hover:bg-blue-50"
                                        : "border-gray-200 text-gray-300 cursor-not-allowed"
                                )}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirm Button */}
            <button
                onClick={handleConfirm}
                disabled={disabled || totalPassengers === 0}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Check className="h-4 w-4" />
                Confirm ({formatSummary()})
            </button>
        </motion.div>
    );
}
