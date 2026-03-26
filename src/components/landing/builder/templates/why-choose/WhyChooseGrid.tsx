import type { WhyChooseTemplateProps } from "../../types";

export default function WhyChooseGrid({ section, reasons, theme }: WhyChooseTemplateProps) {
  const items = reasons.slice(0, 6); // Support up to 6 in a grid
  if (items.length === 0) return null;

  return (
    <section id="WhyChooseUs" className="px-4 sm:px-6 lg:px-10 py-24" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16 px-4">
          <div className="max-w-2xl">
            <span 
              className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm"
              style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
            >
              Our Core Strengths
            </span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight" style={{ color: theme.text }}>
              {section?.title || "Why Choose Us"}
            </h2>
          </div>
          {section?.description && (
            <p className="lg:max-w-md text-base leading-relaxed opacity-70 border-l-4 pl-6" style={{ borderColor: theme.primary }}>
              {section.description}
            </p>
          )}
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((reason, index) => (
            <div
              key={reason.id}
              className="group relative p-10 rounded-[40px] border border-black/5 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              style={{ backgroundColor: theme.surface }}
            >
              {/* Background Glow */}
              <div 
                className="absolute -right-8 -top-8 size-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-3xl pointer-events-none"
                style={{ backgroundColor: theme.primary }}
              />

              <div
                className="flex size-16 items-center justify-center rounded-[24px] mb-8 transition-transform duration-500 group-hover:rotate-6 sm:group-hover:scale-110"
                style={{ backgroundColor: `${theme.primary}10` }}
              >
                <img src={reason.icon_url} alt={reason.icon_alt} className="h-9 w-9 object-contain" />
              </div>

              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-black opacity-5" style={{ color: theme.text }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl font-bold tracking-tight" style={{ color: theme.text }}>
                  {reason.title}
                </h3>
              </div>

              <p className="text-sm leading-7 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                {reason.description}
              </p>

              {/* Bottom Accent */}
              <div 
                className="absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-700"
                style={{ backgroundColor: theme.primary }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
