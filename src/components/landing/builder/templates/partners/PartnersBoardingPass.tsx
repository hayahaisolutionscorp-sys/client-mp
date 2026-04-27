import type { PartnersTemplateProps } from "../../types";

export default function PartnersBoardingPass({ partners, theme }: PartnersTemplateProps) {
  if (!partners || partners.length === 0) return null;

  return (
    <section id="Partners" className="relative px-4 py-14" style={{ backgroundColor: "#FAF7F0" }}>
      <div className="mx-auto max-w-5xl">
        <div
          className="relative rounded-xl border-2 overflow-hidden"
          style={{ backgroundColor: "#FFFDF7", borderColor: "rgba(15,23,42,0.14)" }}
        >
          <div className="flex items-center gap-3 px-5 py-3 border-b-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.18)" }}>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-70" style={{ color: theme.text }}>
              ✓ Endorsed By
            </span>
            <span className="flex-1 h-[1px] border-t border-dashed" style={{ borderColor: "rgba(15,23,42,0.18)" }} />
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] opacity-50" style={{ color: theme.text }}>
              Our Partners
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 px-6 py-10">
            {partners.map((partner, index) => (
              <div
                key={partner.id || index}
                className="grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300 hover:scale-105"
              >
                {partner.logo_url ? (
                  <img src={partner.logo_url} alt={partner.name} className="h-9 w-auto object-contain" />
                ) : (
                  <span className="font-black tracking-tight text-sm opacity-60" style={{ color: theme.text }}>
                    {partner.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
