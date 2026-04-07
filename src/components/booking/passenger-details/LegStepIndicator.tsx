'use client';

import { ITripSegment } from '@/models/shipping-line/trip.model';

interface LegStepIndicatorProps {
  segments: ITripSegment[];
  currentIndex: number;
  themeSettings: any;
}

export default function LegStepIndicator({ segments, currentIndex, themeSettings }: LegStepIndicatorProps) {
  const accent = themeSettings?.accent || '#23abff';
  const totalLegs = segments.length;

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <p className="text-center text-sm font-semibold text-gray-500 mb-3">
        Step {currentIndex + 1} / {totalLegs}
      </p>

      <div className="flex items-center justify-center gap-1 flex-wrap">
        {segments.map((seg, idx) => {
          const isActive = idx === currentIndex;
          const isCompleted = idx < currentIndex;

          return (
            <div key={idx} className="flex items-center gap-1">
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                  isActive || isCompleted
                    ? 'text-white border-transparent'
                    : 'text-gray-400 border-gray-300 bg-white'
                }`}
                style={isActive || isCompleted ? { backgroundColor: accent, borderColor: accent } : {}}
              >
                {seg.srcPortName} → {seg.destPortName}
              </div>

              {idx < totalLegs - 1 && (
                <div
                  className="h-0.5 w-6 flex-shrink-0 transition-all"
                  style={{ backgroundColor: idx < currentIndex ? accent : '#d1d5db' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
