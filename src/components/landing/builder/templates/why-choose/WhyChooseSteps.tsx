import type { WhyChooseTemplateProps } from "../../types";
export default function WhyChooseSteps({ section, reasons, theme }: WhyChooseTemplateProps) {
  if (reasons.length === 0) return null;
  return (
    <section id="WhyChooseUs" className="py-16 px-4 sm:px-6 lg:px-10" style={{ background: `linear-gradient(160deg, ${theme.primary} 0%, ${theme.accent} 100%)` }}>
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3 text-white/60">
            Our Advantages
          </p>
          <h2 className="text-3xl font-bold text-white">
            {section?.title || "Why Choose Us"}
          </h2>
          {section?.description && (
            <p className="mt-4 text-sm leading-6 text-white/75 max-w-xl mx-auto">
              {section.description}
            </p>
          )}
        </div>
        <div className="relative">
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-10">
            {reasons.map((reason, i) => (
              <div key={reason.id} className="relative flex flex-col items-center text-center lg:w-[300px]">
                <div className="relative mb-6">
                  {i < reasons.length - 1 && (
                    <div className="pointer-events-none absolute top-1/2 left-full hidden h-px w-10 -translate-y-1/2 bg-white/20 lg:block" />
                  )}
                  <div
                    className="flex size-20 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm"
                  >
                    <img src={reason.icon_url} alt={reason.icon_alt} className="h-9 w-9 object-contain" />
                  </div>
                  <div
                    className="absolute -top-2 -right-2 flex size-7 items-center justify-center rounded-full text-xs font-bold"
                    style={{ backgroundColor: theme.secondary, color: theme.accent }}
                  >
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{reason.title}</h3>
                <p className="text-sm leading-6 text-white/75">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
