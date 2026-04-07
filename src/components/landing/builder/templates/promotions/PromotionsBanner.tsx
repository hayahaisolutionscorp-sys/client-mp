import type { PromotionsTemplateProps } from "../../types";

export default function PromotionsBanner({ promos, theme }: PromotionsTemplateProps) {
  const items = promos.filter((item) => item.is_active).slice(0, 4);
  if (items.length === 0) return null;
  const [featured, ...rest] = items;

  return (
    <section id="Promos" className="px-4 sm:px-6 lg:px-10 py-16" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 flex items-center justify-between border-b border-black/5 pb-6">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: theme.primary }}>
              Promotions
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900">
              Travel Promotions & Updates
            </h2>
          </div>
          <div className="hidden sm:block h-1 w-20 rounded-full" style={{ backgroundColor: theme.primary }} />
        </div>

        {/* Improved Featured Split Banner - No Overlap */}
        <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden mb-10 transition-shadow duration-500 hover:shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Content Column */}
            <div className="p-8 sm:p-12 flex flex-col justify-center items-start order-2 lg:order-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white mb-6"
                style={{ backgroundColor: theme.primary }}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Featured Offer
              </div>
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-6">
                {featured.title || "Promotion"}
              </h3>
              {featured.description && (
                <p className="text-base sm:text-lg text-slate-500 max-w-lg leading-relaxed mb-8">
                  {featured.description}
                </p>
              )}
              {/* Optional CTA but we keep it simple for now as it follows builder props */}
            </div>

            {/* Right Image Column */}
            <div className="relative bg-slate-50 flex items-center justify-center p-6 lg:p-0 order-1 lg:order-2 overflow-hidden h-[300px] lg:h-auto">
              {featured.image_url ? (
                <img
                  src={featured.image_url}
                  alt={featured.image_alt || featured.title || "Promotion"}
                  className="w-full h-full object-contain transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-slate-100" />
              )}
            </div>
          </div>
        </div>

        {/* Improved Side Cards - Horizontal Layout (Image Left, Content Right) */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rest.map((promo, index) => (
              <div
                key={promo.id || index}
                className="bg-white rounded-[32px] overflow-hidden group border border-slate-100 flex flex-col sm:flex-row transition-all duration-300 hover:shadow-lg"
              >
                {/* Fixed Square Image Side */}
                <div className="w-full sm:w-[180px] h-[180px] flex-shrink-0 bg-slate-50 relative overflow-hidden">
                  {promo.image_url ? (
                    <img
                      src={promo.image_url}
                      alt={promo.image_alt || promo.title || "Promotion"}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100" />
                  )}
                </div>

                {/* Content Side */}
                <div className="p-6 flex flex-col justify-center gap-2">
                  <div className="w-8 h-1 rounded-full" style={{ backgroundColor: theme.primary }} />
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2">
                    {promo.title || "Promotion"}
                  </h3>
                  {promo.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {promo.description}
                    </p>
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
