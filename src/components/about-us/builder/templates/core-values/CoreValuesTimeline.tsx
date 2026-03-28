import type { ICoreValue } from '@/models';

interface CoreValuesTimelineProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
  mutedColor: string;
}

export default function CoreValuesTimeline({
  coreValues,
  primaryColor,
  textColor,
  surfaceColor,
  mutedColor,
}: CoreValuesTimelineProps) {
  if (coreValues.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] px-6 py-10 shadow-sm md:px-8" style={{ backgroundColor: surfaceColor }}>
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
          What We Stand For
        </p>
        <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>Our Core Values</h2>
      </div>
      <div className="space-y-6">
        {coreValues.map((value, index) => (
          <div key={value.id} className="flex gap-6">
            <div className="relative flex flex-col items-center">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <img
                  src={value.icon_url}
                  alt={value.icon_alt || value.title}
                  className="h-6 w-6 object-contain brightness-0 invert"
                />
              </div>
              {index < coreValues.length - 1 && (
                <div className="w-px flex-1 bg-slate-200 mt-2" style={{ minHeight: '40px' }} />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h3 className="text-xl font-semibold" style={{ color: textColor }}>{value.title}</h3>
              <p className="mt-2 text-sm" style={{ color: mutedColor }}>{value.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
