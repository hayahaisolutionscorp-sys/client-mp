import type { WhyChooseTemplateProps } from "../../types";

export default function WhyChooseMinimal({ section, reasons, theme }: WhyChooseTemplateProps) {
  const items = reasons.slice(0, 4); // Optimal for this layout
  if (items.length === 0) return null;

  return (
    <section id="WhyChooseUs" className="bg-white px-6 py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-start">
          {/* Static Header Column */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 self-start pr-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter" style={{ color: theme.text }}>
              {section?.title || "Why Choose Us"}
            </h2>
            <div className="h-1.5 w-16 mb-8 rounded-full" style={{ backgroundColor: theme.primary }} />
            <p className="text-lg leading-relaxed font-medium opacity-60" style={{ color: theme.text }}>
              {section?.description || "Experience the most reliable ferry booking platform in the Philippines."}
            </p>
          </div>

          {/* Dynamic List Column */}
          <div className="lg:w-2/3 space-y-12">
            {items.map((reason, index) => (
              <div 
                key={reason.id} 
                className="group flex flex-col sm:flex-row gap-8 items-start sm:items-center p-8 rounded-[40px] transition-all hover:bg-slate-50 duration-500 hover:shadow-xl hover:-translate-x-1"
              >
                {/* Number / Icon Compound */}
                <div className="relative shrink-0 flex items-center justify-center">
                   <div 
                    className="absolute inset-0 scale-150 rotate-45 opacity-0 group-hover:opacity-10 transition-all duration-700 blur-xl"
                    style={{ backgroundColor: theme.primary }}
                   />
                    <div className="size-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:border-transparent group-hover:shadow-lg">
                        <img src={reason.icon_url} alt={reason.icon_alt} className="h-10 w-10 object-contain" />
                    </div>
                    <span 
                      className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-[10px] font-black text-white shadow-xl"
                      style={{ backgroundColor: theme.primary }}
                    >
                      0{index + 1}
                    </span>
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors" style={{ color: theme.text }}>
                    {reason.title}
                  </h3>
                  <p className="text-base leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
