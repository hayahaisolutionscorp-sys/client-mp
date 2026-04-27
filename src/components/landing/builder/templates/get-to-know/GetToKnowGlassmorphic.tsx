import Media from "@/components/landing/Media";
import type { GetToKnowTemplateProps } from "../../types";

export default function GetToKnowGlassmorphic({ main, mission, vision, theme }: GetToKnowTemplateProps) {
  if (!main) return null;

  const hasMedia =
    (main.bg_type === "video" || main.bg_type === "image" || main.bg_type === "youtube") && main.bg_url;

  return (
    <section id="About" className="relative px-4 sm:px-6 lg:px-10 py-24 overflow-hidden" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            
            {/* Visual Side */}
            <div className="relative">
                <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-white/40 shadow-2xl z-20">
                     {hasMedia ? (
                        <Media
                            src={main.bg_url!}
                            type={main.bg_type as "image" | "video" | "youtube"}
                            alt={main.bg_alt || main.title || "About Us"}
                            priority={main.bg_type === "image"}
                            autoPlay={main.bg_type === "video"}
                            playing={main.bg_type === "youtube"}
                            muted={main.bg_type !== "image"}
                            loop={main.bg_type !== "image"}
                            playsInline={main.bg_type === "video"}
                            className="w-full h-full object-cover"
                        />
                     ) : (
                        <div className="w-full h-full bg-slate-200" />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>
                {/* Decorative blob */}
                <div 
                    className="absolute -left-20 -top-20 h-80 w-80 rounded-full blur-[100px] opacity-[0.15] -z-10"
                    style={{ backgroundColor: theme.primary }}
                />
            </div>

            {/* Content Side */}
            <div className="flex flex-col gap-10">
                <div className="space-y-6">
                    <p 
                        className="inline-block rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.24em] backdrop-blur-md border shadow-sm"
                        style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}25`, color: theme.primary }}
                    >
                        Learn More
                    </p>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight" style={{ color: theme.text }}>
                        {main.title || "Get to Know Us"}
                    </h2>
                    <p className="text-xl font-medium leading-relaxed opacity-80" style={{ color: theme.text }}>
                        {main.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {mission && (
                        <div className="p-8 rounded-[2.5rem] border border-white/40 bg-white/20 backdrop-blur-xl shadow-lg">
                            <h4 className="text-lg font-black uppercase tracking-widest mb-4 opacity-40">Our Mission</h4>
                            <p className="font-semibold leading-relaxed" style={{ color: theme.text }}>{mission.description}</p>
                        </div>
                    )}
                    {vision && (
                        <div className="p-8 rounded-[2.5rem] border border-white/40 bg-white/20 backdrop-blur-xl shadow-lg">
                            <h4 className="text-lg font-black uppercase tracking-widest mb-4 opacity-40">Our Vision</h4>
                            <p className="font-semibold leading-relaxed" style={{ color: theme.text }}>{vision.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
