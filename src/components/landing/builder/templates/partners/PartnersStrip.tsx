import type { PartnersTemplateProps } from "../../types";

export default function PartnersStrip({ partners, theme }: PartnersTemplateProps) {
  if (partners.length === 0) return null;
  return (
    <section id="Partner" className="py-16 px-4 sm:px-6 lg:px-10" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-2" style={{ color: theme.primary }}>
              Trusted By
            </p>
            <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
              Our Partners
            </h2>
          </div>
          <div
            className="h-px flex-1 max-w-xs hidden sm:block"
            style={{ backgroundColor: `color-mix(in srgb, ${theme.primary} 20%, #e2e8f0)` }}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {partners.map((partner, i) => (
            <div
              key={partner.id}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-[22px] p-6 border transition-all duration-300 hover:-translate-y-1"
              style={{
                borderColor: `color-mix(in srgb, ${theme.primary} 12%, #e2e8f0)`,
                backgroundColor: theme.surface,
                boxShadow: `0 2px 12px color-mix(in srgb, ${theme.primary} 8%, transparent)`,
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: theme.primary }}
              />
              <img
                src={partner.logo_url}
                alt={partner.name}
                className="h-12 w-auto object-contain transition-all duration-300"
              />
              <p className="text-xs font-medium text-center" style={{ color: theme.muted }}>
                {partner.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
