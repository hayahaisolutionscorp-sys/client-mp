import type { PartnersTemplateProps } from "../../types";

export default function PartnersGlassmorphic({ partners, theme }: PartnersTemplateProps) {
  if (!partners || partners.length === 0) return null;

  return (
    <section id="Partners" className="relative px-4 sm:px-6 lg:px-10 py-20 overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col items-center">
            <h4 className="font-black text-xs uppercase tracking-[0.4em] mb-12 opacity-30 text-center" style={{ color: theme.text }}>Our Partners</h4>
            
            <div className="w-full relative py-12 rounded-[3.5rem] border border-white/40 bg-white/10 backdrop-blur-3xl shadow-xl flex items-center justify-center">
                 <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 px-10">
                    {partners.map((partner, index) => (
                      <div 
                        key={partner.id || index}
                        className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:scale-110"
                      >
                         {partner.logo_url ? (
                            <img src={partner.logo_url} alt={partner.name} className="h-10 w-auto object-contain" />
                         ) : (
                            <span className="font-black tracking-tighter opacity-50">{partner.name}</span>
                         )}
                      </div>
                    ))}
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
}
