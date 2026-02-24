import { FaPhoneAlt, FaTruck, FaBox } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi';
import { IoCarSport } from 'react-icons/io5';

import { useThemeSettings } from '@/hooks/theme-settings';
import { IBooking } from '@/models';

interface TripDetailsProps {
  booking?: IBooking;
}

export default function TripDetails({ booking }: TripDetailsProps) {
  const themeSettings = useThemeSettings();

  const renderPassengers = (tripIndex: number) => {
    const passengers = booking?.bookingTrips?.[tripIndex]?.bookingTripPassengers;
    if (!passengers || passengers.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <HiUsers className="w-5 h-5" style={{ color: themeSettings?.accent || '#23abff' }} />
          <h3 className="text-sm font-semibold text-gray-700">Passengers</h3>
        </div>
        <div className="pl-7 space-y-3">
          {passengers.map((passenger, index) => (
            <div key={index} className="text-customText">
              <p className="text-sm font-medium">
                {passenger.passenger?.firstName} {passenger.passenger?.lastName}
              </p>
              <p className="text-xs text-gray-500">
                {passenger?.discountType || 'Regular'} | {passenger.passenger?.sex} |{' '}
                {passenger.passenger?.nationality}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVehicles = (tripIndex: number) => {
    const vehicles = booking?.bookingTrips?.[tripIndex]?.bookingTripVehicles;
    if (!vehicles || vehicles.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <IoCarSport className="w-5 h-5" style={{ color: themeSettings?.accent || '#23abff' }} />
          <h3 className="text-sm font-semibold text-gray-700">Vehicles</h3>
        </div>
        <div className="pl-7 space-y-3">
          {vehicles.map((vehicle, index) => {
            const v = vehicle.vehicle as any;
            return (
              <div key={index} className="text-customText">
                <p className="text-sm font-medium">
                  {v?.modelName} ({v?.plateNumber || v?.plateNo}) | {v?.modelBody}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCargo = (tripIndex: number) => {
    // Access dynamic cargo field
    const cargos = (booking?.bookingTrips?.[tripIndex] as any)?.bookingTripCargos;
    if (!cargos || cargos.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <FaBox className="w-5 h-5" style={{ color: themeSettings?.accent || '#23abff' }} />
          <h3 className="text-sm font-semibold text-gray-700">Cargo</h3>
        </div>
        <div className="pl-7 space-y-3">
          {cargos.map((cargo: any, index: number) => (
            <div key={index} className="text-customText">
              <p className="text-sm font-medium">
                {cargo.commodity?.name || cargo.cargoTypeDescription || 'Cargo'} {cargo.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const bookingTrips = booking?.bookingTrips || [];

  // Find the first leg that actually has details to display if any
  const getFirstLegWithDetails = (trips: any[]) => {
    return trips.find(t =>
      t.bookingTripPassengers?.length > 0 ||
      t.bookingTripVehicles?.length > 0 ||
      (t as any).bookingTripCargos?.length > 0
    ) || trips[0];
  };

  const mainLeg = getFirstLegWithDetails(bookingTrips);
  const mainIndex = bookingTrips.findIndex(bt => bt === mainLeg);

  return (
    <div
      className="bg-white w-full border-2 shadow-md rounded-lg px-6 py-4 mt-6"
      style={{ borderColor: themeSettings?.accent || '#8C1F21' }}
    >
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span>Booking Details</span>
      </h2>

      <div className="space-y-4">
        {bookingTrips.length > 0 ? (
          <div className="pb-2">
            {renderPassengers(mainIndex)}
            {renderVehicles(mainIndex)}
            {renderCargo(mainIndex)}

            {/* Fallback if nothing */}
            {!mainLeg?.bookingTripPassengers?.length &&
              !mainLeg?.bookingTripVehicles?.length &&
              !(mainLeg as any)?.bookingTripCargos?.length && (
                <p className="text-sm text-gray-500 italic">No booking details available.</p>
              )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No trip content available.</p>
        )}
      </div>

      {/* Contact Information */}
      <div className="border-t border-gray-100">
        <h3 className="text-sm font-semibold m-3 text-gray-800">Contact Details</h3>
        <div className="flex items-start gap-3 pl-2">
          <FaPhoneAlt className="w-4 h-4 mt-1 text-gray-400" />
          <div className="text-customText">
            <p className="text-sm font-semibold">{booking?.consigneeName || 'N/A'}</p>
            <p className="text-sm text-gray-600">
              {booking?.contactMobile}
            </p>
            <p className="text-sm text-gray-600">
              {booking?.contactEmail}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
