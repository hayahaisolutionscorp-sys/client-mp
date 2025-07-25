'use client';

import { useState, useEffect } from 'react';
import { FaCar, FaShip, FaCheckCircle } from 'react-icons/fa';
import { IoMdPin } from 'react-icons/io';
import { TbPointFilled } from 'react-icons/tb';
import { MdError } from 'react-icons/md';
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
import { getAllShips } from '@/services';
import { SelectedTrip } from '@/types/trip/selected-trip';
import { ITrip, IShip } from '@/models';

interface TripCardProps {
  trips: ITrip[];
  bookingType: string;
  selectedDate: string | null;
  firstSelectedCabin?: SelectedTrip | null;
  onCabinSelect?: (cabin: SelectedTrip | null) => void;
}

export default function TripCards({
  trips,
  bookingType,
  selectedDate,
  firstSelectedCabin,
  onCabinSelect
}: TripCardProps) {
  const [allShips, setAllShips] = useState<IShip[]>([]);
  const [isExpanded, setIsExpanded] = useState<number | null>(null);
  const [selectedCabin, setSelectedCabin] = useState<SelectedTrip | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    const fetchAllShips = async () => {
      try {
        const ships = await getAllShips();
        setAllShips(ships || []);
      } catch (error) {
        console.error('Error fetching ships:', error);
      }
    };

    fetchAllShips();
  }, []);

  const getShipDetailsById = (shipId: number): IShip | null => {
    return allShips.find((s) => s.id === shipId)! || null;
  };

  const toggleDetails = (tripId: number) => {
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
    tripId: number,
    cabinId: number,
    cabinTypeId: number,
    cabinType: string,
    cabinFare: number,
    departureDateIso: string
  ) => {
    if (selectedCabin && selectedCabin.tripId === tripId && selectedCabin.cabinId === cabinId) {
      setSelectedCabin(null); // Deselect the cabin
      setIsExpanded(null); // Collapse the details
      onCabinSelect?.(null); // Notify parent with null
    } else {
      try {
        if (firstSelectedCabin) {
          let departureDate = '';
          let returnDate = '';

          if (bookingType == 'Return') {
            departureDate = firstSelectedCabin?.departureDateIso || '';
            returnDate = departureDateIso || '';
          }

          if (bookingType == 'Depart') {
            departureDate = departureDateIso || '';
            returnDate = firstSelectedCabin?.departureDateIso || '';
          }

          if (isValidTripDates(departureDate, returnDate)) {
            const newCabin = { tripId, cabinId, cabinTypeId, cabinType, cabinFare, departureDateIso };
            setSelectedCabin(newCabin); // Update the state
            setIsExpanded(null); // Collapse the details
            onCabinSelect?.(newCabin); // Notify parent with selected cabin
          }
        } else {
          const newCabin = { tripId, cabinId, cabinTypeId, cabinType, cabinFare, departureDateIso };
          setSelectedCabin(newCabin); // Update the state
          setIsExpanded(null); // Collapse the details
          onCabinSelect?.(newCabin); // Notify parent with selected cabin
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message) {
            setErrorMessage(error.message);
            setIsDialogOpen(true);
          }
        }
      }
    }
  };

  // Filter trips based on selected date
  const filteredTrips = trips.filter((trip) => {
    if (!selectedDate) return true;

    const tripDate = new Date(trip.departureDateIso);
    tripDate.setHours(12, 0, 0, 0);
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(12, 0, 0, 0);

    return tripDate.toDateString() === selectedDateObj.toDateString();
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

        return (
          <div
            key={trip.id}
            className={`relative bg-white border-2 rounded-lg shadow-sm transition-all duration-300 ease-in-out 
                      ${isTripSelected ? 'ring-2 ring-green-500' : 'hover:border-[rgba(var(--border-color),1)]'}`}
            style={
              {
                '--border-color': hexToRgb(themeSettings?.borderColor || '#23abff')
              } as React.CSSProperties
            }
          >
            {/* Selected Trip Indicator */}
            {isTripSelected && (
              <div className="absolute -top-3 -right-3 z-10">
                <FaCheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
              </div>
            )}

            {/* Main Trip Card Content */}
            <div className="p-2 md:p-4">
              {/* Top Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2 sm:mb-4">
                {/* Vehicle Slots & Selected Cabin */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center px-3 py-1 bg-green-50 font-semibold text-green-600 border rounded-full text-sm">
                    <FaCar className="mr-2" />
                    <span>{trip.availableVehicleCapacity} Vehicle Slots</span>
                  </div>
                  {selectedCabin && selectedCabin.tripId === trip.id && (
                    <div className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm">
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
                        '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
                      } as React.CSSProperties
                    }
                  >
                    {bookingType}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {toPhilippinesTime(trip.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)}
                  </span>
                  <div className="flex items-center text-gray-700">
                    <FaShip className="mr-2" style={{ color: themeSettings?.iconColor || '#051036' }} />
                    <span className="text-sm font-medium">{getShipDetailsById(trip.shipId)?.name || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Journey Details */}
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr_150px] gap-6 items-center">
                {/* Shipping Line Logo */}
                <div className="hidden md:flex justify-center">
                  <Image
                    src={`${SHIPPING_LINE_LOGO}${trip.shippingLine?.logoFilename}`}
                    alt="Shipping Company Logo"
                    width={200}
                    height={500}
                    className="w-auto h-[100px] object-contain"
                  />
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

                  {/* Journey Line */}
                  <div className="flex-1 max-w-[200px] mx-4">
                    <div className="flex items-center justify-center space-x-2">
                      <FaShip className="flex-shrink-0" style={{ color: themeSettings?.iconColor || '23abff' }} />
                      <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                      <IoMdPin className="text-green-500 flex-shrink-0" />
                    </div>
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
                    {selectedCabin && selectedCabin.tripId === trip.id
                      ? formatCurrency(selectedCabin.cabinFare)
                      : trip.availableCabins?.length
                      ? formatCurrency(Math.min(...trip.availableCabins.map((cabin) => cabin.adultFare)))
                      : 'N/A'}
                  </p>
                  <Button
                    variant={selectedCabin || isTripExpanded ? 'destructive' : 'default'}
                    onClick={() => toggleDetails(trip.id)}
                    className="w-full px-6 py-2 text-md md:text-sm md:w-auto"
                  >
                    {selectedCabin ? 'Unselect' : isTripExpanded ? 'Close' : 'Select'}
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
                    const isCabinSelected =
                      selectedCabin?.cabinId === cabinData.cabinId && selectedCabin.tripId === trip.id;

                    return (
                      <div
                        key={cabinData.cabinId}
                        className={`bg-white rounded-lg p-4 border-2 transition-all ${
                          isCabinSelected
                            ? 'ring-2 ring-green-500'
                            : 'border-gray-200 hover:border-[rgba(var(--border-color),1)]'
                        }`}
                        style={
                          {
                            '--border-color': hexToRgb(themeSettings?.borderColor || '#23abff')
                          } as React.CSSProperties
                        }
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{cabin?.cabinType?.name || 'N/A'}</h4>
                          <div className="flex items-center space-x-2 text-sm">
                            <Image
                              src="/assets/images/seats_icon.svg"
                              alt="Seats"
                              width={50}
                              height={50}
                              className="w-4 h-4"
                            />
                            <span className="text-blue-600">{cabinData.availablePassengerCapacity} seats left</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="text-sm text-gray-600">
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Comfortable seating arrangement</li>
                              <li>Access to deck area</li>
                              <li>Basic amenities included</li>
                            </ul>
                          </div>

                          <div className="flex items-center justify-between pt-4">
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(cabinData.adultFare)}</p>
                            <Button
                              variant={isCabinSelected ? 'outline' : 'default'}
                              onClick={() =>
                                handleCabinSelection(
                                  trip.id,
                                  cabinData.cabinId,
                                  cabinData.cabin?.cabinTypeId || 0,
                                  cabin?.cabinType?.name || 'N/A',
                                  cabinData.adultFare,
                                  trip.departureDateIso
                                )
                              }
                              className="px-6 py-2 text-md lg:text-sm"
                            >
                              {isCabinSelected ? 'Selected' : 'Choose'}
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
                      '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
                    } as React.CSSProperties
                  }
                >
                  <Image src="/assets/images/ship-icon.png" alt="Ship Info" width={50} height={50} className="mr-2" />
                  <div className="flex items-center">
                    <span>Seating arrangements may vary by vessel.</span>
                    <AiOutlineInfoCircle
                      className="ml-1 mt-[2px]"
                      style={{ color: themeSettings?.iconColor || '#23abff' }}
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
