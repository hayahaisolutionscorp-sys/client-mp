import type { GetToKnowTemplateProps } from "../../types";

export default function GetToKnowDefault({ main, mission, vision, theme }: GetToKnowTemplateProps) {
  return (
    <section className="bg-white px-6 py-16">
      <div className="container mx-auto max-w-7xl">
        <div
          className="overflow-hidden rounded-[34px] border"
          style={{ borderColor: `color-mix(in srgb, ${theme.primary} 14%, #e2e8f0)` }}
        >
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            <div
              className="min-h-[320px] p-8 text-white"
              style={{ background: `linear-gradient(145deg, ${theme.primary}, ${theme.secondary})` }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/65">
                About This Shipping Line
              </p>
              <h2 className="mt-4 text-3xl font-bold">{main.title}</h2>
              <p className="mt-4 text-sm leading-6 text-white/80">{main.description}</p>
            </div>
            <div className="grid gap-px bg-slate-200" style={{ backgroundColor: `color-mix(in srgb, ${theme.primary} 12%, #e2e8f0)` }}>
              {[mission, vision].map((entry) => (
                <div key={entry.id} className="bg-white p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em]" style={{ color: theme.primary }}>
                    {entry.title}
                  </p>
                  <p className="mt-4 text-sm leading-6" style={{ color: theme.muted }}>
                    {entry.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
