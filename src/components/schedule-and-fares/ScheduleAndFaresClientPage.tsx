"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { CalendarIcon } from "lucide-react";
import { useThemeSettings } from "@/hooks/theme-settings";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";

interface ScheduleAndFaresClientPageProps {
  heroVariant: string;
  datePickerVariant: string;
  fareTableVariant: "default" | "striped";
}

const ScheduleAndFares = dynamic(() => import("@/components/schedule-and-fares/ScheduleAndFares"), {
  ssr: false,
});

export function ScheduleAndFaresClientPage({
  heroVariant,
  datePickerVariant,
  fareTableVariant,
}: ScheduleAndFaresClientPageProps) {
  const theme = useThemeSettings();
  const primaryColor = theme?.primaryColor || "#0060df";
  const heroCompact = heroVariant === "compact";
  const pickerMinimal = datePickerVariant === "minimal";

  return (
    <div
      className={`container max-w-[1500px] mx-auto px-4 sm:px-6 ${heroCompact ? "py-3 sm:py-6" : "py-4 sm:py-8"}`}
      style={{ "--primary-color": primaryColor } as CSSProperties}
    >
      <Card className={`w-full max-w-none ${heroCompact ? "border-slate-200" : ""}`}>
        <CardContent className={pickerMinimal ? "p-4 sm:p-6" : "p-5 sm:p-8"}>
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${pickerMinimal ? "mb-4" : "mb-6"}`}
          >
            <h2
              className={`font-semibold flex items-center gap-2 px-2 ${
                heroCompact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
              }`}
            >
              <CalendarIcon className="w-6 h-6" style={{ color: primaryColor }} />
              <span>Select Travel Date</span>
            </h2>
          </div>

          <ScheduleAndFares datePickerVariant={datePickerVariant as "default" | "minimal"} tableVariant={fareTableVariant} />
        </CardContent>
        <CardFooter className="bg-slate-50 py-4 sm:py-5 px-6 sm:px-8 text-sm sm:text-base text-muted-foreground border-t">
          Schedule and fares for the selected date. Prices may vary based on availability.
        </CardFooter>
      </Card>
    </div>
  );
}
