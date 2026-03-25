import type { RoutesTemplateProps } from "../../types";

export default function RoutesGrid({ routes, theme }: RoutesTemplateProps) {
  const items = routes.slice(0, 6);
  if (items.length === 0) return null;

  return (
    <section id="Routes" className="bg-white px-6 py-14">
      <div className="container mx-auto max-w-7xl">
        <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
          Most Popular Routes Recommended For You
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((route) => (
            <div
              key={route.id}
              className="overflow-hidden rounded-[28px] border bg-slate-50"
              style={{ borderColor: `color-mix(in srgb, ${theme.primary} 12%, #e2e8f0)` }}
            >
              <div className="h-40 bg-slate-200">
                {route.image_url ? (
                  <img src={route.image_url} alt={route.image_alt || route.route} className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-5">
                <p className="font-semibold" style={{ color: theme.text }}>{route.route}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
