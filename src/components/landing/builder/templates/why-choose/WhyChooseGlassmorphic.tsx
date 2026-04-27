import type { WhyChooseTemplateProps } from "../../types";

export default function WhyChooseGlassmorphic({ section, reasons, theme }: WhyChooseTemplateProps) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <section id="WhyChoose" className="relative px-4 sm:px-6 lg:px-10 py-24 overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
      {/* Background Orbs */}
      <div 
        className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-[120px] opacity-[0.1]"
        style={{ backgroundColor: theme.primary }}
      />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
             <p 
                className="mb-4 inline-block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-md border shadow-sm"
                style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}25`, color: theme.primary }}
            >
                {section?.title || "Why Choose Us"}
            </p>
            {section?.subtitle && (
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6" style={{ color: theme.text }}>
                    {section.subtitle}
                </h2>
            )}
            {section?.description && (
                <p className="text-lg opacity-70 font-medium leading-relaxed" style={{ color: theme.text }}>
                    {section.description}
                </p>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {reasons.map((reason, index) => (
                <div 
                    key={reason.id || index}
                    className="group relative overflow-hidden rounded-[3rem] border border-white/40 bg-white/20 p-8 shadow-xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                    <div className="mb-8 relative flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white/40 border border-white/60 shadow-inner group-hover:scale-110 transition-transform">
                         {reason.icon_url ? (
                            <img src={reason.icon_url} alt={reason.title} className="w-10 h-10 object-contain" />
                         ) : (
                            <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.primary }} />
                         )}
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 tracking-tight" style={{ color: theme.text }}>
                        {reason.title}
                    </h3>
                    <p className="text-base leading-relaxed opacity-70 font-medium" style={{ color: theme.text }}>
                        {reason.description}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
