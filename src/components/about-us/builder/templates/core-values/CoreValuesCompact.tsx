import type { ICoreValue } from '@/models';

interface CoreValuesCompactProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
  mutedColor: string;
}

export default function CoreValuesCompact({
  coreValues,
  primaryColor,
  textColor,
  surfaceColor,
  mutedColor,
}: CoreValuesCompactProps) {
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
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {coreValues.map((value) => (
          <div
            key={value.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4"
          >
            <img
              src={value.icon_url}
              alt={value.icon_alt || value.title}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" style={{ color: textColor }}>{value.title}</h3>
              <p className="mt-1 text-xs line-clamp-2" style={{ color: mutedColor }}>{value.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
