import { ScheduleItem as ScheduleItemType } from "./ScheduleItem";
import ScheduleItem from "./ScheduleItem";
import { Skeleton } from "@/components/ui/Skeleton";

interface ScheduleTableProps {
  schedule: ScheduleItemType[];
  loading: boolean;
  tableVariant?: "default" | "striped" | "comfortable" | "high-contrast" | "glassmorphic" | "boarding-pass";
}

const ScheduleTable = ({ schedule, loading, tableVariant = "default" }: ScheduleTableProps) => {
  const isStriped = tableVariant === "striped";
  const isComfortable = tableVariant === "comfortable";
  const isHighContrast = tableVariant === "high-contrast";
  const isGlass = tableVariant === "glassmorphic";
  const isBoardingPass = tableVariant === "boarding-pass";

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
        isBoardingPass ? "border-none shadow-none mt-0 mx-0 bg-transparent" : isGlass ? "border-transparent shadow-none mt-0 mx-0" : isHighContrast ? "border-slate-400 shadow-sm" : ""
      }`}
    >
      {/* Header - Desktop */}
      <div
        className={`hidden sm:grid grid-cols-4 font-medium ${
          isBoardingPass ? "p-4 text-[10px] uppercase tracking-[0.25em] font-black font-mono" : isComfortable || isGlass ? "p-5 text-base" : "p-4 text-base"
        } ${
          isBoardingPass
            ? "bg-transparent border-b-2 border-dashed text-slate-700"
          : isGlass
            ? "bg-white/40 border-b border-white/50 text-slate-800 backdrop-blur-md"
          : isHighContrast
            ? "bg-slate-800 text-white"
            : isStriped
              ? "bg-slate-200 text-slate-700"
              : "bg-slate-100 text-slate-600"
        }`}
        style={isBoardingPass ? { borderColor: 'rgba(15,23,42,0.2)' } : undefined}
      >
        <div>Date & Time</div>
        <div>Route</div>
        <div>Ship</div>
        <div className="text-right">Fare</div>
      </div>

      <div className={isBoardingPass ? "" : isGlass ? "divide-y divide-white/40" : "divide-y"}>
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
