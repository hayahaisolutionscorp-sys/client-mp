import { ScheduleItem as ScheduleItemType } from "./ScheduleItem";
import ScheduleItem from "./ScheduleItem";
import { Skeleton } from "@/components/ui/Skeleton";

interface ScheduleTableProps {
  schedule: ScheduleItemType[];
  loading: boolean;
  tableVariant?: "default" | "striped" | "comfortable" | "high-contrast";
}

const ScheduleTable = ({ schedule, loading, tableVariant = "default" }: ScheduleTableProps) => {
  const isStriped = tableVariant === "striped";
  const isComfortable = tableVariant === "comfortable";
  const isHighContrast = tableVariant === "high-contrast";

  if (loading) {
    return (
      <div className="mt-6 rounded-md border overflow-hidden mx-2">
        {/* Skeleton Header */}
        <div className="hidden sm:grid grid-cols-4 bg-slate-100 p-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-24 bg-slate-200" />
          ))}
        </div>
        {/* Skeleton Rows */}
        <div className="divide-y">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex flex-col sm:grid sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mt-6 rounded-md border overflow-hidden mx-2 ${
        isHighContrast ? "border-slate-400 shadow-sm" : ""
      }`}
    >
      {/* Header - Desktop */}
      <div
        className={`hidden sm:grid grid-cols-4 text-base font-medium ${
          isComfortable ? "p-5" : "p-4"
        } ${
          isHighContrast
            ? "bg-slate-800 text-white"
            : isStriped
              ? "bg-slate-200 text-slate-700"
              : "bg-slate-100 text-slate-600"
        }`}
      >
        <div>Date & Time</div>
        <div>Route</div>
        <div>Ship</div>
        <div className="text-right">Fare</div>
      </div>

      <div className="divide-y">
        {schedule.length > 0 ? (
          schedule.map((item, index) => (
            <ScheduleItem
              key={index}
              item={item}
              rowIndex={index}
              striped={isStriped}
              rowVariant={tableVariant}
            />
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
