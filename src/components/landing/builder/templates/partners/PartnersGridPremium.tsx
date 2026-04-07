import type { PartnersTemplateProps } from "../../types";

export default function PartnersGridPremium({ partners, theme }: PartnersTemplateProps) {
  if (partners.length === 0) return null;

  return (
    <section className="py-24 px-6 lg:px-10 overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-20">
          <div className="max-w-2xl">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm"
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
            >
              Collaborating for Success
            </span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight" style={{ color: theme.text }}>
              Our Strategic Partners
            </h2>
          </div>
          <p className="lg:max-w-xs text-base leading-relaxed opacity-60 border-l-4 pl-6" style={{ borderColor: theme.primary }}>
            We work with the most trusted shipping and logistic providers in the industry.
          </p>
        </div>
 
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-12 sm:gap-x-10">
          {partners.map((partner, index) => (
            <div key={`${partner.id}-${index}`} className="group flex flex-col items-center">
                <div
                className="relative aspect-square w-full rounded-[40px] p-6 flex items-center justify-center transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 border border-black/5 group-hover:border-transparent"
                style={{ backgroundColor: theme.surface }}
                >
                    {/* Micro Icon / Tag Decoration */}
                    <div 
                    className="absolute -top-10 -right-10 size-24 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-700 blur-xl scale-75"
                    style={{ backgroundColor: theme.primary }}
                    />

                    <div className="relative size-full flex items-center justify-center transition-all duration-700 group-hover:scale-110">
                        {partner.logo_url ? (
                            <img
                                src={partner.logo_url}
                                alt={partner.name}
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <span className="text-4xl font-black opacity-10">{partner.name[0]}</span>
                        )}
                    </div>
                </div>

                {/* Name Label - Visible Always, but animates on hover */}
                <div className="mt-5 text-center px-2 transition-all duration-500 group-hover:scale-105">
                    <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2" style={{ color: theme.text }}>
                        {partner.name}
                    </p>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
