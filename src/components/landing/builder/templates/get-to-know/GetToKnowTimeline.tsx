import Media from "@/components/landing/Media";
import type { GetToKnowTemplateProps } from "../../types";

export default function GetToKnowTimeline({ main, mission, vision, theme }: GetToKnowTemplateProps) {
  const hasMedia = (main.bg_type === "video" || main.bg_type === "image" || main.bg_type === "youtube") && main.bg_url;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-10 bg-white">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] mb-3" style={{ color: theme.primary }}>
            Get To Know Us
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: theme.text }}>
            {main.title || "Our Story"}
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left / Top Side: Media & Description */}
          <div className="lg:col-span-7 space-y-8">
            {hasMedia && (
              <div className="aspect-video w-full rounded-[40px] overflow-hidden shadow-2xl bg-slate-100 border-8 border-slate-50">
                <Media
                  src={main.bg_url!}
                  type={main.bg_type as "image" | "video" | "youtube"}
                  alt={main.bg_alt || main.title || "About us"}
                  priority
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            )}
            
            <div
              className="rounded-[32px] p-10 relative overflow-hidden shadow-sm"
              style={{ backgroundColor: theme.surfaceAlt, borderLeft: `6px solid ${theme.primary}` }}
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10"
                style={{ backgroundColor: theme.primary }}
              />
              <p className="text-lg leading-relaxed font-medium" style={{ color: theme.text }}>
                   {main.description}
              </p>
            </div>
          </div>

          {/* Right Side: Mission + Vision Timeline */}
          <div className="lg:col-span-5 flex flex-col gap-8 relative mt-4">
            <div
              className="absolute left-7 top-10 bottom-10 w-1 rounded-full opacity-20"
              style={{ backgroundColor: theme.primary }}
            />
            
            {[mission, vision].map((entry, i) => (
              <div key={entry.id || i} className="group flex gap-8 relative">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div
                    className="flex size-14 items-center justify-center rounded-2xl text-white text-lg font-black z-10 shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                    style={{ backgroundColor: i === 0 ? theme.primary : theme.secondary }}
                  >
                    {i + 1}
                  </div>
                </div>
                <div
                  className="flex-1 rounded-[30px] p-8 border bg-white transition-all duration-500 group-hover:shadow-2xl group-hover:border-transparent group-hover:-translate-y-1"
                  style={{ borderColor: `color-mix(in srgb, ${theme.primary} 10%, #f1f5f9)` }}
                >
                  <p
                    className="text-xs font-black uppercase tracking-[0.25em] mb-4"
                    style={{ color: i === 0 ? theme.primary : theme.secondary }}
                  >
                    {entry.title || (i === 0 ? "Our Mission" : "Our Vision")}
                  </p>
                  <p className="text-base leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                    {entry.description}
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
