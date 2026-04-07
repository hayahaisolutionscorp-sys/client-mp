import type { PromotionsTemplateProps } from "../../types";

export default function PromotionsGrid({ promos, theme }: PromotionsTemplateProps) {
  const items = promos.filter((item) => item.is_active).slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section id="Promos" className="px-4 sm:px-6 lg:px-10 py-16" style={{ background: theme.surface }}>
      <div className="container mx-auto max-w-7xl">
        <div className="mb-10 text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: theme.muted }}>
            Promotions
          </p>
          <h2 className="mt-2 text-3xl font-bold" style={{ color: theme.text }}>
            Travel Promotions & Updates
          </h2>
        </div>

        {/* Dynamic Grid Layout - Container adjusts to image height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {items.map((promo, index) => (
            <div
              key={promo.id || index}
              className="flex flex-col group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
            >
              {/* Flexible Image Container - No padding or fixed height bg */}
              <div className="relative w-full overflow-hidden">
                {promo.image_url ? (
                  <img
                    src={promo.image_url}
                    alt={promo.image_alt || promo.title || "Promotion"}
                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-slate-100">
                    <span className="text-slate-400 font-medium">No Image</span>
                  </div>
                )}
                
                {/* Minimal Featured Badge Moved to top corner */}
                {index === 0 && (
                  <div 
                    className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-lg"
                    style={{ backgroundColor: theme.primary }}
                  >
                    Featured
                  </div>
                )}
              </div>

              {/* Content area at the bottom */}
              <div className="p-6 flex flex-col justify-end min-h-[100px]">
                <h3 className="text-lg font-bold line-clamp-1" style={{ color: theme.text }}>
                  {promo.title || "Promotion"}
                </h3>
                {promo.description && (
                  <p className="mt-2 text-sm leading-relaxed line-clamp-2" style={{ color: theme.muted }}>
                    {promo.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
