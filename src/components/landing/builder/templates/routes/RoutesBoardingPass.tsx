import Link from "next/link";
import type { RoutesTemplateProps } from "../../types";

function portCode(name?: string | null) {
  if (!name) return "???";
  const s = name.replace(/[^A-Za-z]/g, "");
  return s.slice(0, 3).toUpperCase() || "???";
}

export default function RoutesBoardingPass({ routes, theme }: RoutesTemplateProps) {
  const items = routes.slice(0, 6);
  if (routes.length === 0) return null;

  return (
    <section id="Routes" className="relative px-4 py-16 sm:py-20" style={{ backgroundColor: "#F3EFE4" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span
              className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2 rotate-[-2deg] mb-3"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              ★ Gate · Destinations
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: theme.text, fontFamily: "var(--font-title)" }}>
              Most Popular Routes
            </h2>
          </div>
          <Link
            href="/route"
            className="self-start sm:self-end font-mono text-[11px] uppercase tracking-[0.2em] font-black px-4 py-2 border-2 hover:bg-white transition"
            style={{ borderColor: theme.text + "33", color: theme.text }}
          >
            All destinations ›
          </Link>
        </div>

        <ul className="flex flex-col gap-3">
          {items.map((route, i) => {
            const parts = (route.route || "").split(/\s*(?:to|→|-|–)\s*/i);
            const origin = parts[0] || route.route || "";
            const destination = parts[1] || "";
            return (
              <li
                key={route.id || i}
                className="relative rounded-xl border-2 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-12px_rgba(15,23,42,0.25)]"
                style={{ backgroundColor: "#FFFDF7", borderColor: "rgba(15,23,42,0.14)" }}
              >
                <div className="grid grid-cols-[auto_1fr_auto] items-stretch">
                  {/* Ticket index stub */}
                  <div
                    className="flex items-center justify-center px-4 sm:px-5 border-r-2 border-dashed"
                    style={{ borderColor: "rgba(15,23,42,0.18)", backgroundColor: theme.primary + "0f" }}
                  >
                    <span className="font-mono text-xs font-black tracking-[0.15em] opacity-60" style={{ color: theme.text }}>
                      #{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="px-4 sm:px-5 py-4">
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-50 mb-2" style={{ color: theme.text }}>
                      <span>Route</span>
                      <span className="flex-1 h-[1px] border-t border-dashed" style={{ borderColor: "rgba(15,23,42,0.2)" }} />
                      <span>Popular</span>
                    </div>
                    <div className="flex items-baseline gap-3 flex-wrap">
                      <span className="font-black text-lg sm:text-2xl tracking-tight" style={{ color: theme.text }}>
                        {portCode(origin)}
                      </span>
                      <span className="text-xl opacity-30">→</span>
                      <span className="font-black text-lg sm:text-2xl tracking-tight" style={{ color: theme.text }}>
                        {portCode(destination) || "•••"}
                      </span>
                      <span className="ml-2 text-sm opacity-60 truncate max-w-[50vw]" style={{ color: theme.text }}>
                        {route.route}
                      </span>
                    </div>
                  </div>

                  {route.image_url ? (
                    <div className="hidden sm:block w-32 relative border-l-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.18)" }}>
                      <img
                        src={route.image_url}
                        alt={route.image_alt || route.route}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center justify-center w-32 border-l-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.18)" }}>
                      <span className="font-mono text-[10px] uppercase opacity-40">No img</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
