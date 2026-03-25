import type { PartnersTemplateProps } from "../../types";

export default function PartnersDefault({ partners, theme }: PartnersTemplateProps) {
  if (partners.length === 0) return null;

  return (
    <section id="Partner" className="bg-white px-6 py-14">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-center text-3xl font-bold" style={{ color: theme.text }}>
          Our Partners
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center rounded-[26px] border p-5"
              style={{
                borderColor: `color-mix(in srgb, ${theme.primary} 12%, #e2e8f0)`,
                backgroundColor: theme.surfaceAlt,
              }}
            >
              <img src={partner.logo_url} alt={partner.name} className="h-14 w-auto object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
