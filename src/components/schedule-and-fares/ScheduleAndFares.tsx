'use client';

import { useEffect, useState } from 'react';
import { getScheduleAndFares, getAllShips } from '@/services';
import DateSelection from '@/components/schedule-and-fares/DateSelection';
import { DATE_SECONDARY_DEFAULT_FORMAT, TIME_DEFAULT_FORMAT } from 'constants/index';
import { toPhilippinesTime } from 'helpers/date.helpers';
import { formatCurrency } from 'helpers/general.helpers';
import ScheduleTable from './ScheduleTable';
import { ScheduleItem } from './ScheduleItem';
import { IShip, ITrip } from '@/models';

interface ScheduleAndFaresProps {
  srcPortId?: number;
  destPortId?: number;
  themeColor?: string;
  accentColor?: string;
}

const ScheduleAndFares = ({ srcPortId, destPortId, themeColor = '#0060df', accentColor = '#23abff' }: ScheduleAndFaresProps) => {
  const [allShips, setAllShips] = useState<IShip[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shippingLineId = process.env.NEXT_PUBLIC_SHIPPING_LINE_ID || '0';

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

  useEffect(() => {
    if (!selectedDate) return;

    const getShipDetailsById = (shipId: number): IShip | null => {
      return allShips.find((s) => s.id === shipId) || null;
    };

    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);
      try {
        // Validate date format before making the request
        if (!selectedDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
          throw new Error('Invalid date format');
        }

        const trips: ITrip[] = await getScheduleAndFares(selectedDate, undefined, srcPortId, destPortId);

        const formatted = trips.map((trip) => ({
          time: `${toPhilippinesTime(trip.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)} - (${toPhilippinesTime(
            trip.departureDateIso,
            TIME_DEFAULT_FORMAT
          )})`,
          route: `${trip.srcPort?.name ?? 'Unknown'} → ${trip.destPort?.name ?? 'Unknown'}`,
          ship: `${getShipDetailsById(trip.shipId)?.name ?? 'Unknown'}`,
          fare:
            Array.isArray(trip.availableCabins) && trip.availableCabins.length
              ? trip.availableCabins
                .map(
                  (cabin) => `${cabin.cabin?.cabinType?.name ?? 'Unknown'}: ${formatCurrency(cabin.adultFare, 'Php')}`
                )
                .join(', ')
              : 'No fares available'
        }));

        setSchedule(formatted);
      } catch (error) {
        console.error('Schedule fetch error:', {
          error,
          selectedDate,
          shippingLineId
        });

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

        setError(errorMessage);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDate, shippingLineId, allShips, srcPortId, destPortId]);

  return (
    <div className="space-y-6">
      <div className="px-2" style={{ '--primary-color': themeColor } as React.CSSProperties}>
        <DateSelection onDateChange={setSelectedDate} accentColor={accentColor} />
      </div>

      {error && (
        <div className="mb-6 p-4 sm:p-5 mx-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-base sm:text-lg">
          {error}
        </div>
      )}

      <ScheduleTable schedule={schedule} loading={loading} />
    </div>
  );
};

export default ScheduleAndFares;
