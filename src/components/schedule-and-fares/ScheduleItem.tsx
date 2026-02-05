import { Ship } from 'lucide-react';
import { useThemeSettings } from '@/hooks/theme-settings';

export interface ScheduleItem {
  time: string;
  route: string;
  ship: string;
  fare: string;
}

interface ScheduleItemProps {
  item: ScheduleItem;
}


const ScheduleItem = ({ item }: ScheduleItemProps) => {
  const themeSettings = useThemeSettings();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 p-4 sm:p-6 items-start sm:items-center hover:bg-slate-50 transition-colors gap-4 sm:gap-3">
      {/* Date & Time */}
      <div className="space-y-2">
        <div className="text-base sm:text-lg font-medium flex items-center justify-between sm:justify-start gap-2">
          <span className="sm:hidden text-slate-600 text-base">Date & Time:</span>
          {item.time.split(' - ')[1].replace(/[()]/g, '')}
        </div>
        <div className="text-base text-muted-foreground">{item.time.split(' - ')[0]}</div>
      </div>

      {/* Route */}
      <div className="flex items-start sm:items-center gap-3">
        <div className="flex-1">
          <span className="sm:hidden text-base text-slate-600 mb-1 block">Route:</span>
          <div className="flex flex-col gap-1">
            <span className="text-base sm:text-lg font-medium">{item.route.split(' → ')[0]}</span>
            <span className="text-base text-muted-foreground">to</span>
            <span className="text-base sm:text-lg font-medium">{item.route.split(' → ')[1]}</span>
          </div>
        </div>
      </div>

      {/* Ship */}
      <div className="flex items-center gap-3">
        <span className="sm:hidden text-base text-slate-600">Ship:</span>
        <Ship className="h-5 w-5" style={{ color: themeSettings?.accent || '#0ea5e9' }} />
        <div className="text-base sm:text-lg font-medium">{item.ship}</div>
      </div>

      {/* Fare */}
      <div className="space-y-3 sm:text-right">
        <span className="sm:hidden text-base text-slate-600 block">Fare:</span>
        {item.fare === 'No fares available' ? (
          <span className="text-base text-muted-foreground italic">No fares available</span>
        ) : (
          <div className="grid gap-2 sm:justify-items-end">
            {item.fare.split(', ').map((fare, idx) => (
              <div
                key={idx}
                className="flex flex-row sm:flex-col gap-2 sm:gap-1 items-baseline justify-between sm:items-end"
              >
                <div className="text-sm sm:text-base text-muted-foreground">{fare.split(': ')[0]}</div>
                <div
                  className="text-base sm:text-lg font-bold"
                  style={{ color: themeSettings?.primaryColor || '#0369a1' }}
                >
                  {fare.split(': ')[1]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleItem;
