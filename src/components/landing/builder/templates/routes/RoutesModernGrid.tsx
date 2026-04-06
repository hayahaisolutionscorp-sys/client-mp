"use client";

import { useState } from "react";
import type { RoutesTemplateProps } from "../../types";

export default function RoutesModernGrid({ routes, theme }: RoutesTemplateProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const items = routes.slice(0, visibleCount);
  if (routes.length === 0) return null;

  return (
    <section id="Routes" className="px-4 sm:px-6 lg:px-10 py-20" style={{ background: theme.surface }}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] mb-3" style={{ color: theme.primary }}>
              Popular Destinations
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight" style={{ color: theme.text }}>
              Explore Our Most <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }}>
                Popular Routes
              </span>
            </h2>
          </div>
          <div className="hidden md:block h-px flex-1 mx-10 bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((route, index) => (
            <div
              key={route.id || index}
              className="group flex flex-col bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            >
              {/* Image with Accent Glow */}
              <div className="relative h-64 overflow-hidden">
                {route.image_url ? (
                  <img
                    src={route.image_url}
                    alt={route.image_alt || route.route}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Floating Index Tag */}
                <div 
                  className="absolute top-6 right-6 size-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg backdrop-blur-md border border-white/20"
                  style={{ backgroundColor: `${theme.primary}CC` }}
                >
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Enhanced Content area */}
              <div className="p-8 flex flex-col flex-grow items-start">
                <div 
                  className="w-10 h-1 rounded-full mb-4 transition-all duration-500 group-hover:w-20"
                  style={{ backgroundColor: theme.primary }}
                />
                <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-primary transition-colors duration-300" style={{ color: theme.text }}>
                  {route.route}
                </h3>
                <p className="text-sm font-medium leading-relaxed" style={{ color: theme.muted }}>
                  Click to view seasonal schedules and secure your booking for this popular route.
                </p>
                
                {/* Micro Action */}
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: theme.primary }}>
                  View Schedules
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {routes.length > visibleCount && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 9)}
              className="px-10 py-4 rounded-full text-sm font-black uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
              style={{ backgroundColor: theme.primary }}
            >
              See More Routes
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
