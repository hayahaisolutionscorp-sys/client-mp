import Link from "next/link";
import type { RoutesTemplateProps } from "../../types";

export default function RoutesGlassmorphic({ routes, theme }: RoutesTemplateProps) {
  const items = routes.slice(0, 6);
  if (routes.length === 0) return null;

  return (
    <section id="Routes" className="relative px-4 sm:px-6 lg:px-10 py-20 overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
      {/* Decorative Orbs */}
      <div 
         className="absolute -right-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-[0.2]"
         style={{ backgroundColor: theme.primary }}
      />
      <div 
         className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full blur-[100px] opacity-[0.1]"
         style={{ backgroundColor: '#ffffff' }}
      />
      <div className="container mx-auto max-w-7xl">
        <div className="mb-14 text-center">
            <p 
                className="mb-4 inline-block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-md border shadow-sm"
                style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}25`, color: theme.primary }}
            >
                Destinations
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: theme.text }}>
                Most Popular Routes
            </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((route, i) => (
            <div
              key={route.id || i}
              className="group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <div className="absolute inset-0 z-0">
                {route.image_url ? (
                  <img
                    src={route.image_url}
                    alt={route.image_alt || route.route}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>
              <div 
                  className="absolute inset-0 z-10 transition-colors duration-500 bg-gradient-to-t from-black/80 via-black/20 to-transparent mix-blend-multiply" 
              />
              <div className="absolute inset-0 z-10 bg-black/10 backdrop-blur-[2px]" />
              
              <div className="relative z-20 flex h-full flex-col justify-end pt-32">
                <h3 className="text-2xl font-extrabold text-white drop-shadow-md">
                  {route.route}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <Link
            href="/route"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full border border-white/40 bg-white/10 backdrop-blur-xl text-sm font-black uppercase tracking-widest transition-all duration-500 hover:bg-white/20 hover:shadow-2xl hover:scale-105 active:scale-95 group"
            style={{ color: theme.text }}
          >
            <span>See All Destinations</span>
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 group-hover:translate-x-1"
              style={{ backgroundColor: theme.primary }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
