import type { WhyChooseTemplateProps } from "../../types";

export default function WhyChooseBoardingPass({ section, reasons, theme }: WhyChooseTemplateProps) {
  if (!reasons || reasons.length === 0) return null;

  return (
    <section id="WhyChoose" className="relative px-4 py-16 sm:py-20" style={{ backgroundColor: "#FAF7F0" }}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span
            className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] font-black px-3 py-1 border-2 rotate-[-2deg] mb-3"
            style={{ borderColor: theme.primary, color: theme.primary }}
          >
            ★ {section?.title || "Why Choose Us"}
          </span>
          {section?.subtitle && (
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-3" style={{ color: theme.text, fontFamily: "var(--font-title)" }}>
              {section.subtitle}
            </h2>
          )}
          {section?.description && (
            <p className="text-base opacity-70 leading-relaxed" style={{ color: theme.text }}>
              {section.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reasons.map((reason, index) => (
            <div
              key={reason.id || index}
              className="relative rounded-xl border-2 p-5 transition-all hover:-translate-y-1 hover:shadow-[0_16px_30px_-15px_rgba(15,23,42,0.25)]"
              style={{ backgroundColor: "#FFFDF7", borderColor: "rgba(15,23,42,0.14)" }}
            >
              {/* Punched corner */}
              <div
                className="absolute -top-2 -left-2 h-4 w-4 rounded-full border-2"
                style={{ backgroundColor: "#FAF7F0", borderColor: "rgba(15,23,42,0.14)" }}
              />
              <div
                className="absolute -top-2 -right-2 h-4 w-4 rounded-full border-2"
                style={{ backgroundColor: "#FAF7F0", borderColor: "rgba(15,23,42,0.14)" }}
              />

              <div className="flex items-center gap-2 mb-4 font-mono text-[9px] font-black uppercase tracking-[0.25em] opacity-60" style={{ color: theme.text }}>
                <span>Feature</span>
                <span>·</span>
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div
                className="mb-4 h-12 w-12 grid place-items-center rounded-md border-2"
                style={{ borderColor: theme.primary, backgroundColor: theme.primary + "12" }}
              >
                {reason.icon_url ? (
                  <img src={reason.icon_url} alt={reason.title} className="w-7 h-7 object-contain" />
                ) : (
                  <span className="text-xl font-black" style={{ color: theme.primary }}>★</span>
                )}
              </div>

              <h3 className="text-lg font-black tracking-tight mb-2" style={{ color: theme.text }}>
                {reason.title}
              </h3>
              <p className="text-sm opacity-70 leading-relaxed" style={{ color: theme.text }}>
                {reason.description}
              </p>

              <div className="mt-4 pt-3 border-t-2 border-dashed flex items-center justify-between font-mono text-[9px] opacity-50" style={{ borderColor: "rgba(15,23,42,0.18)", color: theme.text }}>
                <span>REF · {String(index + 1).padStart(3, "0")}</span>
                <span>✓ APPROVED</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
