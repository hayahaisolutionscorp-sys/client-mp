import type { GetToKnowTemplateProps } from "../../types";

export default function GetToKnowTimeline({ main, mission, vision, theme }: GetToKnowTemplateProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-10 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: theme.primary }}>
            Get To Know Us
          </p>
          <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
            {main.title}
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: main description with accent bar */}
          <div
            className="rounded-[28px] p-8 relative overflow-hidden"
            style={{ backgroundColor: theme.surfaceAlt, borderLeft: `5px solid ${theme.primary}` }}
          >
            <p className="text-sm leading-7" style={{ color: theme.muted }}>
              {main.description}
            </p>
            <div
              className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full opacity-10"
              style={{ backgroundColor: theme.primary }}
            />
          </div>
          {/* Right: mission + vision timeline */}
          <div className="flex flex-col gap-6 relative">
            <div
              className="absolute left-6 top-8 bottom-8 w-px"
              style={{ backgroundColor: `color-mix(in srgb, ${theme.primary} 20%, #e2e8f0)` }}
            />
            {[mission, vision].map((entry, i) => (
              <div key={entry.id} className="flex gap-5 relative">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div
                    className="flex size-12 items-center justify-center rounded-full text-white text-sm font-bold z-10"
                    style={{ backgroundColor: i === 0 ? theme.primary : theme.secondary }}
                  >
                    {i + 1}
                  </div>
                </div>
                <div
                  className="flex-1 rounded-[20px] p-6 border"
                  style={{ borderColor: `color-mix(in srgb, ${theme.primary} 12%, #e2e8f0)` }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.18em] mb-2"
                    style={{ color: theme.primary }}
                  >
                    {entry.title}
                  </p>
                  <p className="text-sm leading-6" style={{ color: theme.muted }}>
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
