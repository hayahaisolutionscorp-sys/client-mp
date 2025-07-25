import { FaPhoneAlt } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi';

import { useThemeSettings } from '@/hooks/theme-settings';
import { IBooking } from '@/models';

interface ContactDetailsProps {
  booking?: IBooking;
}

export default function PassengerDetails({ booking }: ContactDetailsProps) {
  const themeSettings = useThemeSettings();

  return (
    <div
      className="bg-white w-full border-2 shadow-md rounded-lg px-6 py-4 mt-8"
      style={{ borderColor: themeSettings?.borderColor || '#23abff' }}
    >
      <h2 className="text-lg font-semibold mb-4">Passenger Details</h2>

      {/* Loop through bookingTripPassengers */}
      <div className="flex justify-start space-x-16">
        <div>
          <h3 className="text-sm mb-2">Departure:</h3>
          <div className="flex items-start justify-start space-x-4">
            <HiUsers className="w-5 h-5" style={{ color: themeSettings?.iconColor || '#23abff' }} />
            <div className="mt-[1px]">
              {(booking?.bookingTrips || []).length > 0 ? (
                booking?.bookingTrips?.[0]?.bookingTripPassengers?.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-start space-x-4 mb-2">
                    <div className="text-customText">
                      <p className="text-sm font-semibold mb-1">
                        {passenger.passenger?.firstName} {passenger.passenger?.lastName}
                      </p>
                      <p className="text-xs font-medium">
                        {passenger?.discountType || 'Regular'} | {passenger.passenger?.sex} |{' '}
                        {passenger.passenger?.nationality}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-start space-x-4 mb-2">
                  <div className="text-customText">
                    <p className="text-sm font-semibold mb-1">N/A</p>
                    <p className="text-xs font-medium">N/A</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(booking?.bookingTrips || []).length > 1 && (
          <div>
            <h3 className="text-sm mb-2">Return:</h3>
            <div className="flex items-start justify-start space-x-4">
              <HiUsers className="w-5 h-5" style={{ color: themeSettings?.iconColor || '#23abff' }} />
              <div className="mt-[1px]">
                {booking?.bookingTrips?.[1]?.bookingTripPassengers?.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-start space-x-4 mb-2">
                    <div className="text-customText">
                      <p className="text-sm font-semibold mb-1">
                        {passenger.passenger?.firstName} {passenger.passenger?.lastName}
                      </p>
                      <p className="text-xs font-medium">
                        {passenger?.discountType || 'Regular'} | {passenger.passenger?.sex} |{' '}
                        {passenger.passenger?.nationality}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="mt-6">
        <h3 className="text-sm mb-2">Contact Details:</h3>
        <div className="flex items-start justify-start space-x-4">
          <FaPhoneAlt className="w-5 h-4 mt-[1px]" style={{ color: themeSettings?.iconColor || '#23abff' }} />
          <div className="text-customText">
            <p className="text-sm font-semibold mb-1">{booking?.consigneeName || 'N/A'}</p>
            <p className="text-xs font-medium">
              {booking?.contactMobile || booking?.contactEmail
                ? `${booking.contactMobile || ''} | ${booking.contactEmail || ''}`
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
