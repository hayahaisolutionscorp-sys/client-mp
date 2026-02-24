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

  const TripCard = ({ type, tripIndex, tripData }: { type: 'Depart' | 'Return'; tripIndex: number; tripData?: any }) => {
    const trip = tripData || booking?.bookingTrips?.[tripIndex];
    const cabinName = trip?.bookingTripPassengers?.[0]?.cabin?.name;

    return (
      <div className="border rounded-lg shadow-md bg-white p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full text-xs font-semibold px-3 py-1 border"
              style={{
                backgroundColor: `${themeSettings?.accent || '#23abff'}15`,
                color: themeSettings?.accent || '#23abff',
                borderColor: `${themeSettings?.accent || '#23abff'}40`
              }}
            >
              {type}
            </span>
            <span className="text-customText text-xs sm:text-sm font-medium">
              {toPhilippinesTime(
                trip?.trip?.departureDateIso || '',
                'ddd, MMM. DD, YYYY hh:mm A'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-customText">
            <FaShip
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
              style={{ color: themeSettings?.accent || '#23abff' }}
            />
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="text-xs sm:text-sm font-medium max-w-[120px] sm:max-w-[150px] truncate">
                {trip?.trip?.shippingLine?.name}
              </span>
              <span className="px-1 sm:px-2 text-gray-400">|</span>
              <span className="text-xs sm:text-sm font-medium max-w-[80px] sm:max-w-[100px] truncate">
                {getShipDetailsById(trip?.trip?.shipId || 0)?.name || trip?.trip?.ship?.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 sm:mt-5 space-y-3 sm:space-y-0">
          <div className="flex items-center text-customText text-sm sm:text-base font-bold">
            <span className="truncate max-w-[150px] sm:max-w-[200px]">
              {trip?.trip?.srcPort?.name}
            </span>
            <FaArrowRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">
              {trip?.trip?.destPort?.name}
            </span>
          </div>

          {cabinName && (
            <span
              className="rounded-full text-[10px] sm:text-xs font-semibold px-3 py-1 border shadow-sm"
              style={{
                borderColor: `${themeSettings?.accent || '#8C1F21'}40`,
                color: '#4B5563', // gray-600 for better readability
                backgroundColor: '#F9FAFB' // gray-50
              }}
            >
              {cabinName}
            </span>
          )}
        </div>
      </div>
    );
  };

  const departureTrips = (booking?.bookingTrips || []).filter(t => (t as any).direction === 'departure');
  const returnTrips = (booking?.bookingTrips || []).filter(t => (t as any).direction === 'return');

  // Fallback for cases where direction is not set (e.g. existing data)
  const hasDirection = (booking?.bookingTrips || []).some(t => (t as any).direction);
  const displayDepartures = hasDirection ? departureTrips : [(booking?.bookingTrips || [])[0]].filter(Boolean);
  const displayReturns = hasDirection ? returnTrips : [(booking?.bookingTrips || [])[1]].filter(Boolean);

  return (
    <div className="space-y-4 sm:space-y-6">
      {displayDepartures.map((trip, idx) => (
        <TripCard key={`depart-${idx}`} type="Depart" tripIndex={idx} tripData={trip} />
      ))}
      {displayReturns.map((trip, idx) => (
        <TripCard key={`return-${idx}`} type="Return" tripIndex={idx} tripData={trip} />
      ))}
    </div>
  );
}
