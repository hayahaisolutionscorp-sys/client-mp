import type { PromotionsTemplateProps } from "../../types";

export default function PromotionsBanner({ promos, theme }: PromotionsTemplateProps) {
  const items = promos.filter((item) => item.is_active).slice(0, 4);
  if (items.length === 0) return null;
  const [featured, ...rest] = items;
  return (
    <section id="Promos" className="px-4 sm:px-6 lg:px-10 py-16" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
              Promotions
            </p>
            <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text }}>
              Travel Promotions & Updates
            </h2>
          </div>
          <div className="hidden sm:block h-1 w-24 rounded-full" style={{ backgroundColor: theme.primary }} />
        </div>

        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden mb-6 group" style={{ minHeight: 360 }}>
          {featured.image_url ? (
            <img
              src={featured.image_url}
              alt={featured.image_alt || featured.title || "Promotion"}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
          <div className="relative flex flex-col justify-end h-full p-8 sm:p-12" style={{ minHeight: 360 }}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white w-fit mb-4"
              style={{ backgroundColor: theme.primary }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Featured Offer
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-white max-w-2xl">
              {featured.title || "Promotion"}
            </h3>
            {featured.description && (
              <p className="mt-3 text-base text-white/75 max-w-xl line-clamp-2">{featured.description}</p>
            )}
          </div>
        </div>

        {/* Side cards row */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rest.map((promo, index) => (
              <div
                key={promo.id}
                className="relative rounded-2xl overflow-hidden group"
                style={{ minHeight: 200 }}
              >
                {promo.image_url ? (
                  <img
                    src={promo.image_url}
                    alt={promo.image_alt || promo.title || "Promotion"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundColor: index % 2 === 0 ? theme.surface : theme.surfaceAlt }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div
                    className="w-8 h-0.5 mb-2 rounded-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <h3 className="text-base font-semibold text-white line-clamp-2">
                    {promo.title || "Promotion"}
                  </h3>
                  {promo.description && (
                    <p className="mt-1 text-xs text-white/70 line-clamp-1">{promo.description}</p>
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
