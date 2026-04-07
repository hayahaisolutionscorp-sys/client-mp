import Media from "@/components/landing/Media";
import type { HeroTemplateProps } from "../../types";

export default function HeroDefault({ branding, heroSection, theme }: HeroTemplateProps) {
  return (
    <section className="relative overflow-hidden text-white">
      {heroSection?.bg_url && heroSection.bg_type ? (
        <div className="absolute inset-0">
          <Media
            src={heroSection.bg_url}
            type={heroSection.bg_type}
            alt={heroSection.bg_alt || heroSection.title}
            priority={heroSection.bg_type === "image"}
            autoPlay={heroSection.bg_type === "video"}
            playing={heroSection.bg_type === "youtube"}
            muted={heroSection.bg_type !== "image"}
            loop={heroSection.bg_type !== "image"}
            playsInline={heroSection.bg_type === "video"}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${theme.accent} 88%, transparent), color-mix(in srgb, ${theme.primary} 62%, transparent))`,
        }}
      />
      <div className="relative container mx-auto max-w-7xl px-6 py-24 lg:py-28">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
          {branding.brand_name}
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
          {heroSection?.title || branding.tagline || `Sail with ${branding.brand_name}`}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-white/80 md:text-lg">
          {heroSection?.subtitle || branding.slogan || "Book your ferry trips online."}
        </p>
      </div>
    </section>
  );
}
