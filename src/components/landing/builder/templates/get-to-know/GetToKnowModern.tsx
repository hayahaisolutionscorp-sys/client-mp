import Media from "@/components/landing/Media";
import type { GetToKnowTemplateProps } from "../../types";

export default function GetToKnowModern({ main, mission, vision, theme }: GetToKnowTemplateProps) {
  const hasMedia = (main.bg_type === "video" || main.bg_type === "image" || main.bg_type === "youtube") && main.bg_url;

  return (
    <section className="py-24 px-6 lg:px-10 overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-16 lg:items-center">
          {/* Media Column (Sticky on LG) */}
          <div className="lg:w-1/2 relative lg:sticky lg:top-10">
            {hasMedia ? (
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/20 rounded-[48px] blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-1000" style={{ backgroundColor: theme.primary }} />
                <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl border-2 border-white/50">
                  <Media
                    src={main.bg_url!}
                    type={main.bg_type as "image" | "video" | "youtube"}
                    alt={main.bg_alt || main.title || "Our story"}
                    priority
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                {/* Decorative floating badge */}
                <div className="absolute -bottom-6 -right-6 font-black text-white px-8 py-6 rounded-3xl shadow-2xl rotate-3 sm:rotate-6 sm:translate-x-4 lg:translate-x-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: theme.primary }}>
                  EST. 2024
                </div>
              </div>
            ) : (
              <div className="aspect-[4/5] rounded-[40px] shadow-sm animate-pulse" style={{ backgroundColor: theme.surface }} />
            )}
          </div>

          {/* Content Column */}
          <div className="lg:w-1/2 space-y-10">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.25em] mb-4 inline-block" style={{ color: theme.primary }}>
                The Heart of Ayahay
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter" style={{ color: theme.text }}>
                {main.title || "Our Story"}
              </h2>
            </div>

            <p className="text-lg leading-relaxed opacity-60 font-medium whitespace-pre-wrap">
              {main.description}
            </p>

            {/* Mission & Vision Row Cards */}
            <div className="grid sm:grid-cols-2 gap-6">
              {[mission, vision].map((entry, i) => (
                <div 
                    key={entry.id || i}
                    className="p-8 rounded-[32px] border border-black/5 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1"
                    style={{ backgroundColor: theme.surface }}
                >
                  <div 
                    className="h-12 w-12 rounded-2xl mb-6 flex items-center justify-center font-black text-xl text-white shadow-lg"
                    style={{ backgroundColor: i === 0 ? theme.primary : theme.secondary }}
                  >
                    {i === 0 ? "M" : "V"}
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight" style={{ color: theme.text }}>{entry.title}</h3>
                  <p className="text-sm leading-relaxed opacity-60">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
