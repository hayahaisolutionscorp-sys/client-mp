'use client';

import ScheduleAndFares from '@/components/schedule-and-fares/ScheduleAndFares';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { CalendarIcon } from 'lucide-react';
import { useThemeSettings } from '@/hooks/theme-settings';

const ScheduleAndFaresClient = () => {
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || '#0060df';

  return (
    <div
      className="container max-w-[1500px] mx-auto py-4 sm:py-8 px-4 sm:px-6"
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
    >
      <Card className="w-full max-w-none">
        <CardContent className="p-5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 px-2">
              <CalendarIcon className="w-6 h-6" style={{ color: primaryColor }} />
              <span>Select Travel Date</span>
            </h2>
          </div>

          <ScheduleAndFares />
        </CardContent>
        <CardFooter className="bg-slate-50 py-4 sm:py-5 px-6 sm:px-8 text-sm sm:text-base text-muted-foreground border-t">
          Schedule and fares for the selected date. Prices may vary based on availability.
        </CardFooter>
      </Card>
    </div>
  );
};

export default ScheduleAndFaresClient;
