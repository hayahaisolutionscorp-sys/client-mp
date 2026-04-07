import type { ICoreValue } from '@/models';

interface CoreValuesIconGridProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
  mutedOnSurfaceAlt: string;
}

export default function CoreValuesIconGrid({
  coreValues,
  primaryColor,
  textColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
  mutedOnSurfaceAlt,
}: CoreValuesIconGridProps) {
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
      <div className="grid gap-8 md:grid-cols-3">
        {coreValues.map((value) => (
          <div key={value.id} className="text-center">
            <div
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <img
                src={value.icon_url}
                alt={value.icon_alt || value.title}
                className="h-12 w-12 object-contain"
              />
            </div>
            <h3 className="text-xl font-semibold" style={{ color: textColor }}>{value.title}</h3>
            <p className="mt-3 text-sm" style={{ color: mutedOnSurfaceAlt }}>{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
