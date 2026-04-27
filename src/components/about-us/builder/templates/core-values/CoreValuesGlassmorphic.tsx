import { Card, CardContent } from '@/components/ui/Card';
import type { ICoreValue } from '@/models';

interface CoreValuesGlassmorphicProps {
  coreValues: ICoreValue[];
  primaryColor: string;
  textColor: string;
  surfaceColor: string;
  surfaceAltColor: string;
  textOnSurfaceAlt: string;
}

export default function CoreValuesGlassmorphic({
  coreValues,
  primaryColor,
  textColor,
  surfaceColor,
  surfaceAltColor,
  textOnSurfaceAlt,
}: CoreValuesGlassmorphicProps) {
  if (coreValues.length === 0) {
    return null;
  }

  // Determine muted color for text
  const mutedTextColor = textOnSurfaceAlt === '#f8fafc' ? 'rgba(240,240,240,0.8)' : 'rgba(70,80,100,0.8)';

  return (
    <section className="relative w-full px-2 py-12 overflow-visible">
      <div 
        className="absolute right-1/4 top-1/2 -z-10 h-[400px] w-[500px] -translate-y-1/2 rounded-[100%] blur-[130px] opacity-[0.1]"
        style={{ backgroundColor: primaryColor }}
      />

      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
            <p
            className="mb-4 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-md border shadow-sm"
            style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}25`, color: primaryColor }}
            >
            What We Stand For
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight" style={{ color: textColor }}>
                Our Core Values
            </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coreValues.map((value) => (
            <div 
              key={value.id} 
              className="relative overflow-hidden rounded-[2rem] border border-white/40 p-8 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] group"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)' }}
            >
                {/* Hover gradient effect inside card */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300" 
                    style={{ background: `linear-gradient(135deg, transparent, ${primaryColor})` }} 
                />

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div 
                        className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] shadow-inner border border-white/50 backdrop-blur-md"
                        style={{ backgroundColor: `${primaryColor}15` }}
                    >
                        <img
                        src={value.icon_url}
                        alt={value.icon_alt || value.title}
                        className="h-10 w-10 object-contain drop-shadow-sm"
                        style={{ filter: 'brightness(0) saturate(100%) opacity(0.8)' }}
                        />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold tracking-tight" style={{ color: textOnSurfaceAlt }}>
                        {value.title}
                    </h3>
                    <p className="text-base font-medium leading-relaxed" style={{ color: mutedTextColor }}>
                        {value.description}
                    </p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
