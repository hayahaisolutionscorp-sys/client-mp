import type { PromotionsTemplateProps } from "../../types";

export default function PromotionsCarousel({ promos, theme }: PromotionsTemplateProps) {
  const items = promos.filter((item) => item.is_active).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section id="Promos" className="px-6 py-14" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
            Promotions
          </p>
          <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text }}>
            Travel Promotions & Updates
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((promo, index) => (
            <div
              key={promo.id}
              className="overflow-hidden rounded-[28px] border bg-white shadow-sm"
              style={{ borderColor: `color-mix(in srgb, ${theme.primary} 12%, #e2e8f0)` }}
            >
              <div className="h-44 w-full bg-slate-200">
                {promo.image_url ? (
                  <img
                    src={promo.image_url}
                    alt={promo.image_alt || promo.title || "Promotion"}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: index === 0 ? theme.primary : theme.muted }}>
                  Featured Offer
                </p>
                <h3 className="mt-3 text-xl font-semibold" style={{ color: theme.text }}>
                  {promo.title || "Promotion"}
                </h3>
                <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>
                  {promo.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
