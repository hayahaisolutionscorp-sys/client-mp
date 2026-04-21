import type { ICoreValue } from '@/models';

interface CoreValuesBoardingPassProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
}

export default function CoreValuesBoardingPass({
  coreValues,
  primaryColor,
  textColor,
  surfaceAltColor,
  textOnSurfaceAlt,
}: CoreValuesBoardingPassProps) {
  if (coreValues.length === 0) return null;

  return (
    <section className="relative w-full px-2 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2"
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            ★ Core Values
          </span>
          <span className="flex-1 h-[2px] border-t-2 border-dashed" style={{ borderColor: 'rgba(15,23,42,0.2)' }} />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-50" style={{ color: textColor }}>
            {String(coreValues.length).padStart(2, '0')} · Pillars
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coreValues.map((value, index) => (
            <div
              key={value.id}
              className="relative rounded-xl border-2 p-5 transition-all hover:-translate-y-1 hover:shadow-[0_16px_30px_-15px_rgba(15,23,42,0.25)]"
              style={{ backgroundColor: '#FFFDF7', borderColor: 'rgba(15,23,42,0.14)' }}
            >
              <div
                className="absolute -top-2 -left-2 h-4 w-4 rounded-full border-2"
                style={{ backgroundColor: surfaceAltColor, borderColor: 'rgba(15,23,42,0.14)' }}
              />
              <div
                className="absolute -top-2 -right-2 h-4 w-4 rounded-full border-2"
                style={{ backgroundColor: surfaceAltColor, borderColor: 'rgba(15,23,42,0.14)' }}
              />

              <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.25em] opacity-60 mb-4" style={{ color: textColor }}>
                <span>Value</span>
                <span>·</span>
                <span>{String(index + 1).padStart(2, '0')}</span>
              </div>

              <div
                className="mb-4 h-12 w-12 grid place-items-center rounded-md border-2"
                style={{ borderColor: primaryColor, backgroundColor: primaryColor + '12' }}
              >
                {value.icon_url ? (
                  <img
                    src={value.icon_url}
                    alt={value.icon_alt || value.title}
                    className="w-6 h-6 object-contain"
                    style={{ filter: 'brightness(0) saturate(100%) opacity(0.8)' }}
                  />
                ) : (
                  <span className="text-lg font-black" style={{ color: primaryColor }}>◆</span>
                )}
              </div>

              <h3 className="text-lg font-black tracking-tight mb-2" style={{ color: textColor }}>
                {value.title}
              </h3>
              <p className="text-sm opacity-70 leading-relaxed" style={{ color: textColor }}>
                {value.description}
              </p>

              <div className="mt-4 pt-3 border-t-2 border-dashed flex items-center justify-between font-mono text-[9px] opacity-50" style={{ borderColor: 'rgba(15,23,42,0.18)', color: textColor }}>
                <span>REF · {String(index + 1).padStart(3, '0')}</span>
                <span>✓ STAMPED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
