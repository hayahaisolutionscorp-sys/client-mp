'use client';

import { HiOutlineFilter } from 'react-icons/hi';
import { Button } from '@/components/ui/Button';
import FilterSidebar from '@/components/booking/destination/FilterSidebar';

export default function MobileFilterModal() {
  const handleOpenModal = () => {
    const modal = document.getElementById('filter-modal') as HTMLDialogElement;
    modal?.showModal();
  };

  const handleCloseModal = () => {
    const modal = document.getElementById('filter-modal') as HTMLDialogElement;
    modal?.close();
  };

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden bg-gray-50 py-2 sm:py-4">
        <Button
          variant={null}
          onClick={handleOpenModal}
          className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50
                     shadow-sm rounded-lg py-2.5 sm:py-3 flex items-center justify-center mb-2"
        >
          <HiOutlineFilter className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="text-sm sm:text-base">Filter Results</span>
        </Button>
      </div>

      {/* Filter Modal for Mobile */}
      <dialog
        id="filter-modal"
        className="modal w-full h-full max-w-full max-h-full m-0 p-0 bg-transparent"
      >
        <div className="w-full h-full">
          <FilterSidebar
            isModal
            onClose={handleCloseModal}
          />
        </div>
      </dialog>
    </>
  );
}