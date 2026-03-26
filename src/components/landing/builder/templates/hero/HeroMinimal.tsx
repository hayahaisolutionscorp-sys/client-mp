'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import Media from "@/components/landing/Media";
import SearchBoxWrapper from "@/components/landing/SearchBoxWrapper";
import { getHeadersSections, getHeroSections, getPorts } from "@/services";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";
import type { IHeaderSection, IPort } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";

interface HeroMinimalProps {
  heroSectionOverride?: PreviewPageSection | null;
  forceHomeNavbar?: boolean;
  showNavbar?: boolean;
  showBookingSearch?: boolean;
  headerSectionOverride?: IHeaderSection | null;
  portsOverride?: IPort[] | null;
  bookingRoutesOverride?: IRoute[] | null;
  tripSearchEnabledOverride?: boolean;
}

/**
 * Minimal hero variant — full-bleed edge-to-edge layout (no rounded card),
 * with a strong left-anchored editorial text block at the bottom.
 * A thick customPrimary left border accent gives it a magazine/editorial feel.
 */
export default function HeroMinimal({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  showBookingSearch = true,
  headerSectionOverride,
  portsOverride,
  bookingRoutesOverride,
  tripSearchEnabledOverride = true,
}: HeroMinimalProps = {}) {
  const [heroSection, setHeroSection] = useState<PreviewPageSection | null>(heroSectionOverride ?? null);
  const [headerSection, setHeaderSection] = useState<IHeaderSection | null>(headerSectionOverride ?? null);
  const [ports, setPorts] = useState<IPort[]>(portsOverride ?? []);
  const [loading, setLoading] = useState(!(heroSectionOverride && headerSectionOverride !== undefined && portsOverride !== undefined));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, headerRes, portsRes] = await Promise.all([
          heroSectionOverride ? Promise.resolve({ data: heroSectionOverride }) : getHeroSections(),
          headerSectionOverride !== undefined
            ? Promise.resolve({ data: headerSectionOverride })
            : (getHeadersSections().catch(() => ({ data: null })) as Promise<any>),
          portsOverride !== undefined
            ? Promise.resolve({ data: portsOverride ?? [] })
            : (getPorts().catch(() => ({ data: [] })) as Promise<any>),
        ]);
        
        setHeroSection(heroRes.data || (heroRes as any));
        setHeaderSection(headerRes.data || (headerRes as any));
        setPorts(portsRes.data || (portsRes as any));
      } catch (error) {
        console.error("Failed to load HeroMinimal data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [heroSectionOverride, headerSectionOverride, portsOverride]);

  if (loading) return null;

  let captionBackground;
  if (heroSection?.bg_type?.toLowerCase() === "youtube") {
    captionBackground = (
      <Media
        src={heroSection?.bg_url || ""}
        type="youtube"
        playing={true}
        loop={true}
        muted={true}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover scale-150"
      />
    );
  } else if (heroSection?.bg_type?.toLowerCase() === "image") {
    captionBackground = (
      <Media
        src={heroSection?.bg_url || ""}
        type="image"
        alt={heroSection?.bg_alt || ""}
        className="object-cover"
        priority={true}
      />
    );
  } else {
    captionBackground = (
      <Media
        src={heroSection?.bg_url || ""}
        type="video"
        autoPlay={true}
        loop={true}
        muted={true}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    );
  }

  return (
    <header id="Book" className="relative">
      {/* Full-bleed container — no rounded card, no margin */}
      <div className="relative w-full h-[580px] md:h-[680px] overflow-hidden">
        {showNavbar ? (
          <Navbar forceHomeStyle={forceHomeNavbar} initialHeaderSection={headerSection} />
        ) : null}

        {/* Background media */}
        {captionBackground ?? (
          <video
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
            src="/assets/videos/ayahay_landing_bg.mp4"
            autoPlay
            loop
            playsInline
            muted
            aria-hidden="true"
          />
        )}

        {/* Gradient: strong on left-bottom, fades to transparent on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[5] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-[5] pointer-events-none" />

        {/* Editorial text block — bottom-left anchored */}
        <div className="absolute z-[10] bottom-10 left-0 px-4 sm:px-8 lg:px-14 max-w-full md:max-w-[65%] lg:max-w-[55%]">
          {/* Thick customPrimary left accent bar */}
          <div className="flex items-stretch gap-5">
            <div className="w-1.5 rounded-full bg-customPrimary flex-shrink-0" />
            <div className="flex flex-col gap-2">
              {heroSection?.title && (
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-customPrimary">
                  Set sail today
                </p>
              )}
              <h1 className="font-bold leading-tight text-white text-[26px] md:text-[42px] lg:text-[52px]">
                {heroSection?.title || "Book Your Ferry Trip"}
              </h1>
              {heroSection?.subtitle && (
                <p className="text-white/80 text-sm md:text-lg font-medium mt-1">
                  {heroSection.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showBookingSearch ? (
        <SearchBoxWrapper
          initialPorts={ports}
          initialRoutes={bookingRoutesOverride ?? []}
          initialTripSearchEnabled={tripSearchEnabledOverride}
        />
      ) : null}
    </header>
  );
}
