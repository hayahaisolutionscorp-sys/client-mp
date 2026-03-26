import Media from "@/components/landing/Media";
import type { GetToKnowTemplateProps } from "../../types";

export default function GetToKnowCenter({ main, mission, vision, theme }: GetToKnowTemplateProps) {
  const hasMedia = (main.bg_type === "video" || main.bg_type === "image" || main.bg_type === "youtube") && main.bg_url;

  return (
    <section className="relative py-24 px-6 lg:px-10 min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Dynamic Background Media */}
      {hasMedia ? (
        <div className="absolute inset-x-0 top-0 h-[650px] w-full z-0 overflow-hidden rounded-b-[60px]">
          <Media
            src={main.bg_url!}
            type={main.bg_type as "image" | "video" | "youtube"}
            className="w-full h-full object-cover grayscale opacity-30 contrast-125"
            autoPlay
            muted
            loop
            playsInline
          />
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              background: `linear-gradient(to bottom, ${theme.surface}, transparent 30%, ${theme.surface})` 
            }} 
          />
        </div>
      ) : (
        <div className="absolute inset-0 z-0" style={{ backgroundColor: theme.surfaceAlt }} />
      )}

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.3em] mb-4 inline-block" style={{ color: theme.primary }}>
            Behind the Scenes
          </span>
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter" style={{ color: theme.text }}>
            {main.title || "The Vision Behind Our Platform"}
          </h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-10" style={{ backgroundColor: theme.primary }} />
          <p className="text-lg md:text-xl font-medium leading-relaxed opacity-60">
             {main.description}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 justify-center">
            {[mission, vision].map((entry, i) => (
                <div 
                    key={entry.id || i}
                    className="flex-1 bg-white/70 backdrop-blur-3xl rounded-[48px] p-12 border border-white/40 shadow-2xl transition-all duration-700 hover:scale-105 hover:bg-white/90 group"
                >
                    <div 
                        className="size-16 rounded-3xl flex items-center justify-center mb-8 rotate-12 transition-transform duration-700 group-hover:rotate-0"
                        style={{ backgroundColor: i === 0 ? theme.primary : theme.secondary }}
                    >
                        <img src="/logo_white.png" alt="logo" className="size-10 object-contain opacity-20" />
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight" style={{ color: theme.text }}>{entry.title}</h3>
                    <p className="text-base leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                        {entry.description}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
