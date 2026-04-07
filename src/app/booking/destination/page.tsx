import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { TripsProvider } from '@/context/TripsContext';

const SearchHeader = dynamic(() => import('@/components/booking/destination/SearchHeader'));
const FilterSidebar = dynamic(() => import('@/components/booking/destination/FilterSidebar'));
const MobileFilterModal = dynamic(() => import('@/components/booking/destination/MobileFilter'));
const TripsSelector = dynamic(() => import('@/components/booking/destination/TripsSelector'));

export default function Destination() {
  return (
    <TripsProvider>
      <SearchHeader />
      <div className="flex flex-col bg-gray-50 px-3 pt-2 pb-8 lg:flex-row lg:px-10">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:w-[300px] pt-[140px]">
          <Suspense fallback={<div className="w-72 h-96 bg-gray-100 animate-pulse rounded-lg" />}>
            <FilterSidebar />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <MobileFilterModal />
        </Suspense>

        <div className="flex-1 lg:pl-8 space-y-4 sm:space-y-6">
          <h1 className="sr-only">Available Trips</h1>
          <Suspense fallback={
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 animate-pulse rounded-md w-1/4" />
              <div className="h-64 bg-gray-200 animate-pulse rounded-lg w-full" />
            </div>
          }>
            <TripsSelector />
          </Suspense>
        </div>
      </div>
    </TripsProvider>
  );
}
