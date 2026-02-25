'use client';

import { useState } from 'react';
import { FaCar, FaShip, FaCheckCircle } from 'react-icons/fa';
import { IoMdPin } from 'react-icons/io';
import { TbPointFilled } from 'react-icons/tb';
import { MdEventSeat } from 'react-icons/md';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { toPhilippinesTime } from 'helpers/date.helpers';
import { hexToRgb } from 'helpers/theme.helpers';
import { formatCurrency } from 'helpers/general.helpers';
import { DATE_SECONDARY_DEFAULT_FORMAT, TIME_DEFAULT_FORMAT, SHIPPING_LINE_LOGO } from 'constants/index';
import { SelectedTrip, SelectedSegment } from '@/types/trip/selected-trip';
import { ITrip } from '@/models';
import { getTripStatusInfo } from 'helpers/trip.helpers';

interface ConnectingTripCardProps {
    trip: ITrip;
    isSelected: boolean;
    isExpanded: boolean;
    selectedCabin: SelectedTrip | null;
    themeSettings: any;
    bookingType: string;
    onToggleDetails: (tripId: number | string) => void;
    onSelectCabin: (
        tripId: number | string,
        segmentId: number | string,
        cabinId: number,
        cabinTypeId: number,
        cabinType: string,
        cabinFare: number,
        departureDateIso: string,
        tripType: 'direct' | 'connecting'
    ) => void;
}

