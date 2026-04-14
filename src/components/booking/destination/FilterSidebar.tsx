'use client';

import { isEffectiveClientApiMode } from 'constants/api';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useTrips } from '@/context/TripsContext';
import { IShippingLine } from '@/models';

type CabinFilterItem = {
  id: number;
  name: string;
};

interface FilterSidebarProps {
  isModal?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({ isModal, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { departureTrips, returnTrips } = useTrips();

  const [checkedCabins, setCheckedCabins] = useState<Set<number>>(new Set());
  const [checkedShippingLines, setCheckedShippingLines] = useState<Set<number>>(new Set());

  const filters = useMemo(() => {
    const allTrips = [...departureTrips, ...returnTrips];

    // Extract unique cabins
    const cabinMap = new Map<number, CabinFilterItem>();
    allTrips.forEach(trip => {
      trip.availableCabins?.forEach(ac => {
        if (ac.cabinId) {
          cabinMap.set(ac.cabinId, {
            id: ac.cabinId,
            name: ac.cabin?.name || ac.cabinCode || `Cabin ${ac.cabinId}`,
          });
        }
      });
      // Also check segments for cabins
      trip.segments?.forEach(seg => {
        seg.availableCabins?.forEach(ac => {
          if (ac.cabinId) {
            cabinMap.set(ac.cabinId, {
              id: ac.cabinId,
              name: ac.cabin?.name || ac.cabinCode || `Cabin ${ac.cabinId}`,
            });
          }
        });
      });
    });

    // Extract unique shipping lines
    const shippingLineMap = new Map<number, IShippingLine>();
    allTrips.forEach(trip => {
      if (trip.shippingLine) {
        shippingLineMap.set(trip.shippingLine.id, trip.shippingLine);
      }
      trip.segments?.forEach(seg => {
        if (seg.shippingLine) {
          shippingLineMap.set(seg.shippingLine.id, seg.shippingLine);
        }
      });
    });

    return {
      cabins: Array.from(cabinMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
      shippingLines: Array.from(shippingLineMap.values()).filter(line => !line.name.toLowerCase().includes('ayahay'))
    };
  }, [departureTrips, returnTrips]);

  // Sync state with query parameters
  useEffect(() => {
    const selectedCabins =
      searchParams
        .get('cabinIds')
        ?.split(',')
        .map(Number)
        .filter((id) => Number.isFinite(id)) || [];
    const selectedShippingLineIds = searchParams.get('shippingLineIds')?.split(',').map(Number) || [];

    setCheckedCabins(new Set(selectedCabins));
    setCheckedShippingLines(new Set(selectedShippingLineIds));
  }, [searchParams]);

  const resetFilters = () => {
    setCheckedCabins(new Set());
    setCheckedShippingLines(new Set());

    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.delete('cabinIds');
    queryParams.delete('cabinTypes');
    queryParams.delete('shippingLineIds');
    queryParams.delete('filterDepartureDateTime');
    router.push(`/booking/destination?${queryParams.toString()}`);
  };

  const handleCabinChange = (id: number) => {
    setCheckedCabins((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShippingLineChange = (id: number) => {
    setCheckedShippingLines((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const cleanQueryParams = (queryParams: URLSearchParams) => {
    for (const [key, value] of queryParams.entries()) {
      if (value === 'undefined' || value === '') {
        queryParams.delete(key);
      }
    }
  };

  const handleApplyFilters = () => {
    const selectedCabinIds = Array.from(checkedCabins);
    const selectedShippingLineIds = Array.from(checkedShippingLines);

    const queryParams = new URLSearchParams(searchParams.toString());

    if (selectedCabinIds.length > 0) {
      queryParams.set('cabinIds', selectedCabinIds.join(','));
    } else {
      queryParams.delete('cabinIds');
      queryParams.delete('cabinTypes');
    }

    if (selectedShippingLineIds.length > 0) {
      queryParams.set('shippingLineIds', selectedShippingLineIds.join(','));
    } else {
      queryParams.delete('shippingLineIds');
    }

    // Explicitly delete filterDepartureDateTime as it's no longer used
    queryParams.delete('filterDepartureDateTime');

    cleanQueryParams(queryParams);
    router.push(`/booking/destination?${queryParams.toString()}`);

    if (isModal && onClose) {
      onClose();
    }
  };

  const containerClasses = isModal ? 'w-full h-full overflow-y-auto bg-white' : 'w-72 bg-white rounded-lg shadow-md';

  return (
    <div className={containerClasses}>
      <div
        className={`${isModal ? 'sticky top-0 bg-white border-b border-gray-200 z-10' : ''
          } px-6 py-4 flex items-center justify-between`}
      >
        <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        {isModal && onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="px-6 py-4 space-y-6">
        {/* Accommodation Section */}
        {filters.cabins.length > 0 && (
          <div>
            <h4 className="font-bold text-base text-gray-800 mb-3">Accommodation</h4>
            <div className="space-y-3">
              {filters.cabins.map((cabin) => (
                <div key={cabin.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${isModal ? 'modal-' : ''}${cabin.id}`}
                    checked={checkedCabins.has(cabin.id)}
                    onChange={() => handleCabinChange(cabin.id)}
                    className="h-4 w-4 rounded border-gray-300 text-customBlue focus:ring-customBlue"
                    style={{ colorScheme: 'light' }}
                  />
                  <label
                    htmlFor={`${isModal ? 'modal-' : ''}${cabin.id}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {cabin.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {filters.cabins.length > 0 && filters.shippingLines.length > 0 && (
          <div className="border-t border-gray-200" />
        )}

        {/* Shipping Lines Section */}
        {!isEffectiveClientApiMode && filters.shippingLines.length > 0 && (
          <div>
            <h4 className="font-bold text-base text-gray-800 mb-3">Shipping Lines</h4>
            <div className="space-y-3">
              {filters.shippingLines.map((line) => (
                <div key={line.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${isModal ? 'modal-' : ''}${line.name}`}
                    checked={checkedShippingLines.has(line.id)}
                    onChange={() => handleShippingLineChange(line.id)}
                    className="h-4 w-4 rounded border-gray-300 text-customBlue focus:ring-customBlue"
                    style={{ colorScheme: 'light' }}
                  />
                  <label
                    htmlFor={`${isModal ? 'modal-' : ''}${line.name}`}
                    className="text-sm font-medium text-gray-700"
                  >
                    {line.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Buttons Section - Fixed at bottom for modal */}
      <div
        className={`
        ${isModal ? 'sticky mt-auto' : 'mt-2'} 
         bottom-0 border-t border-gray-200 px-6 py-4 flex justify-between gap-4
      `}
      >
        <Button variant="outline" onClick={resetFilters} className={`${isModal ? 'text-md' : 'text-sm'} flex-1`}>
          Reset
        </Button>
        <Button variant="default" onClick={handleApplyFilters} className={`${isModal ? 'text-md' : 'text-sm'} flex-1`}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
