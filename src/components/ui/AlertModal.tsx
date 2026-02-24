"use client"

import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./Dialog"
import { Button } from "./Button"
import { AlertCircle, Info, CheckCircle2, AlertTriangle } from "lucide-react"
import { useThemeSettings } from "@/hooks/theme-settings"
import { hexToRgb } from "helpers/theme.helpers"

export type AlertVariant = "info" | "warning" | "error" | "success"

interface AlertModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
    buttonText?: string
    variant?: AlertVariant
}

export function AlertModal({
    isOpen,
    onClose,
    title,
    description,
    buttonText = "OK",
    variant = "warning"
}: AlertModalProps) {
    const themeSettings = useThemeSettings()
    const accentColor = themeSettings?.accent || "#23abff"

    const getIcon = () => {
        const size = "h-8 w-8"
        switch (variant) {
            case "info":
                return <Info className={`${size} text-blue-600`} />
            case "success":
                return <CheckCircle2 className={`${size} text-green-600`} />
            case "error":
                return <AlertCircle className={`${size} text-red-600`} />
            case "warning":
            default:
                return <AlertTriangle className={`${size} text-yellow-600`} style={{ color: variant === 'warning' ? '#eab308' : accentColor }} />
        }
    }

    const getIconBg = () => {
        switch (variant) {
            case "info":
                return "bg-blue-50"
            case "success":
                return "bg-green-50"
            case "error":
                return "bg-red-50"
            case "warning":
            default:
                return "bg-yellow-50"
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[360px] p-5">
                <DialogHeader className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className={`h-12 w-12 ${getIconBg()} rounded-full flex items-center justify-center`}>
                        {getIcon()}
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 max-w-[280px] mx-auto leading-tight">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="sm:justify-center mt-4">
                    <Button
                        type="button"
                        className="w-full text-white font-semibold py-4 h-auto rounded-lg transition-opacity hover:opacity-90"
                        style={{ backgroundColor: accentColor }}
                        onClick={onClose}
                    >
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
