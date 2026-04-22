'use client';

import DateNavigation from '@/components/booking/destination/DateNavigation';
import TripHeader from '@/components/booking/destination/TripHeader';
import { useCallback, useEffect, useState, useMemo } from 'react';
import TripCards from '@/components/booking/destination/TripCards';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';
import { useThemeSettings } from '@/hooks/theme-settings';
import { cacheItem } from 'helpers/cache.helpers';
import { Button } from '@/components/ui/Button';
import { getAvailableTrips } from '@/services/shipping-line/trip.service';
import { SearchAvailableTrips } from '@/types/trip/trip-management';
import { SelectedTrip } from '@/types/trip/selected-trip';
import { PaginatedRequest } from '@/types/common/pagination';
import { ITrip } from '@/models';
import { useTrips } from '@/context/TripsContext';
import { toCanonicalDate } from 'helpers/date.helpers';

export default function TripsSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [departureTrips, setDepartureTripsState] = useState<ITrip[]>([]);
  const [returnTrips, setReturnTripsState] = useState<ITrip[]>([]);
  const { setDepartureTrips, setReturnTrips } = useTrips();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDepartureCabin, setSelectedDepartureCabin] = useState<SelectedTrip | null>(null);
  const [selectedReturnCabin, setSelectedReturnCabin] = useState<SelectedTrip | null>(null);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<string | null>(
    toCanonicalDate(searchParams.get('filterSpecificDepartureDate') || searchParams.get('departure_date') || searchParams.get('departureDate'))
  );
  const [selectedReturnDate, setSelectedReturnDate] = useState<string | null>(
    toCanonicalDate(searchParams.get('filterSpecificReturnDate') || searchParams.get('return_date') || searchParams.get('returnDate'))
  );
  const [isNavigating, setIsNavigating] = useState(false);


  const themeSettings = useThemeSettings();

  // 1. Define Fetch Parameters (these trigger a network request)
  const fetchParamsKey = useMemo(() => {
    const keys = [
      'origin_code', 'destination_code',
      'departure_date', 'departureDate', 'filterSpecificDepartureDate',
      'return_date', 'returnDate', 'filterSpecificReturnDate',
      'passenger_count', 'vehicle_count', 'commodity_id',
      'srcPortId', 'destPortId', 'tripIds'
    ];
    return keys.map(k => `${k}=${searchParams.get(k)}`).join('&');
  }, [searchParams]);

  const cleanSearchQuery = (searchQuery: SearchAvailableTrips): SearchAvailableTrips => {
    const cleaned: Partial<SearchAvailableTrips> = Object.fromEntries(
      Object.entries(searchQuery).filter(([, value]) => value != null && value !== '')
    );

    return cleaned as SearchAvailableTrips;
  };

  useEffect(() => {
    const departureDate = searchParams.get('filterSpecificDepartureDate') || searchParams.get('departure_date') || searchParams.get('departureDate');
    const returnDate =
      searchParams.get('filterSpecificReturnDate') ||
      searchParams.get('return_date') ||
      searchParams.get('returnDate');

    setSelectedDepartureDate(toCanonicalDate(departureDate));
    setSelectedReturnDate(toCanonicalDate(returnDate));
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
        origin_province: searchParams.get('origin_province') ?? undefined,
        origin_municipality: searchParams.get('origin_municipality') ?? undefined,
        destination_province: searchParams.get('destination_province') ?? undefined,
        destination_municipality: searchParams.get('destination_municipality') ?? undefined,
        departureDate: searchParams.get('filterSpecificDepartureDate') ?? searchParams.get('departure_date') ?? '',
        passengerCount: searchParams.get('passenger_count') ? parseInt(searchParams.get('passenger_count')!, 10) : 1,
        vehicleCount: searchParams.get('vehicle_count') ? parseInt(searchParams.get('vehicle_count')!, 10) : 0,
        sort: searchParams.get('sort') ?? 'departureDate',
        filterSpecificDate:
          searchParams.get('filterSpecificDepartureDate') ?? searchParams.get('departure_date') ?? undefined,
        filterDepartureDateTime: searchParams.get('filterDepartureDateTime') ?? undefined,
        commodity_id: searchParams.get('commodity_id') ?? undefined
      };

      const pagination: PaginatedRequest = {
        page: 1 // Reset to page 1 on new search
      };

      const cleanedSearchDepartureQuery = cleanSearchQuery(searchQuery);

      const availableDepartureTrips = await getAvailableTrips(undefined, cleanedSearchDepartureQuery, pagination);
      const depTrips = availableDepartureTrips?.data ?? [];
      setDepartureTripsState(depTrips);
      setDepartureTrips(depTrips);

      if (searchParams.get('return_date') || searchParams.get('returnDate')) {
        // Swap origin/dest for return trip
        searchQuery.destination_code = searchParams.get('origin_code') ?? undefined;
        searchQuery.origin_code = searchParams.get('destination_code') ?? undefined;
        searchQuery.origin_province = searchParams.get('destination_province') ?? undefined;
        searchQuery.origin_municipality = searchParams.get('destination_municipality') ?? undefined;
        searchQuery.destination_province = searchParams.get('origin_province') ?? undefined;
        searchQuery.destination_municipality = searchParams.get('origin_municipality') ?? undefined;
        searchQuery.destPortId = searchParams.get('srcPortId') ? parseInt(searchParams.get('srcPortId')!, 10) : 0;
        searchQuery.srcPortId = searchParams.get('destPortId') ? parseInt(searchParams.get('destPortId')!, 10) : 0;
        searchQuery.departureDate =
          searchParams.get('filterSpecificReturnDate') ??
          searchParams.get('return_date') ??
          searchParams.get('returnDate') ??
          '';
        searchQuery.sort = searchParams.get('sortReturn') ?? 'departureDate';
        searchQuery.filterSpecificDate =
          searchParams.get('filterSpecificReturnDate') ??
          searchParams.get('return_date') ??
          searchParams.get('returnDate') ??
          undefined;

        const cleanedSearchReturnQuery = cleanSearchQuery(searchQuery);

        const availableReturnTrips = await getAvailableTrips(undefined, cleanedSearchReturnQuery, pagination);
        const retTrips = availableReturnTrips?.data ?? [];
        setReturnTripsState(retTrips);
        setReturnTrips(retTrips);
      } else {
        setReturnTripsState([]);
        setReturnTrips([]);
      }
    } catch (err) {
      setError('Failed to fetch trips');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [fetchParamsKey, setDepartureTrips, setReturnTrips]); // Only refetch when core params change

  // 3. Client-side filtering logic
  const filteredDepartureTrips = useMemo(() => {
    const selectedCabinNames = searchParams.get('cabinNames')?.split(',').filter(Boolean) || [];
    const selectedShippingLineIds = searchParams.get('shippingLineIds')?.split(',').map(Number) || [];

    if (selectedCabinNames.length === 0 && selectedShippingLineIds.length === 0) return departureTrips;

    return departureTrips.filter(trip => {
      // Check cabin types across all segments
      const tripCabinNames = new Set<string>();
      trip.availableCabins?.forEach(ac => {
        const name = ac.cabin?.cabin_type_name || ac.cabin?.name || ac.cabinCode;
        if (name) tripCabinNames.add(name);
      });
      trip.segments?.forEach(seg => {
        seg.availableCabins?.forEach(ac => {
          const name = ac.cabin?.cabin_type_name || ac.cabin?.name || ac.cabinCode;
          if (name) tripCabinNames.add(name);
        });
      });

      const matchesCabin = selectedCabinNames.length === 0 ||
        selectedCabinNames.some(name => tripCabinNames.has(name));

      const matchesShippingLine = selectedShippingLineIds.length === 0 ||
        selectedShippingLineIds.includes(trip.shippingLineId);

      return matchesCabin && matchesShippingLine;
    });
  }, [departureTrips, searchParams]);

  const filteredReturnTrips = useMemo(() => {
    const selectedCabinNames = searchParams.get('cabinNames')?.split(',').filter(Boolean) || [];
    const selectedShippingLineIds = searchParams.get('shippingLineIds')?.split(',').map(Number) || [];

    if (selectedCabinNames.length === 0 && selectedShippingLineIds.length === 0) return returnTrips;

    return returnTrips.filter(trip => {
      const tripCabinNames = new Set<string>();
      trip.availableCabins?.forEach(ac => {
        const name = ac.cabin?.cabin_type_name || ac.cabin?.name || ac.cabinCode;
        if (name) tripCabinNames.add(name);
      });
      trip.segments?.forEach(seg => {
        seg.availableCabins?.forEach(ac => {
          const name = ac.cabin?.cabin_type_name || ac.cabin?.name || ac.cabinCode;
          if (name) tripCabinNames.add(name);
        });
      });

      const matchesCabin = selectedCabinNames.length === 0 ||
        selectedCabinNames.some(name => tripCabinNames.has(name));

      const matchesShippingLine = selectedShippingLineIds.length === 0 ||
        selectedShippingLineIds.includes(trip.shippingLineId);

      return matchesCabin && matchesShippingLine;
    });
  }, [returnTrips, searchParams]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const handleProceed = () => {
    setIsNavigating(true);
    const getJoinedIds = (selection: SelectedTrip | null) => {
      if (!selection || !selection.segmentSelections) return selection?.cabinId?.toString();
      return selection.segmentSelections.map(s => s.cabinId).join('|');
    }

    const getJoinedNames = (selection: SelectedTrip | null) => {
      if (!selection || !selection.segmentSelections) return selection?.cabinType;
      return selection.segmentSelections.map(s => s.cabinType).join('|');
    }

    const getShippingLineIds = (selection: SelectedTrip | null): string | undefined => {
      if (!selection) return undefined;
      if (selection.segmentSelections && selection.segmentSelections.length > 1) {
        const ids = selection.segmentSelections
          .map(s => s.shippingLineId ?? selection.shippingLineId)
          .filter((id): id is number => id !== undefined);
        if (ids.length > 0) return ids.join('|');
      }
      return selection.shippingLineId?.toString();
    }

    const queryValues = {
      departureTripId: selectedDepartureCabin?.tripId?.toString() ?? undefined,
      departureCabinName: getJoinedNames(selectedDepartureCabin),
      departureCabinId: getJoinedIds(selectedDepartureCabin),
      returnTripId: selectedReturnCabin?.tripId?.toString() ?? undefined,
      returnCabinName: getJoinedNames(selectedReturnCabin),
      returnCabinId: getJoinedIds(selectedReturnCabin),
      shippingLineId: getShippingLineIds(selectedDepartureCabin),
      passengerCount: searchParams.get('passengerCount') || searchParams.get('passenger_count') || undefined,
      vehicleCount: searchParams.get('vehicleCount') || searchParams.get('vehicle_count') || undefined,
      commodityId: searchParams.get('commodity_id') || searchParams.get('commodityId') || undefined
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
      <div className="space-y-2 sm:space-y-4" id="departure-results">
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
        {!loading && filteredDepartureTrips.length === 0 && (
          <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <p className="text-sm sm:text-base text-gray-600">No trips available, Please choose another.</p>
          </div>
        )}
        {!loading && filteredDepartureTrips.length > 0 && (
          <TripCards
            selectedDate={selectedDepartureDate}
            trips={filteredDepartureTrips}
            bookingType="Depart"
            firstSelectedCabin={searchParams.get('return_date') || searchParams.get('returnDate') ? selectedReturnCabin : null}
            onCabinSelect={(selected) => setSelectedDepartureCabin(selected)}
          />
        )}

        {/* Return Trips */}
        {(searchParams.get('return_date') || searchParams.get('returnDate')) && (
          <div className="mt-6 sm:mt-9 space-y-2 sm:space-y-4" id="return-results">
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
            {!loading && filteredReturnTrips.length === 0 && (
              <div className="p-6 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm sm:text-base text-gray-600">
                  No return trips available for the selected criteria.
                </p>
              </div>
            )}
            {!loading && filteredReturnTrips.length > 0 && (
              <TripCards
                selectedDate={selectedReturnDate}
                trips={filteredReturnTrips}
                bookingType="Return"
                firstSelectedCabin={selectedDepartureCabin}
                onCabinSelect={(selected) => setSelectedReturnCabin(selected)}
              />
            )}
          </div>
        )}

        {/* Proceed Button - Fixed at bottom on mobile */}
        {selectedDepartureCabin && (!(searchParams.get('return_date') || searchParams.get('returnDate')) || selectedReturnCabin) && (
          <div className="fixed bottom-0 left-0 right-0 shadow-lg bg-white px-4 py-6 z-20 min-h-[100px] flex flex-col lg:min-h-0 lg:flex-row lg:justify-between lg:items-center lg:bg-transparent lg:static lg:shadow-none lg:p-0 lg:mt-6">
            {/* Left Side - Text (Visible only on lg) */}
            <div className="text-xs sm:text-sm text-gray-600 hidden lg:block">
              {searchParams.get('return_date') || searchParams.get('returnDate') ? 'Round trip selected' : 'One-way trip selected'}
            </div>

            {/* Right Side - Button */}
            <Button
              variant="default"
              className="w-full text-md lg:text-sm lg:w-auto py-2.5 sm:py-3 px-6 sm:px-8 lg:mt-0 flex items-center justify-center gap-2"
              onClick={handleProceed}
              disabled={isNavigating}
            >
              {isNavigating && <FiLoader className="animate-spin" />}
              Proceed to Booking
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