export default function ConnectingTripCard({
    trip,
    isSelected,
    isExpanded,
    selectedCabin,
    themeSettings,
    bookingType,
    onToggleDetails,
    onSelectCabin
}: ConnectingTripCardProps) {
    const statusInfo = getTripStatusInfo(trip);

    // Internal handle wrapper to pass 'connecting' type
    const handleSelection = (
        segmentId: number | string,
        cabinId: number,
        cabinTypeId: number,
        cabinType: string,
        cabinFare: number,
        departureDateIso: string
    ) => {
        onSelectCabin(
            trip.id,
            segmentId,
            cabinId,
            cabinTypeId,
            cabinType,
            cabinFare,
            departureDateIso,
            'connecting'
        );
    };

    return (
        <div
            className={`relative bg-white border-2 rounded-lg shadow-sm transition-all duration-300 ease-in-out 
                ${isSelected ? '' : 'hover:border-[rgba(var(--border-color),1)]'}`}
            style={
                {
                    '--border-color': hexToRgb(themeSettings?.accent || '#8C1F21'),
                    borderColor: isSelected ? themeSettings?.accent || '#8C1F21' : undefined,
                    boxShadow: isSelected ? `0 0 0 1px ${themeSettings?.accent || '#8C1F21'}` : undefined
                } as React.CSSProperties
            }
        >
            {/* Selected Trip Indicator */}
            {isSelected && (
                <div className="absolute -top-3 -right-3 z-10">
                    <FaCheckCircle
                        className="w-6 h-6 bg-white rounded-full"
                        style={{ color: themeSettings?.accent || '#22c55e' }}
                    />
                </div>
            )}

            {/* Main Trip Card Content */}
            <div className="p-2 md:p-4">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 sm:mb-4">
                    {/* Trip Info & Connecting Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Connecting Badge */}
                        <div
                            className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-800"
                        >
                            Connecting Trip
                        </div>
                        <div
                            className="inline-flex items-center px-3 py-1 font-semibold border rounded-full text-xs"
                            style={{
                                backgroundColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.1)`,
                                color: themeSettings?.accent || '#8C1F21',
                                borderColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.2)`
                            }}
                        >
                            <FaCar className="mr-2" />
                            <span>{trip.availableVehicleCapacity} Vehicle Slots</span>
                        </div>
                        {/* Trip Status Badge */}
                        {(() => {
                            const statusInfo = getTripStatusInfo(trip);
                            return (
                                <div
                                    className="inline-flex items-center px-3 py-1 font-semibold border rounded-full text-xs"
                                    style={{
                                        backgroundColor: statusInfo.bgColor,
                                        color: statusInfo.textColor,
                                        borderColor: statusInfo.bgColor,
                                    }}
                                >
                                    {statusInfo.label}
                                </div>
                            );
                        })()}
                        {isSelected && (
                            <div
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                                style={{
                                    backgroundColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.1)`,
                                    color: themeSettings?.accent || '#8C1F21'
                                }}
                            >
                                <TbPointFilled className="mr-1" />
                                <span>{selectedCabin?.cabinType}</span>
                            </div>
                        )}

                        <div
                            className="inline-flex items-center px-3 py-1 bg-[rgba(var(--bg-color),0.1)] font-semibold text-[rgba(var(--bg-color),1)] border rounded-full text-sm"
                            style={
                                {
                                    '--bg-color': hexToRgb(themeSettings?.primaryColor || '#051036')
                                } as React.CSSProperties
                            }
                        >
                            {bookingType}
                        </div>
                    </div>

                    {/* Date & Duration Info */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-gray-600 text-sm">
                            {toPhilippinesTime(trip.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
                        </span>
                        {/* Total Duration Info */}
                        <span className="text-xs text-gray-500">
                            {Math.floor(trip.totalDurationMinutes / 60)}h {trip.totalDurationMinutes % 60}m
                        </span>
                    </div>
                </div>

                {/* Journey Details */}
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_150px] gap-6 items-center">
                    {/* Shipping Line Logo */}
                    <div className="hidden md:flex justify-center items-center gap-2">
                        {trip.lightLogoUrl && (
                            <Image
                                src={trip.lightLogoUrl}
                                alt="Shipping Company Logo"
                                width={100}
                                height={250}
                                className="w-auto h-[100px] object-contain"
                            />
                        )}
                    </div>

                    {/* Journey Timeline */}
                    <div className="flex items-center justify-between md:justify-center space-x-4">
                        {/* Departure */}
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">
                                {toPhilippinesTime(trip.departureDateIso, TIME_DEFAULT_FORMAT)}
                            </p>
                            <p className="text-sm text-gray-600">{trip.srcPort?.name}</p>
                        </div>

                        {/* Journey Line with Stops */}
                        <div className="flex-1 max-w-[200px] mx-4 flex flex-col items-center">
                            <div className="flex items-center justify-center space-x-2 w-full">
                                <FaShip className="flex-shrink-0" style={{ color: themeSettings?.accent || '#23abff' }} />
                                <div className="w-full border-t-2 border-dashed border-gray-300 relative">
                                    {/* Dots for stops */}
                                    {trip.intermediatePorts?.length > 0 && (
                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400"></div>
                                    )}
                                </div>
                                <IoMdPin className="flex-shrink-0" style={{ color: themeSettings?.accent || '#22c55e' }} />
                            </div>
                            {trip.intermediatePorts?.length > 0 && (
                                <span className="text-[10px] text-gray-500 mt-1">{trip.intermediatePorts.length} Stop(s)</span>
                            )}
                        </div>

                        {/* Arrival */}
                        <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">
                                {toPhilippinesTime(trip.arrivalTimeDateIso, TIME_DEFAULT_FORMAT)}
                            </p>
                            <p className="text-sm text-gray-600">{trip.destPort?.name}</p>
                        </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex flex-col items-center md:items-end space-y-2">
                        <p className="text-xl font-bold text-gray-900">
                            {isSelected
                                ? formatCurrency(selectedCabin?.totalFare || selectedCabin?.cabinFare || 0)
                                : 'View Prices'}
                        </p>
                        <Button
                            variant={isSelected || isExpanded ? 'destructive' : 'default'}
                            disabled={!statusInfo.isBookable}
                            onClick={() => {
                                if (statusInfo.isBookable) {
                                    onToggleDetails(trip.id);
                                }
                            }}
                            className="w-full px-6 py-2 text-md md:text-sm md:w-auto"
                        >
                            {isSelected ? 'Unselect' : isExpanded ? 'Close' : statusInfo.isBookable ? 'Select' : 'Not Available'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Expanded Cabin Selection */}
            {isExpanded && (
                <div className="border-t-2 border-gray-200 bg-gray-50 p-4 md:p-6 rounded-b-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Accommodation for Each Leg:</h3>

                    <div className="mb-6 flex flex-col gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-blue-800">
                            <AiOutlineInfoCircle />
                            <span>Total Layover Time: {Math.floor(trip.totalLayoverMinutes / 60)}h {trip.totalLayoverMinutes % 60}m</span>
                        </div>
                    </div>

                    {/* Segments Loop */}
                    {trip.segments.map((segment, index) => {
                        const isLastSegment = index === trip.segments.length - 1;
                        const segmentSelection = selectedCabin?.segmentSelections?.find(s => s.segmentId === segment.id);

                        return (
                            <div key={segment.id} className="mb-8 last:mb-0">
                                {/* Segment Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-bold ${themeSettings?.primaryColor ? '' : 'bg-blue-100 text-blue-800'
                                                }`}
                                            style={{
                                                backgroundColor: `rgba(${hexToRgb(themeSettings?.primaryColor || '#051036')}, 0.1)`,
                                                color: themeSettings?.primaryColor || '#051036'
                                            }}
                                        >
                                            Trip {index + 1}
                                        </span>
                                        <span className="font-semibold text-gray-700">
                                            {segment.srcPortName} <span className="text-gray-400 mx-1">→</span> {segment.destPortName}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2">
                                            {toPhilippinesTime(segment.departureDateIso, 'MMM DD, h:mm A')}
                                        </span>
                                        {/* Segment Status Badge */}
                                        {(() => {
                                            const statusInfo = getTripStatusInfo({ ...trip, status: segment.status, availableCabins: segment.availableCabins } as any);
                                            return (
                                                <div
                                                    className="inline-flex items-center px-2 py-0.5 font-semibold border rounded-full text-[10px]"
                                                    style={{
                                                        backgroundColor: statusInfo.bgColor,
                                                        color: statusInfo.textColor,
                                                        borderColor: statusInfo.bgColor,
                                                    }}
                                                >
                                                    {statusInfo.label}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Vehicle Slots per Segment */}
                                    <div
                                        className="inline-flex items-center px-3 py-1 font-semibold border rounded-full text-xs self-start sm:self-auto"
                                        style={{
                                            backgroundColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.1)`,
                                            color: themeSettings?.accent || '#8C1F21',
                                            borderColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.2)`
                                        }}
                                    >
                                        <FaCar className="mr-2" />
                                        <span>{segment.availableVehicleCapacity} Vehicle Slots</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {segment.availableCabins.map((cabinData) => {
                                        const cabin = cabinData.cabin;
                                        const isCabinSelected = segmentSelection?.cabinId === cabinData.cabinId;

                                        return (
                                            <div
                                                key={cabinData.cabinId}
                                                className={`bg-white rounded-lg p-4 border-2 transition-all ${isCabinSelected
                                                    ? ''
                                                    : 'border-gray-200 hover:border-[rgba(var(--border-color),1)]'
                                                    }`}
                                                style={
                                                    {
                                                        '--border-color': hexToRgb(themeSettings?.accent || '#8C1F21'),
                                                        borderColor: isCabinSelected ? themeSettings?.accent || '#8C1F21' : undefined,
                                                        boxShadow: isCabinSelected
                                                            ? `0 0 0 1px ${themeSettings?.accent || '#8C1F21'}`
                                                            : undefined
                                                    } as React.CSSProperties
                                                }
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {cabin?.cabinType?.name || 'N/A'}
                                                    </h4>
                                                    <div className="flex items-center space-x-2 text-sm">
                                                        <MdEventSeat
                                                            className="w-4 h-4"
                                                            style={{ color: themeSettings?.accent || '#8C1F21' }}
                                                        />
                                                        <span style={{ color: themeSettings?.accent || '#8C1F21' }}>
                                                            {cabinData.availablePassengerCapacity} seats left
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="text-sm text-gray-600">
                                                        {cabin?.cabin_type_description ? (
                                                            <div className="whitespace-pre-wrap">{cabin.cabin_type_description}</div>
                                                        ) : (
                                                            <ul className="list-disc pl-4 space-y-1">
                                                                <li>Comfortable seating arrangement</li>
                                                                <li>Basic amenities included</li>
                                                            </ul>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-4">
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {formatCurrency(cabinData.adultFare)}
                                                        </p>
                                                        <Button
                                                            variant={isCabinSelected ? 'outline' : 'default'}
                                                            disabled={!statusInfo.isBookable}
                                                            onClick={() => {
                                                                if (statusInfo.isBookable) {
                                                                    handleSelection(
                                                                        segment.id,
                                                                        cabinData.cabinId,
                                                                        cabinData.cabin?.cabinTypeId || 0,
                                                                        cabin?.cabinType?.name || 'N/A',
                                                                        cabinData.adultFare,
                                                                        trip.departureDateIso
                                                                    );
                                                                }
                                                            }}
                                                            className="px-6 py-2 text-md lg:text-sm"
                                                        >
                                                            {isCabinSelected ? 'Selected' : statusInfo.isBookable ? 'Choose' : 'Not Available'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Layover Section */}
                                {!isLastSegment && (
                                    <div className="my-6 flex items-center justify-center">
                                        <div className="w-full h-px bg-gray-300"></div>
                                        <div className="px-4 text-sm text-gray-500 font-medium whitespace-nowrap flex flex-col items-center bg-gray-50 z-10">
                                            <span>Layover at {trip.segments[index + 1]?.srcPortName || trip.segments[index + 1]?.destPortName}</span>
                                        </div>
                                        <div className="w-full h-px bg-gray-300"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Info Footer */}
                    <div
                        className="flex items-center mt-4 p-3 bg-[rgba(var(--bg-color),0.05)] rounded-lg text-sm text-customText"
                        style={
                            {
                                '--bg-color': hexToRgb('#FFFFFF')
                            } as React.CSSProperties
                        }
                    >
                        <Image
                            src="/assets/images/ship-icon.png"
                            alt="Ship Info"
                            width={50}
                            height={50}
                            className="mr-2"
                        />
                        <div className="flex items-center">
                            <span>Seating arrangements may vary by vessel.</span>
                            <AiOutlineInfoCircle
                                className="ml-1 mt-[2px]"
                                style={{ color: themeSettings?.accent || '#23abff' }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
