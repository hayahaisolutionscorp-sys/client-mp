import { Card, CardContent } from '@/components/ui/Card';
import type { ICoreValue } from '@/models';

interface CoreValuesDefaultProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
}

export default function CoreValuesDefault({
  coreValues,
  primaryColor,
  textColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
}: CoreValuesDefaultProps) {
  if (coreValues.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[28px] px-6 py-10 shadow-sm md:px-8" style={{ backgroundColor: surfaceColor }}>
      <div className="mb-8 text-center">
        <p
          className="text-xs font-bold uppercase tracking-[0.24em]"
          style={{ color: primaryColor }}
        >
          What We Stand For
        </p>
        <h2 className="mt-4 text-3xl font-bold" style={{ color: textColor }}>Our Core Values</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {coreValues.map((value) => (
          <Card key={value.id} className="overflow-hidden border-slate-200 shadow-sm" style={{ backgroundColor: surfaceAltColor }}>
            <CardContent className="p-6">
              <div className="mb-4 flex justify-center">
                <img
                  src={value.icon_url}
                  alt={value.icon_alt || value.title}
                  className="h-16 w-16 object-contain"
                />
              </div>
              <h3 className="text-center text-xl font-semibold" style={{ color: textOnSurfaceAlt }}>{value.title}</h3>
              <p className="mt-3 text-center" style={{ color: textOnSurfaceAlt === '#f8fafc' ? '#cbd5e1' : '#475569' }}>{value.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
