"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { getMyBookings } from "@/services/booking/booking.service"
import { IBooking } from "@/models"
import { BookingCard } from "./sub-components/BookingCard"
import { useThemeSettings } from "@/hooks/theme-settings"
import { Loader2, Ticket } from "lucide-react"

export const BookingHistoryTab: React.FC = () => {
    const router = useRouter();
    const themeSettings = useThemeSettings();
    const primaryColor = themeSettings?.primary || '#2563eb';

    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookings = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getMyBookings();
            setBookings(data.results);
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
            setError("Something went wrong while fetching your bookings. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">My Bookings</CardTitle>
                        <CardDescription className="text-slate-500 mt-1">View and manage your past and upcoming trips.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" style={{ color: primaryColor }} />
                        <p className="text-slate-500 font-medium tracking-tight">Loading your travel history...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-rose-100 shadow-sm px-6">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                            <Ticket className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2 whitespace-pre-line">{error}</h3>
                        <Button onClick={fetchBookings} variant="outline" className="mt-2">Try Again</Button>
                    </div>
                ) : bookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                primaryColor={primaryColor}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm px-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Ticket className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                        <p className="text-slate-500 max-w-xs mx-auto mb-8">
                            Your travel history will appear here once you've made your first booking.
                        </p>
                        <Button
                            onClick={() => router.push('/')}
                            className="px-8 py-6 h-auto text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Book a trip now
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
