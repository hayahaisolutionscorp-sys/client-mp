import Media from "@/components/landing/Media";
import type { GetToKnowTemplateProps } from "../../types";

export default function GetToKnowBoardingPass({ main, mission, vision, theme }: GetToKnowTemplateProps) {
  if (!main) return null;

  const bgType = main.bg_type as unknown as string | null;
  const hasMedia =
    (bgType === "video" || bgType === "image" || bgType === "youtube") && main.bg_url;

  return (
    <section id="About" className="relative px-4 py-16 sm:py-20" style={{ backgroundColor: "#F3EFE4" }}>
      <div className="mx-auto max-w-5xl">
        <div
          className="relative rounded-2xl border-2 overflow-hidden shadow-[0_20px_40px_-20px_rgba(15,23,42,0.2)]"
          style={{ backgroundColor: "#FFFDF7", borderColor: "rgba(15,23,42,0.14)" }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">
            {/* Media side — photo stub */}
            <div className="relative p-3 sm:p-4 border-b-2 lg:border-b-0 lg:border-r-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.18)" }}>
              <div className="relative aspect-[4/3] lg:aspect-[3/4] rounded-xl overflow-hidden border-2" style={{ borderColor: "rgba(15,23,42,0.12)" }}>
                {hasMedia ? (
                  <Media
                    src={main.bg_url!}
                    type={bgType as "image" | "video" | "youtube"}
                    alt={main.bg_alt || main.title || "About Us"}
                    priority={bgType === "image"}
                    autoPlay={bgType === "video"}
                    playing={bgType === "youtube"}
                    muted={bgType !== "image"}
                    loop={bgType !== "image"}
                    playsInline={bgType === "video"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
                <span
                  className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.25em] font-black px-2 py-1 bg-white/90 backdrop-blur border-2"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  ★ About Us
                </span>
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-50 text-center" style={{ color: theme.text }}>
                Tear here ·········
              </p>
            </div>

            {/* Content side */}
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              <div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] font-black opacity-60 mb-3" style={{ color: theme.text }}>
                  <span>Story</span>
                  <span className="flex-1 h-[1px] border-t border-dashed" style={{ borderColor: "rgba(15,23,42,0.2)" }} />
                  <span>Ch · 01</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight mb-3" style={{ color: theme.text, fontFamily: "var(--font-title)" }}>
                  {main.title || "Get to Know Us"}
                </h2>
                {main.description && (
                  <p className="text-base leading-relaxed opacity-75" style={{ color: theme.text }}>
                    {main.description}
                  </p>
                )}
              </div>

              {(mission || vision) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mission && (
                    <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.2)" }}>
                      <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2" style={{ color: theme.text }}>
                        ✈ Mission
                      </h4>
                      <p className="text-sm leading-relaxed opacity-85" style={{ color: theme.text }}>
                        {mission.description}
                      </p>
                    </div>
                  )}
                  {vision && (
                    <div className="p-4 rounded-lg border-2 border-dashed" style={{ borderColor: "rgba(15,23,42,0.2)" }}>
                      <h4 className="font-mono text-[10px] uppercase tracking-[0.3em] font-black opacity-60 mb-2" style={{ color: theme.text }}>
                        ⚓ Vision
                      </h4>
                      <p className="text-sm leading-relaxed opacity-85" style={{ color: theme.text }}>
                        {vision.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
