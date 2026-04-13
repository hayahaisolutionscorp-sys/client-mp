"use client";

import { useState } from "react";
import type { RoutesTemplateProps } from "../../types";

export default function RoutesCarousel({ routes, theme }: RoutesTemplateProps) {
  const [visibleCount, setVisibleCount] = useState(6);
  const items = routes.slice(0, visibleCount);
  if (routes.length === 0) return null;
  return (
    <section id="Routes" className="py-16 px-4 sm:px-6 lg:px-10" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: theme.primary }}>
              Explore Destinations
            </p>
            <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
              Popular Routes
            </h2>
          </div>
          <div
            className="h-1 w-16 rounded-full hidden sm:block"
            style={{ backgroundColor: theme.primary }}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((route, i) => (
            <div
              key={route.id}
              className="relative overflow-hidden rounded-[24px] h-52"
              style={{ boxShadow: `0 4px 24px color-mix(in srgb, ${theme.primary} 18%, transparent)` }}
            >
              {route.image_url ? (
                <img
                  src={route.image_url}
                  alt={route.image_alt || route.route}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div
                  className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-2"
                  style={{ backgroundColor: theme.primary, color: "#fff" }}
                >
                  Route {i + 1}
                </div>
                <p className="text-white font-semibold text-base leading-tight">{route.route}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Show More Button */}
        {routes.length > visibleCount && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setVisibleCount(routes.length)}
              className="px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-105"
              style={{ backgroundColor: theme.primary }}
            >
              See All {routes.length - items.length} More Routes
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
