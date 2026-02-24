"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface DatePickerPopupProps {
    onDateSelect: (date: Date, label: string) => void;
    onClose: () => void;
}

export default function DatePickerPopup({ onDateSelect, onClose }: DatePickerPopupProps) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const popupRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate next 21 days
    const dates = Array.from({ length: 21 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        return date;
    });

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleDateClick = (date: Date) => {
        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === new Date(today.getTime() + 86400000).toDateString();
        
        let label = date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
        
        if (isToday) label = `Today (${label})`;
        else if (isTomorrow) label = `Tomorrow (${label})`;
        
        onDateSelect(date, label);
    };

    const scrollLeft = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
        }
    };

    const formatDay = (date: Date) => {
        const isToday = date.toDateString() === today.toDateString();
        const isTomorrow = date.toDateString() === new Date(today.getTime() + 86400000).toDateString();
        
        if (isToday) return "Today";
        if (isTomorrow) return "Tmrw";
        return date.toLocaleDateString("en-US", { weekday: "short" });
    };

    return (
        <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-0 right-0 mx-2 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <span className="font-medium text-sm text-gray-700">Select a date</span>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="h-4 w-4 text-gray-500" />
                </button>
            </div>

            {/* Horizontal Date Scroll */}
            <div className="relative py-3 px-2">
                {/* Left Arrow */}
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/90 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4 text-gray-600" />
                </button>

                {/* Scrollable Dates */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide px-6"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {dates.map((date, idx) => {
                        const isToday = date.toDateString() === today.toDateString();
                        
                        return (
                            <button
                                key={idx}
                                onClick={() => handleDateClick(date)}
                                className={`
                                    flex-shrink-0 flex flex-col items-center justify-center
                                    w-14 h-16 rounded-lg transition-all
                                    ${isToday
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 text-gray-700"
                                    }
                                `}
                            >
                                <span className={`text-[10px] font-medium ${isToday ? "text-blue-100" : "text-gray-500"}`}>
                                    {formatDay(date)}
                                </span>
                                <span className="text-lg font-semibold">
                                    {date.getDate()}
                                </span>
                                <span className={`text-[10px] ${isToday ? "text-blue-100" : "text-gray-400"}`}>
                                    {date.toLocaleDateString("en-US", { month: "short" })}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 bg-white/90 rounded-full shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                </button>
            </div>
        </motion.div>
    );
}
