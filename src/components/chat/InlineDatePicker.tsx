"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineDatePickerProps {
    minDate?: Date;
    maxDate?: Date;
    onSelect: (date: Date) => void;
    disabled?: boolean;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function InlineDatePicker({
    minDate = new Date(),
    maxDate,
    onSelect,
    disabled = false,
}: InlineDatePickerProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return { firstDay, daysInMonth };
    };

    const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);

    const isDateDisabled = (day: number) => {
        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (date < today) return true;
        if (minDate && date < minDate) return true;
        if (maxDate && date > maxDate) return true;
        return false;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        );
    };

    const handleNextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        );
    };

    const handleSelectDate = (day: number) => {
        if (isDateDisabled(day)) return;

        const date = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth(),
            day
        );
        setSelectedDate(date);
        onSelect(date);
    };

    const formatSelectedDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-full max-w-[320px] mt-2"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePrevMonth}
                    disabled={disabled}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </div>
                <button
                    onClick={handleNextMonth}
                    disabled={disabled}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-gray-400 py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before first day of month */}
                {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-9" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const isDisabled = isDateDisabled(day);
                    const isSelected =
                        selectedDate?.getDate() === day &&
                        selectedDate?.getMonth() === currentMonth.getMonth() &&
                        selectedDate?.getFullYear() === currentMonth.getFullYear();
                    const isToday =
                        new Date().getDate() === day &&
                        new Date().getMonth() === currentMonth.getMonth() &&
                        new Date().getFullYear() === currentMonth.getFullYear();

                    return (
                        <button
                            key={day}
                            onClick={() => handleSelectDate(day)}
                            disabled={isDisabled || disabled}
                            className={cn(
                                "h-9 w-full rounded-lg text-sm font-medium transition-all",
                                isSelected
                                    ? "bg-blue-600 text-white shadow-md"
                                    : isToday
                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                        : isDisabled
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-gray-700 hover:bg-gray-100"
                            )}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Selected Date Display */}
            {selectedDate && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-3 border-t border-gray-100"
                >
                    <div className="text-center text-sm">
                        <span className="text-gray-500">Selected: </span>
                        <span className="font-semibold text-blue-600">
                            {formatSelectedDate(selectedDate)}
                        </span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
