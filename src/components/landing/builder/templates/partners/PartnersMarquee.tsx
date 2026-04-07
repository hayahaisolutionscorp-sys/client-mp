'use client';

import type { PartnersTemplateProps } from "../../types";

export default function PartnersMarquee({ partners, theme }: PartnersTemplateProps) {
  if (partners.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const items = [...partners, ...partners, ...partners];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-10 overflow-hidden" style={{ backgroundColor: theme.surface }}>
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-xs font-black uppercase tracking-[0.35em] mb-4" style={{ color: theme.primary }}>
            Trusted By Our Network
          </p>
          <div className="h-0.5 w-16 bg-slate-100 mx-auto rounded-full" />
        </div>

        {/* Marquee Wrapper */}
        <div className="relative w-full flex overflow-hidden">
          <div className="flex animate-marquee hover:pause-marquee whitespace-nowrap gap-12 sm:gap-24 items-center py-8">
            {items.map((partner, index) => (
              <div 
                key={`${partner.id}-${index}`} 
                className="flex flex-col items-center group transition-all duration-500"
              >
                <div className="relative size-24 md:size-32 rounded-3xl bg-slate-50 flex items-center justify-center p-4 transition-all duration-500 group-hover:bg-white group-hover:scale-110 group-hover:shadow-2xl">
                   {partner.logo_url ? (
                    <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="w-full h-full object-contain"
                    />
                   ) : (
                    <div className="size-full bg-slate-100 flex items-center justify-center font-black opacity-20 text-4xl">
                        {partner.name[0]}
                    </div>
                   )}
                </div>
                <span className="mt-4 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity">
                    {partner.name}
                </span>
              </div>
            ))}
          </div>

          {/* Side Fades for Marquee */}
          <div 
            className="absolute inset-y-0 left-0 w-32 pointer-events-none z-10" 
            style={{ background: `linear-gradient(to right, ${theme.surface}, transparent)` }}
          />
          <div 
            className="absolute inset-y-0 right-0 w-32 pointer-events-none z-10" 
            style={{ background: `linear-gradient(to left, ${theme.surface}, transparent)` }}
          />
        </div>

        <style jsx>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 40s linear infinite;
            }
            .pause-marquee:hover {
                animation-play-state: paused;
            }
        `}</style>
      </div>
    </section>
  );
}
