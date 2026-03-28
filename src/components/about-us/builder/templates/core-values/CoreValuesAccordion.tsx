import type { ICoreValue } from '@/models';

interface CoreValuesAccordionProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
  mutedOnSurfaceAlt: string;
}

export default function CoreValuesAccordion({
  coreValues,
  primaryColor,
  textColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
  mutedOnSurfaceAlt,
}: CoreValuesAccordionProps) {
  if (coreValues.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] px-6 py-10 shadow-sm md:px-8" style={{ backgroundColor: surfaceColor }}>
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em]" style={{ color: primaryColor }}>
          What We Stand For
        </p>
        <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>Our Core Values</h2>
      </div>
      <div className="space-y-4">
        {coreValues.map((value) => (
          <div
            key={value.id}
            className="rounded-2xl border border-slate-200 p-6"
            style={{ backgroundColor: surfaceAltColor }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <img
                  src={value.icon_url}
                  alt={value.icon_alt || value.title}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold" style={{ color: textOnSurfaceAlt }}>{value.title}</h3>
                <p className="mt-2 text-sm" style={{ color: mutedOnSurfaceAlt }}>{value.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
