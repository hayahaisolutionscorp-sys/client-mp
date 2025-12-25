import SearchHeader from '@/components/booking/destination/SearchHeader';
import FilterSidebar from '@/components/booking/destination/FilterSidebar';
import { fetchFilters } from '@/services';
import MobileFilterModal from '@/components/booking/destination/MobileFilter';
import TripsSelector from '@/components/booking/destination/TripsSelector';

export default async function Destination() {
  const filters = fetchFilters();

  return (
    <>
      <SearchHeader />
      <div className="flex flex-col bg-gray-50 px-3 pt-2 pb-8 lg:flex-row lg:px-10">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block lg:w-[300px] pt-[140px]">
          <FilterSidebar filtersPromise={filters} />
        </div>

        <MobileFilterModal filtersPromise={filters} />

        <div className="flex-1 lg:pl-8 space-y-4 sm:space-y-6">
          <h1 className="sr-only">Available Trips</h1>
          <TripsSelector />
        </div>
      </div>
    </>
  );
}
