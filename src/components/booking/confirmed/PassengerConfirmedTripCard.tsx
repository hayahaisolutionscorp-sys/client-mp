'use client';

import { useEffect, useState } from 'react';
import { FaShip } from 'react-icons/fa';
import { FaArrowRight } from 'react-icons/fa6';

import { toPhilippinesTime } from 'helpers/date.helpers';
import { DATE_SECONDARY_DEFAULT_FORMAT } from 'constants/default';
import { useThemeSettings } from '@/hooks/theme-settings';
import { hexToRgb } from 'helpers/theme.helpers';
import { getAllShips } from '@/services';
import { IBooking, IShip } from '@/models';

interface PassengerConfirmedTripCardProps {
  booking?: IBooking;
}

export default function PassengerConfirmedTripCard({ booking }: PassengerConfirmedTripCardProps) {
  const [allShips, setAllShips] = useState<IShip[]>([]);
  const themeSettings = useThemeSettings();

  useEffect(() => {
    const fetchAllShips = async () => {
      try {
        const ships = await getAllShips();
        setAllShips(ships || []);
      } catch (error) {
        console.error('Error fetching ships:', error);
      }
    };

    fetchAllShips();
  }, []);

  const getShipDetailsById = (shipId: number): IShip | null => {
    return allShips.find((s) => s.id === shipId)! || null;
  };

  const TripCard = ({ type, tripIndex }: { type: 'Depart' | 'Return'; tripIndex: number }) => (
    <div className="border rounded-lg shadow-md bg-white p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="bg-[rgba(var(--bg-color),0.1)] text-[rgba(var(--bg-color),1)] rounded-full text-xs sm:text-sm font-medium px-2 py-1"
            style={
              {
                '--bg-color': hexToRgb(themeSettings?.backgroundColor || '#23abff')
              } as React.CSSProperties
            }
          >
            {type}
          </span>
          <span className="text-customText text-xs sm:text-sm">
            {toPhilippinesTime(
              booking?.bookingTrips?.[tripIndex]?.trip?.departureDateIso || '',
              DATE_SECONDARY_DEFAULT_FORMAT
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-customText">
          <FaShip
            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
            style={{ color: themeSettings?.iconColor || '#23abff' }}
          />
          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm font-medium max-w-[120px] sm:max-w-[150px] truncate">
              {booking?.bookingTrips?.[tripIndex]?.trip?.shippingLine?.name}
            </span>
            <span className="px-1 sm:px-2 text-gray-400">|</span>
            <span className="text-xs sm:text-sm font-medium max-w-[80px] sm:max-w-[100px] truncate">
              {getShipDetailsById(booking?.bookingTrips?.[tripIndex]?.trip?.shipId || 0)?.name}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center text-customText text-sm sm:text-base font-medium mt-3 sm:mt-4 space-y-2 sm:space-y-0">
        <span className="truncate max-w-full sm:max-w-[200px]">
          {booking?.bookingTrips?.[tripIndex]?.trip?.srcPort?.name}
        </span>
        <FaArrowRight className="w-4 h-4 my-1 sm:mx-2 transform rotate-90 sm:rotate-0" />
        <span className="truncate max-w-full sm:max-w-[200px]">
          {booking?.bookingTrips?.[tripIndex]?.trip?.destPort?.name}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <TripCard type="Depart" tripIndex={0} />
      {(booking?.bookingTrips?.length || 0) > 1 && <TripCard type="Return" tripIndex={1} />}
    </div>
  );
}
