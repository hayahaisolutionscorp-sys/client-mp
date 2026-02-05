'use client';

import DateNavigation from '@/components/booking/destination/DateNavigation';
import TripHeader from '@/components/booking/destination/TripHeader';
import { useCallback, useEffect, useState } from 'react';
import TripCards from '@/components/booking/destination/TripCards';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { useThemeSettings } from '@/hooks/theme-settings';
import { cacheItem } from 'helpers/cache.helpers';
import { Button } from '@/components/ui/Button';
import { getAvailableTrips } from '@/services';
import { SearchAvailableTrips } from '@/types/trip/trip-management';
import { SelectedTrip } from '@/types/trip/selected-trip';
import { PaginatedRequest } from '@/types/common/pagination';
import { ITrip } from '@/models';

export default function TripsSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [departureTrips, setDepartureTrips] = useState<ITrip[]>([]);
  const [returnTrips, setReturnTrips] = useState<ITrip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDepartureCabin, setSelectedDepartureCabin] = useState<SelectedTrip | null>(null);
  const [selectedReturnCabin, setSelectedReturnCabin] = useState<SelectedTrip | null>(null);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<string | null>(
    searchParams.get('filterSpecificDepartureDate')
  );
  const [selectedReturnDate, setSelectedReturnDate] = useState<string | null>(
    searchParams.get('filterSpecificReturnDate')
  );


  const themeSettings = useThemeSettings();

  const cleanSearchQuery = (searchQuery: SearchAvailableTrips): SearchAvailableTrips => {
    const cleaned: Partial<SearchAvailableTrips> = Object.fromEntries(
      Object.entries(searchQuery).filter(([, value]) => value != null && value !== '')
    );

    return cleaned as SearchAvailableTrips;
  };

  useEffect(() => {
    // Update selected dates when search parameters change
    setSelectedDepartureDate(searchParams.get('filterSpecificDepartureDate'));
    setSelectedReturnDate(searchParams.get('filterSpecificReturnDate'));
  }, [searchParams]);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedDepartureCabin(null);
    setSelectedReturnCabin(null);
    setDepartureTrips([]);
    setReturnTrips([]);

    try {
      const searchQuery: SearchAvailableTrips = {
        tripIds: searchParams.get('tripIds') ?? undefined,
        srcPortId: searchParams.get('srcPortId') ? parseInt(searchParams.get('srcPortId')!, 10) : 0,
        destPortId: searchParams.get('destPortId') ? parseInt(searchParams.get('destPortId')!, 10) : 0,
        origin_code: searchParams.get('origin_code') ?? undefined,
        destination_code: searchParams.get('destination_code') ?? undefined,
        departureDate: searchParams.get('departure_date') ?? '',
        passengerCount: searchParams.get('passenger_count') ? parseInt(searchParams.get('passenger_count')!, 10) : 1,
        vehicleCount: searchParams.get('vehicle_count') ? parseInt(searchParams.get('vehicle_count')!, 10) : 0,
        cabinIds: searchParams.get('cabinIds') ?? undefined,
        cabinTypes: searchParams.get('cabinTypes') ?? undefined,
        shippingLineIds: searchParams.get('shippingLineIds') ?? undefined,
        sort: searchParams.get('sort') ?? 'departureDate',
        filterSpecificDate:
          searchParams.get('filterSpecificDepartureDate') ?? searchParams.get('departure_date') ?? undefined,
        filterDepartureDateTime: searchParams.get('filterDepartureDateTime') ?? undefined
      };

      const pagination: PaginatedRequest = {
        page: 1 // Reset to page 1 on new search
      };

      const cleanedSearchDepartureQuery = cleanSearchQuery(searchQuery);

      const availableDepartureTrips = await getAvailableTrips(undefined, cleanedSearchDepartureQuery, pagination);
      setDepartureTrips(availableDepartureTrips?.data ?? []);

      if (searchParams.get('returnDate')) {
        // Swap origin/dest for return trip
        searchQuery.destination_code = searchParams.get('origin_code') ?? undefined;
        searchQuery.origin_code = searchParams.get('destination_code') ?? undefined;
        searchQuery.destPortId = searchParams.get('srcPortId') ? parseInt(searchParams.get('srcPortId')!, 10) : 0;
        searchQuery.srcPortId = searchParams.get('destPortId') ? parseInt(searchParams.get('destPortId')!, 10) : 0;
        searchQuery.departureDate = searchParams.get('returnDate') ?? '';
        searchQuery.sort = searchParams.get('sortReturn') ?? 'departureDate';
        searchQuery.filterSpecificDate =
          searchParams.get('filterSpecificReturnDate') ?? searchParams.get('returnDate') ?? undefined;

        const cleanedSearchReturnQuery = cleanSearchQuery(searchQuery);

        const availableReturnTrips = await getAvailableTrips(undefined, cleanedSearchReturnQuery, pagination);
        setReturnTrips(availableReturnTrips?.data ?? []);
      }
    } catch (err) {
      setError('Failed to fetch trips');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleProceed = () => {
    const queryValues = {
      departureTripId: selectedDepartureCabin?.tripId?.toString() ?? undefined,
      departureCabinId: selectedDepartureCabin?.cabinId?.toString() ?? undefined,
      returnTripId: selectedReturnCabin?.tripId?.toString() ?? undefined,
      returnCabinId: selectedReturnCabin?.cabinId?.toString() ?? undefined,
      passengerCount: searchParams.get('passengerCount') ?? undefined,
      vehicleCount: searchParams.get('vehicleCount') ?? undefined
    };

    // Filter out undefined values to avoid passing empty params
    const queryParams = new URLSearchParams(
      Object.entries(queryValues)
        .filter(([, value]) => value !== undefined) // Filter out undefined values
        .map(([key, value]) => [key, value as string]) // Ensure the values are cast as strings
    ).toString();

    cacheItem('query-params', queryParams.toString(), 60);

    // Navigate to the passenger details page with the query parameters
    router.push(`/booking/passenger-details?${queryParams.toString()}`);
  };

  const handleReturnDateChange = (date: string | null) => {
    setSelectedReturnDate(date);
  };

  return (
    <>
      {/* Departure Trips */}
      <div className="space-y-2 sm:space-y-4">
        <DateNavigation label="Departure" />

        <TripHeader label="Departure" />

        {loading && (
          <div className="flex items-center justify-center py-6 sm:py-8">
            <FiLoader
              className="animate-spin text-2xl sm:text-4xl"
              style={{ color: themeSettings?.accent || '#23abff' }}
            />
            <span className="ml-3 sm:ml-4 text-base sm:text-lg text-gray-600">Loading trips...</span>
          </div>
        )}
        {error && (
          <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm sm:text-base">
            {error}
          </div>
        )}
        {!loading && departureTrips.length === 0 && (
          <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm sm:text-base text-gray-600">No trips available, Please choose another.</p>
          </div>
        )}
        {!loading && departureTrips.length > 0 && (
          <TripCards
            selectedDate={selectedDepartureDate}
            trips={departureTrips}
            bookingType="Depart"
            firstSelectedCabin={searchParams.get('returnDate') ? selectedReturnCabin : null}
            onCabinSelect={(selected) => setSelectedDepartureCabin(selected)}
          />
        )}

        {/* Return Trips */}
        {searchParams.get('returnDate') && (
          <div className="mt-6 sm:mt-9 space-y-2 sm:space-y-4">
            <hr className="mb-6 sm:mb-8 border-gray-300" />
            <DateNavigation label="Return" onDateChange={handleReturnDateChange} />

            <TripHeader label="Return" />

            {loading && (
              <div className="flex items-center justify-center py-6 sm:py-8">
                <FiLoader
                  className="animate-spin text-2xl sm:text-4xl"
                  style={{ color: themeSettings?.accent || '#23abff' }}
                />
                <span className="ml-3 sm:ml-4 text-base sm:text-lg text-gray-600">Loading trips...</span>
              </div>
            )}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center text-sm sm:text-base">
                {error}
              </div>
            )}
            {!loading && returnTrips.length === 0 && (
              <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm sm:text-base text-gray-600">
                  No return trips available for the selected criteria.
                </p>
              </div>
            )}
            {!loading && returnTrips.length > 0 && (
              <TripCards
                selectedDate={selectedReturnDate}
                trips={returnTrips}
                bookingType="Return"
                firstSelectedCabin={selectedDepartureCabin}
                onCabinSelect={(selected) => setSelectedReturnCabin(selected)}
              />
            )}
          </div>
        )}

        {/* Proceed Button - Fixed at bottom on mobile */}
        {selectedDepartureCabin && (!searchParams.get('returnDate') || selectedReturnCabin) && (
          <div className="fixed bottom-0 left-0 right-0 shadow-lg bg-white px-4 py-6 z-20 min-h-[100px] flex flex-col lg:min-h-0 lg:flex-row lg:justify-between lg:items-center lg:bg-transparent lg:static lg:shadow-none lg:p-0 lg:mt-6">
            {/* Left Side - Text (Visible only on lg) */}
            <div className="text-xs sm:text-sm text-gray-600 hidden lg:block">
              {searchParams.get('returnDate') ? 'Round trip selected' : 'One-way trip selected'}
            </div>

            {/* Right Side - Button */}
            <Button
              variant="default"
              className="w-full text-md lg:text-sm lg:w-auto py-2.5 sm:py-3 px-6 sm:px-8 lg:mt-0"
              onClick={handleProceed}
            >
              Proceed to Booking
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
