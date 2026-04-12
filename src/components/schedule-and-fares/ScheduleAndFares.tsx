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
import { useThemeSettings } from '@/hooks/theme-settings';

interface ScheduleAndFaresProps {
  srcPortId?: number;
  destPortId?: number;
  themeColor?: string;
  accentColor?: string;
  datePickerVariant?: "default" | "minimal" | "simple" | "outlined";
  tableVariant?: "default" | "striped" | "comfortable" | "high-contrast";
}

const ScheduleAndFares = ({
  srcPortId,
  destPortId,
  datePickerVariant = "default",
  tableVariant = "default",
}: ScheduleAndFaresProps) => {
  const theme = useThemeSettings();
  const themeColor = theme?.primaryColor || '#0060df';
  const accentColor = theme?.accent || '#23abff';
  const [allShips, setAllShips] = useState<IShip[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickerMinimal = datePickerVariant === "minimal" || datePickerVariant === "simple";
  const pickerOutlined = datePickerVariant === "outlined";

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

        const { data: trips } = await getScheduleAndFares(selectedDate, undefined, srcPortId, destPortId);

        const formatted = trips.map((trip) => ({
          time: `${toPhilippinesTime(trip.departureDateIso, DATE_SECONDARY_DEFAULT_FORMAT)} - (${toPhilippinesTime(
            trip.departureDateIso,
            TIME_DEFAULT_FORMAT
          )})`,
          route: `${trip.srcPort?.name ?? trip.srcPortName ?? 'Unknown'} → ${trip.destPort?.name ?? trip.destPortName ?? 'Unknown'}`,
          ship: `${getShipDetailsById(trip.shipId)?.name ?? trip.shipName ?? 'Unknown'}`,
          logoUrl: trip.lightLogoUrl,
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
          selectedDate
        });

        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

        setError(errorMessage);
        setSchedule([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedDate, allShips, srcPortId, destPortId]);

  return (
    <div className="space-y-6">
      <div
        className={
          pickerOutlined
            ? "px-3 py-3 rounded-lg border-2 border-slate-300 bg-white shadow-sm"
            : pickerMinimal
              ? "px-2 py-2 rounded-md border border-slate-200 bg-slate-50/70"
              : "px-2"
        }
        style={{ '--primary-color': themeColor } as React.CSSProperties}
      >
        <DateSelection onDateChange={setSelectedDate} accentColor={accentColor} />
      </div>

      {error && (
        <div className="mb-6 p-4 sm:p-5 mx-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-base sm:text-lg">
          {error}
        </div>
      )}

      <div className={tableVariant === "striped" ? "rounded-lg border border-slate-200 overflow-hidden" : ""}>
        <ScheduleTable schedule={schedule} loading={loading} tableVariant={tableVariant} />
      </div>
    </div>
  );
};

export default ScheduleAndFares;
