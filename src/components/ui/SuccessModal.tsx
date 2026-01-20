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
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-gray-900">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-base text-gray-500 max-w-xs mx-auto">
                            {description}
                        </DialogDescription>
                    </div>
                </DialogHeader>
                <DialogFooter className="sm:justify-center mt-6">
                    <Button 
                        type="button" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-lg transition-colors" 
                        onClick={onClose}
                    >
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
