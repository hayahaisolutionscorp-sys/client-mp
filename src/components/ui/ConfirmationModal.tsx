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
import { AlertTriangle } from "lucide-react"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: "default" | "destructive"
    isLoading?: boolean
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false
}: ConfirmationModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className={`h-16 w-16 ${variant === 'destructive' ? 'bg-red-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center`}>
                        <AlertTriangle className={`h-10 w-10 ${variant === 'destructive' ? 'text-red-600' : 'text-yellow-600'}`} />
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
                <DialogFooter className="flex gap-3 sm:justify-center mt-6">
                    <Button 
                        type="button" 
                        variant="ghost"
                        className="flex-1"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button 
                        type="button" 
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        className="flex-1" 
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
