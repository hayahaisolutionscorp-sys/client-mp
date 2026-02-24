"use client";

import { motion } from "framer-motion";

export interface QuickReplyOption {
    label: string;
    value: string;
    icon?: string;
}

interface QuickReplyButtonsProps {
    options: QuickReplyOption[];
    onSelect: (value: string, label: string) => void;
    disabled?: boolean;
}

export default function QuickReplyButtons({
    options,
    onSelect,
    disabled = false,
}: QuickReplyButtonsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="flex flex-wrap gap-2 mt-2"
        >
            {options.map((option, index) => (
                <motion.button
                    key={option.value}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, delay: index * 0.05 }}
                    onClick={() => onSelect(option.value, option.label)}
                    disabled={disabled}
                    className="px-4 py-2 rounded-full border border-blue-200 bg-white text-blue-600 text-sm font-medium hover:bg-blue-50 hover:border-blue-300 hover:shadow-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                    {option.icon && <span className="mr-1">{option.icon}</span>}
                    {option.label}
                </motion.button>
            ))}
        </motion.div>
    );
}
