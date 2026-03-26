"use client";

import { useState } from "react";
import type { RoutesTemplateProps } from "../../types";

export default function RoutesMinimalList({ routes, theme }: RoutesTemplateProps) {
  const [visibleCount, setVisibleCount] = useState(4);
  const items = routes.slice(0, visibleCount);
  const [featured, ...rest] = items;
  if (routes.length === 0) return null;

  return (
    <section id="Routes" className="px-4 sm:px-6 lg:px-10 py-12" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8 border-b-2 border-black/5 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-1" style={{ color: theme.primary }}>
            Our Recommendations
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800">
            Most Popular Routes
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Route Banner */}
          {featured && (
            <div className="relative w-full flex-1 rounded-[32px] overflow-hidden group h-[300px] lg:h-[600px] lg:sticky lg:top-24 shadow-sm lg:self-start">
                {featured.image_url ? (
                  <img
                    src={featured.image_url}
                    alt={featured.image_alt || featured.route}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-100" />
                )}
                
                {/* Clean Bottom Label Overlay */}
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-3xl bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-between border border-white/40">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: theme.primary }}>Route 01</span>
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 line-clamp-1">{featured.route}</h3>
                    </div>
                </div>
            </div>
          )}

          {/* Side List Cards */}
          {rest.length > 0 && (
            <div className="flex flex-col gap-4 w-full lg:w-[420px] lg:self-start">
              {rest.map((route, i) => (
                <div
                  key={route.id || i}
                  className="group bg-white rounded-3xl p-4 flex items-center gap-5 border border-slate-100 transition-all duration-300 hover:shadow-lg hover:border-transparent cursor-pointer"
                >
                  {/* Thumbnail Side */}
                  <div className="size-16 rounded-2xl overflow-hidden bg-slate-50 flex-none relative">
                    {route.image_url ? (
                      <img
                        src={route.image_url}
                        alt={route.image_alt || route.route}
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100" />
                    )}
                  </div>

                  {/* Info Side */}
                  <div className="flex-1">
                    <h4 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors" style={{ color: theme.text }}>
                      {route.route}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 block mt-1">Recommended for You</span>
                  </div>

                  {/* Arrow Indicator */}
                  <div className="size-8 rounded-full flex items-center justify-center bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>
              ))}

              {/* Show More Trigger for List */}
              {routes.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount(routes.length)} // Show all for list variant as it's cleaner
                  className="w-full py-4 text-xs font-black uppercase tracking-widest text-[#24AAFF] hover:bg-slate-50 rounded-2xl transition-all border border-dashed border-slate-200"
                  style={{ color: theme.primary }}
                >
                  View All {routes.length - items.length} More Routes
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
