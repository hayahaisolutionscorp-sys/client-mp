"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/Dialog"
import { Button } from "../ui/Button"
import { LogOut } from "lucide-react"

export function SessionExpiredModal() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const handleSessionExpired = () => {
            setIsOpen(true)
        }

        window.addEventListener('session-expired', handleSessionExpired)
        return () => window.removeEventListener('session-expired', handleSessionExpired)
    }, [])

    const handleLogin = () => {
        setIsOpen(false)
        router.replace('/login')
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Prevent closing by clicking outside or pressing escape
            // if we want to force login
            if (!open) return;
            setIsOpen(open)
        }}>
            <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <LogOut className="h-6 w-6 text-red-500" />
                        Session Expired
                    </DialogTitle>
                    <DialogDescription className="text-base pt-2">
                        Your session has expired. Please log in again to continue accessing your account securely.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center mt-6">
                    <Button 
                        type="button" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-lg transition-colors" 
                        onClick={handleLogin}
                    >
                        Go to Login
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
