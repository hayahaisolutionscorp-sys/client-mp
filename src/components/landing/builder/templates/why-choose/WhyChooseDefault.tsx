import type { WhyChooseTemplateProps } from "../../types";

export default function WhyChooseDefault({ section, reasons, theme }: WhyChooseTemplateProps) {
  const items = reasons.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section id="WhyChooseUs" className="px-6 py-16" style={{ background: theme.surface }}>
      <div className="container mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
            {section?.title || "Why Choose Us"}
          </h2>
          <p className="mt-4 text-sm leading-6" style={{ color: theme.muted }}>
            {section?.description}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map((reason) => (
            <div
              key={reason.id}
              className="rounded-[26px] border p-6"
              style={{
                borderColor: `color-mix(in srgb, ${theme.primary} 14%, #e2e8f0)`,
                background: theme.surfaceAlt,
              }}
            >
              <div
                className="flex size-14 items-center justify-center rounded-[20px]"
                style={{ backgroundColor: `color-mix(in srgb, ${theme.secondary} 40%, white)` }}
              >
                <img src={reason.icon_url} alt={reason.icon_alt} className="h-8 w-8 object-contain" />
              </div>
              <h3 className="mt-5 text-xl font-semibold" style={{ color: theme.text }}>
                {reason.title}
              </h3>
              <p className="mt-3 text-sm leading-6" style={{ color: theme.muted }}>
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
