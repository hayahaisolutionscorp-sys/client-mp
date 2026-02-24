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
import { CheckCircle2 } from "lucide-react"
import { useThemeSettings } from "@/hooks/theme-settings"

interface SuccessModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
    buttonText?: string
}

export function SuccessModal({
    isOpen,
    onClose,
    title,
    description,
    buttonText = "Continue"
}: SuccessModalProps) {
    const themeSettings = useThemeSettings()
    const accentColor = themeSettings?.accent || "#23abff"

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[360px] p-5">
                <DialogHeader className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
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
