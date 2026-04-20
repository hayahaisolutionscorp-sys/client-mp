'use client';

import { useState } from 'react';
import { FaCar, FaShip, FaCheckCircle, FaTruck, FaMotorcycle } from 'react-icons/fa';
import { IoMdPin } from 'react-icons/io';
import { TbPointFilled } from 'react-icons/tb';
import { MdError, MdEventSeat } from 'react-icons/md';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/Dialog';

import { toPhilippinesTime, isValidTripDates } from 'helpers/date.helpers';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { formatCurrency } from 'helpers/general.helpers';
import { DATE_SECONDARY_DEFAULT_FORMAT, TIME_DEFAULT_FORMAT, SHIPPING_LINE_LOGO } from 'constants/index';

import { SelectedTrip } from '@/types/trip/selected-trip';
import { ITrip } from '@/models';
import ConnectingTripCard from './ConnectingTripCard';
import { getTripStatusInfo } from 'helpers/trip.helpers';

interface TripCardProps {
  trips: ITrip[];
  bookingType: string;
  selectedDate: string | null;
  firstSelectedCabin?: SelectedTrip | null;
  onCabinSelect?: (cabin: SelectedTrip | null) => void;
}

const getVehicleCapacityDisplay = (trip: ITrip) => {
  const breakdown = trip.remainingVehicleCapacity || {};
  const fourWheel = breakdown['4w'];
  const count = fourWheel != null
    ? fourWheel.remaining
    : Math.min(...Object.values(breakdown).map(v => v.remaining), Infinity) || 0;
  return { count: isFinite(count) ? count : 0, icon: FaCar };
};

