"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Media from "@/components/landing/Media";
import { useBranding } from "@/hooks/branding";
import { createBuilderTheme } from "../../theme";
import { getHeadersSections, getHeroSections } from "@/services";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";
import type { HeaderNavigationConfig } from "@/lib/landing-nav";

interface HeroProfessionalProps {
  heroSectionOverride?: PreviewPageSection | null;
  forceHomeNavbar?: boolean;
  showNavbar?: boolean;
  headerSectionOverride?: HeaderNavigationConfig | null;
}

export default function HeroProfessional({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  headerSectionOverride,
}: HeroProfessionalProps = {}) {
  const branding = useBranding();
  const theme = createBuilderTheme((branding ?? {}) as any);
  const [heroSection, setHeroSection] = useState<PreviewPageSection | null>(heroSectionOverride ?? null);
  const [headerSection, setHeaderSection] = useState<HeaderNavigationConfig | null>(
    headerSectionOverride ?? null
  );
  const [loading, setLoading] = useState(!(heroSectionOverride && headerSectionOverride !== undefined));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, headerRes] = await Promise.all([
          heroSectionOverride
            ? Promise.resolve(heroSectionOverride)
            : getHeroSections().then((res: any) => res?.data || res),
          headerSectionOverride !== undefined
            ? Promise.resolve(headerSectionOverride)
            : getHeadersSections().catch(() => null).then((res: any) => res?.data || res),
        ]);

        setHeroSection(heroRes as any);
        setHeaderSection(headerRes as any);
      } catch (error) {
        console.error("Failed to load HeroProfessional data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [heroSectionOverride, headerSectionOverride]);

  if (loading) return <div className="h-[720px] bg-[var(--surface-alt)] animate-pulse rounded-[36px] mx-4 mt-4" />;

  const title = heroSection?.title || `Sail better with ${branding?.brand_name || "Ayahay"}`;
  const subtitle = heroSection?.subtitle || "A better marketplace for ferry passengers.";

  const renderMedia = () => {
    if (heroSection?.bg_type?.toLowerCase() === "youtube" && heroSection?.bg_url) {
      return (
        <Media
          src={heroSection.bg_url}
          type="youtube"
          playing
          loop
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
      );
    }

    if (heroSection?.bg_type?.toLowerCase() === "image" && heroSection?.bg_url) {
      return (
        <Media
          src={heroSection.bg_url}
          type="image"
          alt={heroSection?.bg_alt || title}
          className="object-cover"
          priority
        />
      );
    }

    if (heroSection?.bg_url) {
      return (
        <Media
          src={heroSection.bg_url}
          type="video"
          autoPlay
          loop
          muted
          className="absolute inset-0 h-full w-full object-cover"
        />
      );
    }

    return (
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at top right, ${theme.secondary}55 0, transparent 28%), linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`,
        }}
      />
    );
  };

  return (
    <section id="Book" className="relative px-4 pt-4" style={{ backgroundColor: theme.surfaceAlt }}>
      <div
        className="relative mx-auto overflow-hidden rounded-[36px] border shadow-[0_40px_120px_-30px_rgba(15,23,42,0.18)]"
        style={{
          borderColor: `${theme.text}14`,
          background: `linear-gradient(135deg, ${theme.surface} 0%, ${theme.surfaceAlt} 100%)`,
          color: theme.text,
        }}
      >
        {showNavbar ? (
          <div className="absolute inset-x-0 top-0 z-20">
            <Navbar forceHomeStyle={forceHomeNavbar} initialHeaderSection={headerSection} />
          </div>
        ) : null}

        <div className="relative z-10 grid min-h-[720px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center gap-6 px-6 py-16 lg:px-14 lg:py-20">
            <div className="space-y-4">
              <h1 className="max-w-2xl text-[30px] font-semibold leading-tight md:text-[48px] lg:text-[60px]">
                {title}
              </h1>
              <p className="max-w-xl text-sm leading-7 md:text-base" style={{ color: `${theme.text}B3` }}>
                {subtitle}
              </p>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden lg:min-h-full">
            {renderMedia()}
            <div
              className="absolute inset-0"
              style={{
                background: heroSection?.bg_url
                  ? `linear-gradient(90deg, color-mix(in srgb, ${theme.surface} 94%, transparent), color-mix(in srgb, ${theme.surface} 42%, transparent) 42%, color-mix(in srgb, ${theme.accent} 18%, transparent))`
                  : "none",
              }}
            />
            <div
              className="absolute inset-6 rounded-[30px] border"
              style={{ borderColor: "rgba(255,255,255,0.24)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
