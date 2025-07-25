'use client';

import { useEffect, useState, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

import DateTimePickerFieldset from '@/components/ui/DateTimePickerFieldset';
import { Filters } from '@/services';

interface FilterSidebarProps {
  filtersPromise: Promise<Filters | undefined>;
  isModal?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({ isModal, onClose, filtersPromise }: FilterSidebarProps) {
  const filters = use(filtersPromise);

  const router = useRouter();
  const searchParams = useSearchParams();

  const [departureDateTime, setDepartureDateTime] = useState<Date>();
  const [checkedCabinTypes, setCheckedCabinTypes] = useState<Set<number>>(new Set());
  const [checkedShippingLines, setCheckedShippingLines] = useState<Set<number>>(new Set());

  const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID;

  // Sync state with query parameters
  useEffect(() => {
    if (filters) {
      const selectedCabinTypes = searchParams.get('cabinTypes')?.split(',').map(Number) || [];
      const selectedShippingLineIds = searchParams.get('shippingLineIds')?.split(',').map(Number) || [];
      const filterDepartureDateTime = searchParams.get('filterDepartureDateTime');

      setCheckedCabinTypes(new Set(selectedCabinTypes));
      setCheckedShippingLines(new Set(selectedShippingLineIds));

      if (filterDepartureDateTime) {
        setDepartureDateTime(new Date(filterDepartureDateTime));
      } else {
        setDepartureDateTime(undefined);
      }
    }
  }, [searchParams, filters]);

  const resetFilters = () => {
    setDepartureDateTime(undefined);
    setCheckedCabinTypes(new Set());
    setCheckedShippingLines(new Set());

    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.delete('cabinTypes');
    queryParams.delete('shippingLineIds');
    queryParams.delete('filterDepartureDateTime');
    router.push(`/booking/destination?${queryParams.toString()}`);
  };

  const handleCabinTypeChange = (id: number) => {
    setCheckedCabinTypes((prev) => {
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
      if (value === 'undefined') {
        queryParams.delete(key);
      }
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const handleApplyFilters = () => {
    const selectedCabinTypeIds = Array.from(checkedCabinTypes);
    const selectedShippingLineIds = Array.from(checkedShippingLines);

    const queryParams = new URLSearchParams(searchParams.toString());

    if (selectedCabinTypeIds.length > 0) {
      queryParams.set('cabinTypes', selectedCabinTypeIds.join(','));
    } else {
      queryParams.delete('cabinTypes');
    }

    if (selectedShippingLineIds.length > 0) {
      queryParams.set('shippingLineIds', selectedShippingLineIds.join(','));
    } else {
      queryParams.delete('shippingLineIds');
    }

    if (departureDateTime) {
      queryParams.set('filterDepartureDateTime', formatDateTime(departureDateTime));
    } else {
      queryParams.delete('filterDepartureDateTime');
    }

    cleanQueryParams(queryParams);
    router.push(`/booking/destination?${queryParams.toString()}`);

    if (isModal && onClose) {
      onClose();
    }
  };

  const containerClasses = isModal ? 'w-full h-full overflow-y-auto bg-white' : 'w-72 bg-white rounded-lg shadow-md';

  if (!filters) {
    return (
      <div className={containerClasses}>
        <div className="px-6 py-4">
          <p className="text-sm text-red-600">Failed to load filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div
        className={`${
          isModal ? 'sticky top-0 bg-white border-b border-gray-200 z-10' : ''
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
        <div>
          <h4 className="font-bold text-base text-gray-800 mb-3">Accommodation</h4>
          <div className="space-y-3">
            {filters.cabinTypes.map((cabinType) => (
              <div key={cabinType.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`${isModal ? 'modal-' : ''}${cabinType.name}`}
                  checked={checkedCabinTypes.has(cabinType.id)}
                  onChange={() => handleCabinTypeChange(cabinType.id)}
                  className="h-4 w-4 rounded border-gray-300 text-customBlue focus:ring-customBlue"
                />
                <label
                  htmlFor={`${isModal ? 'modal-' : ''}${cabinType.name}`}
                  className="text-sm font-medium text-gray-700"
                >
                  {cabinType.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {!shippingLineId && (
          <>
            <div className="border-t border-gray-200" />

            {/* Shipping Lines Section */}
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
          </>
        )}

        <div className="border-t border-gray-200" />

        {/* Date & Time Sections */}
        <div>
          <DateTimePickerFieldset
            legendText="Departure Date & Time"
            date={departureDateTime}
            setDate={setDepartureDateTime}
          />
        </div>
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
