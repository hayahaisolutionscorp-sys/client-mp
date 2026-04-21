import type { PromotionsTemplateProps } from "../../types";

export default function PromotionsGlassmorphic({ promos, theme }: PromotionsTemplateProps) {
  const items = promos.filter((item) => item.is_active).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section id="Promos" className="relative px-4 sm:px-6 lg:px-10 py-20 overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
      {/* Decorative Orbs */}
      <div 
         className="absolute -right-20 -top-20 h-96 w-96 rounded-full blur-[120px] opacity-[0.2]"
         style={{ backgroundColor: theme.primary }}
      />
      <div 
         className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full blur-[100px] opacity-[0.1]"
         style={{ backgroundColor: '#ffffff' }}
      />
      <div className="container mx-auto max-w-7xl">
        <div className="mb-14 text-center">
            <p 
                className="mb-4 inline-block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-md border shadow-sm"
                style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}25`, color: theme.primary }}
            >
                Promotions
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: theme.text }}>
                Travel Offers & Updates
            </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((promo, index) => (
            <div
              key={promo.id || index}
              className="relative overflow-hidden flex flex-col justify-between rounded-[2.5rem] border border-white/40 p-8 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.45)' }}
            >
              <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300" 
                  style={{ background: `linear-gradient(135deg, transparent, ${theme.primary})` }} 
              />
              <div className="relative z-10 w-full aspect-video rounded-3xl overflow-hidden mb-8 border border-white/40 bg-white/30 shadow-inner">
                {promo.image_url ? (
                  <img
                    src={promo.image_url}
                    alt={promo.image_alt || promo.title || "Promotion"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-black/5" />
                )}
              </div>
              <div className="relative z-10 mb-6">
                <h3 className="mb-3 text-2xl font-bold tracking-tight line-clamp-2" style={{ color: theme.text }}>{promo.title}</h3>
                {promo.description && (
                  <p className="text-base font-medium line-clamp-3 opacity-80" style={{ color: theme.text }}>
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
