import type { PromotionsTemplateProps } from "../../types";

export default function PromotionsBoardingPass({ promos, theme }: PromotionsTemplateProps) {
  const items = promos.filter((item) => item.is_active).slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section id="Promos" className="relative px-4 py-16 sm:py-20" style={{ backgroundColor: "#FAF7F0" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <span
            className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2 rotate-[-2deg] mb-3"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            ★ Stamp · Offers
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: theme.text, fontFamily: "var(--font-title)" }}>
            Travel Offers & Updates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {items.map((promo, index) => (
            <article
              key={promo.id || index}
              className="relative rounded-xl border-2 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_30px_-15px_rgba(15,23,42,0.25)]"
              style={{ backgroundColor: "#FFFDF7", borderColor: "rgba(15,23,42,0.14)" }}
            >
              {/* Stub header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.15)" }}>
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: theme.text }}>
                  Deal · {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-[9px] opacity-50" style={{ color: theme.text }}>VALID</span>
              </div>

              {promo.image_url ? (
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={promo.image_url}
                    alt={promo.image_alt || promo.title || ""}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-slate-100" />
              )}

              <div className="p-5">
                <h3 className="text-lg font-black tracking-tight mb-2 line-clamp-2" style={{ color: theme.text }}>
                  {promo.title}
                </h3>
                {promo.description && (
                  <p className="text-sm opacity-70 line-clamp-3 leading-relaxed" style={{ color: theme.text }}>
                    {promo.description}
                  </p>
                )}
              </div>

              {/* Barcode footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.15)" }}>
                <div className="flex gap-[2px] items-end h-3 overflow-hidden flex-1 opacity-70 mr-3">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="block" style={{ backgroundColor: theme.text, width: (i % 4 === 0 ? 2 : 1) + "px", height: "100%", opacity: 0.7 }} />
                  ))}
                </div>
                <span className="font-mono text-[9px] tracking-[0.15em] opacity-50" style={{ color: theme.text }}>
                  PRM-{String(index + 1).padStart(3, "0")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
