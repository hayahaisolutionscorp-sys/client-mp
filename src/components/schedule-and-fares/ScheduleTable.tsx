import { ScheduleItem as ScheduleItemType} from "./ScheduleItem";
import ScheduleItem from "./ScheduleItem";

interface ScheduleTableProps {
  schedule: ScheduleItemType[];
  loading: boolean;
}

const ScheduleTable = ({ schedule, loading }: ScheduleTableProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 bg-slate-50 rounded-lg mx-2">
        <p className="text-lg sm:text-xl text-muted-foreground">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-md border overflow-hidden mx-2">
      {/* Header - Desktop */}
      <div className="hidden sm:grid grid-cols-4 bg-slate-100 p-4 text-base font-medium text-slate-600">
        <div>Date & Time</div>
        <div>Route</div>
        <div>Ship</div>
        <div className="text-right">Fare</div>
      </div>

      <div className="divide-y">
        {schedule.length > 0 ? (
          schedule.map((item, index) => (
            <ScheduleItem key={index} item={item} />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-lg sm:text-xl font-medium text-slate-600">
              No available trips for this schedule as the booking cut-off has been reached.
            </p>
            <p className="text-base sm:text-lg text-muted-foreground mt-1">Please select another date</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTable;
