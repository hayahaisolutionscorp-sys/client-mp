import { FaCar } from 'react-icons/fa';
import { TbPointFilled } from 'react-icons/tb';

import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { IBooking } from '@/models';

interface PassengerListProps {
  booking?: IBooking;
}

export default function PassengerList({ booking }: PassengerListProps) {
  const themeSettings = useThemeSettings();

  return (
    <>
      <div className="w-full bg-white border rounded-lg shadow-md">
        <h3
          className="text-sm sm:text-md font-semibold rounded-t-lg bg-[rgba(var(--bg-color),0.05)] border-b border-b-gray-300 text-customText px-3 sm:px-4 py-2"
          style={
            {
              '--bg-color': hexToRgb(themeSettings?.accent || '#8C1F21')
            } as React.CSSProperties
          }
        >
          {(booking?.bookingTrips?.length || 0) > 1 ? 'Depart - ' : ''}
          {(booking?.bookingTrips?.[0]?.bookingTripPassengers?.length || 0) > 1 ? 'Passengers' : 'Passenger'}
        </h3>
        {booking?.bookingTrips?.[0]?.bookingTripPassengers?.map((passenger, index) => (
          <div
            key={index}
            className={`px-3 sm:px-4 py-1 ${index > 0 ? 'border-t-2 border-dashed border-gray-300' : ''}`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-2 sm:gap-0">
              {/* Passenger Name */}
              <span
                className={`text-sm sm:text-base font-medium ${
                  (passenger as any)?.removedReasonType === 'Rebooked' ||
                  (passenger as any)?.bookingStatus === 'Rebooked'
                    ? 'text-gray-400 line-through'
                    : 'text-customText'
                }`}
              >
                {passenger?.passenger?.firstName + ' ' + passenger?.passenger?.lastName}
              </span>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Rebooked Badge */}
                {((passenger as any)?.removedReasonType === 'Rebooked' ||
                  (passenger as any)?.bookingStatus === 'Rebooked') && (
                  <div className="flex items-center px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
                    Rebooked
                  </div>
                )}
                {/* Vehicle Badge (if applicable) */}
                {(passenger?.drivesVehicleId || passenger?.discountType?.toLowerCase() == 'Driver'.toLowerCase()) && (
                  <div className="flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-500 border rounded-full">
                    <FaCar className="mr-2" />
                    Added 1 Vehicle
                  </div>
                )}
                {/* Air-conditioned Badge */}
                {passenger?.cabin?.cabinType && (
                  <div
                    className="flex items-center px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${themeSettings?.accent || '#23abff'}15`,
                      color: themeSettings?.accent || '#23abff'
                    }}
                  >
                    <TbPointFilled className="mr-1" />
                    {passenger?.cabin?.cabinType?.name}
                  </div>
                )}
                {/* Seat Badge */}
                {(passenger as any)?.seatCellId && (
                  <div className="flex items-center px-2 py-1 text-xs font-medium font-mono bg-violet-100 text-violet-700 border border-violet-200 rounded-full">
                    {(passenger as any).seatCellId}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {(booking?.bookingTrips?.length || 0) > 1 && (
        <div className="w-full bg-white border rounded-lg shadow-md mt-6">
          <h3 className="text-sm sm:text-md font-semibold rounded-t-lg bg-[#E7F5FF] border-b border-b-gray-300 text-customText px-3 sm:px-4 py-2">
            Return - Passengers
          </h3>
          {booking?.bookingTrips?.[1]?.bookingTripPassengers?.map((passenger, index) => (
            <div
              key={index}
              className={`px-3 sm:px-4 py-1 ${index > 0 ? 'border-t-2 border-dashed border-gray-300' : ''}`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-2 sm:gap-0">
                {/* Passenger Name */}
                <span className="text-sm sm:text-base text-customText font-medium">
                  {passenger?.passenger?.firstName + ' ' + passenger?.passenger?.lastName}
                </span>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Vehicle Badge (if applicable) */}
                  {(passenger?.drivesVehicleId || passenger?.discountType?.toLowerCase() == 'Driver'.toLowerCase()) && (
                    <div className="flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-500 rounded-full">
                      <FaCar className="mr-2" />
                      Added 1 Vehicle
                    </div>
                  )}
                  {/* Air-conditioned Badge */}
                  {passenger?.cabin?.cabinType && (
                    <div
                      className="flex items-center px-2 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${themeSettings?.accent || '#23abff'}15`,
                        color: themeSettings?.accent || '#23abff'
                      }}
                    >
                      <TbPointFilled className="mr-1" />
                      {passenger?.cabin?.cabinType?.name}
                    </div>
                  )}
                  {/* Seat Badge */}
                  {(passenger as any)?.seatCellId && (
                    <div className="flex items-center px-2 py-1 text-xs font-medium font-mono bg-violet-100 text-violet-700 border border-violet-200 rounded-full">
                      {(passenger as any).seatCellId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
