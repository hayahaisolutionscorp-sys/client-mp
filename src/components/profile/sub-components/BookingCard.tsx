"use client"

import React from 'react'
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { IBooking } from "@/models"
import { ArrowRight, Ship, Calendar, Tag, Layers } from "lucide-react"

interface BookingCardProps {
    booking: IBooking;
    primaryColor: string;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, primaryColor }) => {
    const router = useRouter();

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
            case 'success':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'cancelled':
            case 'failed':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const depTrips = booking.bookingTrips?.filter(t => t.direction === 'departure') || [];
    const retTrips = booking.bookingTrips?.filter(t => t.direction === 'return') || [];

    const isConnecting = depTrips.length > 1 || retTrips.length > 1;

    const getRouteChain = (trips: any[]) => {
        if (!trips || trips.length === 0) return '';
        const ports = [trips[0].trip.srcPort.name];
        trips.forEach(t => {
            if (t.trip.destPort.name && !ports.includes(t.trip.destPort.name)) {
                ports.push(t.trip.destPort.name);
            } else if (t.trip.destPort.name && ports[ports.length - 1] !== t.trip.destPort.name) {
                // If it's a literal return within the same chain or just same port name but different index
                ports.push(t.trip.destPort.name);
            }
        });
        return ports.join(' → ');
    };

    const depRoute = getRouteChain(depTrips) || 'Route N/A';
    const firstTrip = depTrips[0]?.trip || retTrips[0]?.trip;
    const departureDate = depTrips[0]?.trip?.departureDateIso
        ? format(new Date(depTrips[0].trip.departureDateIso), "MMM d, yyyy • h:mm a")
        : 'Date N/A';

    return (
        <Card
            className="group hover:shadow-md transition-all duration-300 cursor-pointer border-slate-200 overflow-hidden"
            onClick={() => router.push(`/booking/confirmed/${booking.id}`)}
        >
            <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                    {/* Left Section: Status & Type */}
                    <div className="sm:w-1 bg-slate-100 group-hover:bg-primary transition-colors" style={{ backgroundColor: booking.bookingStatus === 'Confirmed' ? primaryColor : undefined }} />

                    <div className="flex-1 p-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {booking.referenceNo}
                                </span>
                                <Badge variant="outline" className={`${getStatusColor(booking.bookingStatus)} border capitalize px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase`}>
                                    {booking.bookingStatus}
                                </Badge>
                                {isConnecting && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-wider">
                                        <Layers className="w-3 h-3 mr-1" />
                                        Connecting
                                    </Badge>
                                )}
                            </div>
                            <div className="text-sm font-bold text-slate-900" style={{ color: primaryColor }}>
                                ₱{booking.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors mt-0.5">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Route</p>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-semibold text-slate-800 break-words line-clamp-2">{depRoute}</p>
                                            {retTrips.length > 0 && (
                                                <div className="flex items-center gap-1.5 mt-1 border-t border-slate-50 pt-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                    <p className="text-[11px] font-medium text-slate-500 italic">Return included</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Departure</p>
                                        <p className="text-sm font-semibold text-slate-800">{departureDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors">
                                        <Ship className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Vessel</p>
                                        <p className="text-sm font-semibold text-slate-800">{firstTrip?.ship?.name || 'MV Ayahay'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600">
                                    <div className="p-2 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Type</p>
                                        <p className="text-sm font-semibold text-slate-800">{booking.bookingType || 'One Way'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Action Section */}
                    <div className="flex items-center justify-center p-4 bg-slate-50/50 border-t sm:border-t-0 sm:border-l border-slate-100 group-hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all group-hover:translate-x-1 duration-300 shadow-sm" style={{ color: primaryColor }}>
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
