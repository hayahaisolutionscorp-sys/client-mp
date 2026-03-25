import type { PromotionsTemplateProps } from "../../types";

export default function PromotionsGrid({ promos, theme }: PromotionsTemplateProps) {
  const items = promos.filter((item) => item.is_active).slice(0, 6);
  if (items.length === 0) return null;
  const [featured, ...rest] = items;
  return (
    <section id="Promos" className="px-4 sm:px-6 lg:px-10 py-16" style={{ backgroundColor: theme.surface }}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
            Promotions
          </p>
          <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text }}>
            Travel Promotions & Updates
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Featured large card */}
          <div
            className="lg:col-span-2 relative rounded-3xl overflow-hidden min-h-[320px] group"
            style={{ borderLeft: `4px solid ${theme.primary}` }}
          >
            {featured.image_url ? (
              <img
                src={featured.image_url}
                alt={featured.image_alt || featured.title || "Promotion"}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: theme.surfaceAlt }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-3"
                style={{ backgroundColor: theme.primary }}
              >
                Featured
              </span>
              <h3 className="text-2xl font-bold text-white">{featured.title || "Promotion"}</h3>
              {featured.description && (
                <p className="mt-2 text-sm text-white/80 line-clamp-2">{featured.description}</p>
              )}
            </div>
          </div>
          {/* Side cards */}
          <div className="flex flex-col gap-4">
            {rest.slice(0, 2).map((promo) => (
              <div
                key={promo.id}
                className="relative rounded-2xl overflow-hidden flex-1 min-h-[148px] group"
              >
                {promo.image_url ? (
                  <img
                    src={promo.image_url}
                    alt={promo.image_alt || promo.title || "Promotion"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0" style={{ backgroundColor: theme.surfaceAlt }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="text-base font-semibold text-white">{promo.title || "Promotion"}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom row */}
        {rest.length > 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {rest.slice(2, 5).map((promo) => (
              <div
                key={promo.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                style={{ borderColor: `color-mix(in srgb, ${theme.primary} 12%, #e2e8f0)` }}
              >
                <div className="h-36 w-full bg-slate-100">
                  {promo.image_url && (
                    <img
                      src={promo.image_url}
                      alt={promo.image_alt || promo.title || "Promotion"}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold" style={{ color: theme.text }}>{promo.title || "Promotion"}</h3>
                  {promo.description && (
                    <p className="mt-1 text-xs leading-5 line-clamp-2" style={{ color: theme.muted }}>{promo.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