export default function TripCards({
  trips,
  bookingType,
  selectedDate,
  firstSelectedCabin,
  onCabinSelect
}: TripCardProps) {
  const [isExpanded, setIsExpanded] = useState<number | string | null>(null);
  const [selectedCabin, setSelectedCabin] = useState<SelectedTrip | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const themeSettings = useThemeSettings();


  const toggleDetails = (tripId: number | string) => {
    if (selectedCabin) {
      setSelectedCabin(null); // Reset selected cabin when toggling details
      setIsExpanded(null); // Collapse the trip details
      onCabinSelect?.(null); // Notify parent with null
    } else {
      if (isExpanded === tripId) {
        setSelectedCabin(null); // Reset selected cabin when toggling details
        setIsExpanded(null); // Collapse if it's already expanded
        onCabinSelect?.(null); // Notify parent with null
      } else {
        setIsExpanded(tripId); // Expand the selected trip
      }
    }
  };

  const handleCabinSelection = (
    tripId: number | string,
    segmentId: number | string,
    cabinId: number,
    cabinTypeId: number,
    cabinType: string,
    cabinFare: number,
    departureDateIso: string,
    tripType: 'direct' | 'connecting' = 'direct'
  ) => {
    // Check if we are selecting for the currently selected trip
    const isSameTrip = selectedCabin && selectedCabin.tripId === tripId;

    let newSelections = isSameTrip ? [...(selectedCabin.segmentSelections || [])] : [];

    // If not same trip, clear previous selections
    if (!isSameTrip) {
      newSelections = [];
    }

    const trip = trips.find(t => t.id === tripId);

    // Check if this segment is already selected with the same cabin
    const existingSegmentIndex = newSelections.findIndex(s => s.segmentId === segmentId);
    if (existingSegmentIndex >= 0) {
      if (newSelections[existingSegmentIndex].cabinId === cabinId) {
        // Deselecting the same cabin
        newSelections.splice(existingSegmentIndex, 1);
      } else {
        // Changing cabin for this segment
        const segShippingLineId = trip?.segments?.find(s => s.id === segmentId)?.shippingLineId;
        newSelections[existingSegmentIndex] = {
          segmentId, shippingLineId: segShippingLineId, cabinId, cabinTypeId, cabinType, cabinFare, departureDateIso
        };
      }
    } else {
      // New segment selection
      const segShippingLineId = trip?.segments?.find(s => s.id === segmentId)?.shippingLineId;
      newSelections.push({
        segmentId, shippingLineId: segShippingLineId, cabinId, cabinTypeId, cabinType, cabinFare, departureDateIso
      });
    }

    // If no segments selected, clear selectedCabin
    if (newSelections.length === 0) {
      setSelectedCabin(null);
      setIsExpanded(null); // Collapse if no selections left? optional.
      onCabinSelect?.(null);
      return;
    }

    // Calculate total fare
    const totalFare = newSelections.reduce((sum, s) => sum + s.cabinFare, 0);

    // Create new SelectedTrip object
    // For direct trips/backward compat, populate the flat fields from the first selection
    const firstSel = newSelections[0];

    const newSelectedTrip: SelectedTrip = {
      tripId,
      shippingLineId: trip?.shippingLineId,
      totalFare,
      segmentSelections: newSelections,

      // Backward compatibility properties
      cabinId: firstSel?.cabinId,
      cabinTypeId: firstSel?.cabinTypeId,
      cabinType: firstSel?.cabinType,
      cabinFare: firstSel?.cabinFare,
      departureDateIso: firstSel?.departureDateIso
    };

    try {
      // Logic for return trip validation (unchanged mostly, just verify dates)
      if (firstSelectedCabin) {
        let depDate = '';
        let retDate = '';

        // Just use the main trip dates or the specfic segment dates?
        // Usually for return validation we check the overall trip dates.
        // But existing logic uses cabin specific date. let's use the first segment's date for now.

        const currentTripDate = firstSel.departureDateIso;

        if (bookingType == 'Return') {
          depDate = firstSelectedCabin?.departureDateIso || '';
          retDate = currentTripDate || '';
        }

        if (bookingType == 'Depart') {
          depDate = currentTripDate || '';
          retDate = firstSelectedCabin?.departureDateIso || '';
        }

        if (isValidTripDates(depDate, retDate)) {
          setSelectedCabin(newSelectedTrip);
          // Don't auto collapse for connecting trips as user needs to select more segments
          // Collapse only if all segments are selected?
          const trip = trips.find(t => t.id === tripId);
          if (trip && trip.segments.length === newSelections.length) {
            // All segments selected
            setIsExpanded(null);
            onCabinSelect?.(newSelectedTrip);
          } else {
            setSelectedCabin(newSelectedTrip);
            // Allow parent to know partial selection?
            // Usually parent expects full selection. 
            // We might wait until all segments selected? 
            // Or just pass it up and let parent handle validation.
            // The Proceed button usually checks if selections are valid.
            onCabinSelect?.(newSelectedTrip);
          }
        }
      } else {
        setSelectedCabin(newSelectedTrip);
        const trip = trips.find(t => t.id === tripId);
        if (trip && trip.segments.length === newSelections.length) {
          setIsExpanded(null);
        }
        onCabinSelect?.(newSelectedTrip);
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.message) {
          setErrorMessage(error.message);
          setIsDialogOpen(true);
        }
      }
    }
  };

  // Filter trips based on selected date
  const filteredTrips = trips.filter((trip) => {
    if (!selectedDate) return true;

    const tripDatePH = toPhilippinesTime(trip.departureDateIso, 'YYYY-MM-DD');
    const selectedDatePH = toPhilippinesTime(selectedDate, 'YYYY-MM-DD');

    return tripDatePH === selectedDatePH;
  });


  // Filter based on selected cabin (keep existing logic)
  const displayedTrips = selectedCabin
    ? filteredTrips.filter((trip) => trip.id === selectedCabin.tripId)
    : filteredTrips;

  if (!displayedTrips || displayedTrips.length === 0) {
    return (
      <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-sm sm:text-base text-gray-600">No available schedule. Please choose another date</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogHeader>
              {/* Error Icon */}
              <div className="flex items-center space-x-2">
                <MdError className="text-red-500 w-5 h-5" />
                <DialogTitle className="pt-[3px]">Error</DialogTitle>
              </div>
              <DialogDescription>{errorMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="default" className="px-6 py-2 text-md md:text-sm">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      {displayedTrips.map((trip) => {
        const isTripSelected = selectedCabin?.tripId === trip.id;
        const isTripExpanded = isExpanded === trip.id;
        const { count: vehicleCount, icon: VehicleIcon } = getVehicleCapacityDisplay(trip);
        const statusInfo = getTripStatusInfo(trip);

        if (trip.type === 'connecting') {
          return (
            <ConnectingTripCard
              key={trip.id}
              trip={trip}
              isSelected={isTripSelected}
              isExpanded={isTripExpanded || false} // isExpanded is number|string|null. Check if matches.
              selectedCabin={selectedCabin}
              themeSettings={themeSettings}
              bookingType={bookingType}
              onToggleDetails={toggleDetails}
              onSelectCabin={handleCabinSelection}
            />
          );
        }

        return (
          <div
            key={trip.id}
            className={`relative bg-white border-2 rounded-lg shadow-sm transition-all duration-300 ease-in-out
                      ${isTripSelected ? '' : 'hover:border-[rgba(var(--border-color),1)]'}`}
            style={
              {
                '--border-color': hexToRgb(themeSettings?.accent || '#8C1F21'),
                borderColor: isTripSelected ? themeSettings?.accent || '#8C1F21' : undefined,
                boxShadow: isTripSelected ? `0 0 0 1px ${themeSettings?.accent || '#8C1F21'}` : undefined
              } as React.CSSProperties
            }
          >
            {/* Selected Trip Indicator */}
            {isTripSelected && (
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
                {/* Vehicle Slots & Selected Cabin */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className="inline-flex items-center px-3 py-1 font-semibold border rounded-full text-sm"
                    style={{
                      backgroundColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.1)`,
                      color: themeSettings?.accent || '#8C1F21',
                      borderColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.2)`
                    }}
                  >
                    <VehicleIcon className="mr-2" />
                    <span>{vehicleCount} Vehicle Slots</span>
                  </div>
                  {/* Trip Status Badge */}
                  <div
                    className="inline-flex items-center px-3 py-1 font-semibold border rounded-full text-sm"
                    style={{
                      backgroundColor: statusInfo.bgColor,
                      color: statusInfo.textColor,
                      borderColor: statusInfo.bgColor,
                    }}
                  >
                    {statusInfo.label}
                  </div>
                  {selectedCabin && selectedCabin.tripId === trip.id && (
                    <div
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm"
                      style={{
                        backgroundColor: `rgba(${hexToRgb(themeSettings?.accent || '#8C1F21')}, 0.1)`,
                        color: themeSettings?.accent || '#8C1F21'
                      }}
                    >
                      <TbPointFilled className="mr-1" />
                      <span>{selectedCabin.cabinType}</span>
                    </div>
                  )}
                </div>

                {/* Trip Info */}
                <div className="flex flex-wrap items-center gap-3">
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
                  <span className="text-gray-600 text-sm">
                    {toPhilippinesTime(trip.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
                  </span>
                  <div className="flex items-center text-gray-700">
                    <FaShip className="mr-2" style={{ color: themeSettings?.accent || '#051036' }} />
                    <span className="text-sm font-medium">{trip.shipName || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_150px] gap-6 items-center">
                {/* Shipping Line Logo */}
                <div className="hidden md:flex justify-center">
                  {trip.lightLogoUrl && (
                    <Image
                      src={trip.lightLogoUrl}
                      alt="Shipping Company Logo"
                      width={200}
                      height={500}
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
                    <p className="text-sm text-gray-600">{trip.srcPort?.name || trip.srcPortName}</p>
                  </div>

                  {/* Journey Line */}
                  <div className="flex-1 max-w-[200px] mx-4">
                    <div className="flex items-center justify-center space-x-2">
                      <FaShip className="flex-shrink-0" style={{ color: themeSettings?.accent || '#23abff' }} />
                      <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                      <IoMdPin className="flex-shrink-0" style={{ color: themeSettings?.accent || '#22c55e' }} />
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {toPhilippinesTime(trip.arrivalTimeDateIso, TIME_DEFAULT_FORMAT)}
                    </p>
                    <p className="text-sm text-gray-600">{trip.destPort?.name || trip.destPortName}</p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="flex flex-col items-center md:items-end space-y-2">
                  <p className="text-xl font-bold text-gray-900">
                    {selectedCabin && selectedCabin.tripId === trip.id
                      ? formatCurrency(selectedCabin.cabinFare || 0)
                      : trip.availableCabins?.length
                        ? formatCurrency(Math.min(...trip.availableCabins.map((cabin) => cabin.adultFare)))
                        : 'N/A'}
                  </p>
                  <Button
                    variant={selectedCabin || isTripExpanded ? 'destructive' : 'default'}
                    disabled={!statusInfo.isBookable}
                    onClick={() => {
                      if (statusInfo.isBookable) {
                        toggleDetails(trip.id);
                      }
                    }}
                    className="w-full px-6 py-2 text-md md:text-sm md:w-auto"
                  >
                    {selectedCabin ? 'Unselect' : isTripExpanded ? 'Close' : statusInfo.isBookable ? 'Select' : 'Not Available'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Cabin Selection */}
            {isTripExpanded && (
              <div className="border-t-2 border-gray-200 bg-gray-50 p-4 md:p-6 rounded-b-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Your Accommodation:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.availableCabins.map((cabinData) => {
                    const cabin = cabinData.cabin;
                    const cabinLabel = cabin?.name || cabinData.cabinCode || 'N/A';
                    const isCabinSelected =
                      selectedCabin?.cabinId === cabinData.cabinId && selectedCabin.tripId === trip.id;

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
                            boxShadow: isCabinSelected ? `0 0 0 1px ${themeSettings?.accent || '#8C1F21'}` : undefined
                          } as React.CSSProperties
                        }
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{cabinLabel}</h4>
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
                                <li>Access to deck area</li>
                                <li>Basic amenities included</li>
                              </ul>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(cabinData.adultFare)}</p>
                            <Button
                              variant={isCabinSelected ? 'outline' : 'default'}
                              disabled={!statusInfo.isBookable}
                              onClick={() => {
                                if (statusInfo.isBookable) {
                                  handleCabinSelection(
                                    trip.id,
                                    trip.id,
                                    cabinData.cabinId,
                                    cabinData.cabin?.cabinTypeId || 0,
                                    cabinLabel,
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


                {/* Info Footer */}
                <div
                  className="flex items-center mt-4 p-3 bg-[rgba(var(--bg-color),0.05)] rounded-lg text-sm text-customText"
                  style={
                    {
                      '--bg-color': hexToRgb('#FFFFFF')
                    } as React.CSSProperties
                  }
                >
                  <Image src="/assets/images/ship-icon.png" alt="Ship Info" width={50} height={50} className="mr-2" />
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
      })}
    </div>
  );
}
