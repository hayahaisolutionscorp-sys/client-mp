import type { ICoreValue } from '@/models';

interface CoreValuesPillarsProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  textOnPrimary: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
  mutedOnSurfaceAlt: string;
}

export default function CoreValuesPillars({
  coreValues,
  primaryColor,
  textColor,
  textOnPrimary,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
  mutedOnSurfaceAlt,
}: CoreValuesPillarsProps) {
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
      <div className="grid gap-5 md:grid-cols-3">
        {coreValues.map((value, index) => (
          <div
            key={value.id}
            className="rounded-2xl border border-slate-200 p-6"
            style={{ backgroundColor: surfaceAltColor, color: textOnSurfaceAlt }}
          >
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{ backgroundColor: primaryColor, color: textOnPrimary }}
            >
              {index + 1}
            </span>
            <h3 className="mt-4 text-xl font-semibold">{value.title}</h3>
            <p className="mt-3 text-sm" style={{ color: mutedOnSurfaceAlt }}>{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
