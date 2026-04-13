'use client';

import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import Media from "@/components/landing/Media";
import SearchBoxWrapper from "@/components/landing/SearchBoxWrapper";
import { getHeadersSections, getHeroSections, getPorts } from "@/services";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";
import type { IPort } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";
import type { HeaderNavigationConfig } from "@/lib/landing-nav";

interface HeroConciergeProps {
  heroSectionOverride?: PreviewPageSection | null;
  forceHomeNavbar?: boolean;
  showNavbar?: boolean;
  showBookingSearch?: boolean;
  headerSectionOverride?: HeaderNavigationConfig | null;
  portsOverride?: IPort[] | null;
  bookingRoutesOverride?: IRoute[] | null;
  tripSearchEnabledOverride?: boolean;
}

/**
 * Concierge hero variant — luxury editorial with full-viewport dark-navy background,
 * integrated floating booking card on the right, and gold accent serif typography.
 * Based on the "Modern Classic Concierge" Stitch design.
 */
export default function HeroConcierge({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  showBookingSearch = true,
  headerSectionOverride,
  portsOverride,
  bookingRoutesOverride,
  tripSearchEnabledOverride = true,
}: HeroConciergeProps = {}) {
  const [heroSection, setHeroSection] = useState<PreviewPageSection | null>(heroSectionOverride ?? null);
  const [headerSection, setHeaderSection] = useState<HeaderNavigationConfig | null>(
    headerSectionOverride ?? null
  );
  const [ports, setPorts] = useState<IPort[]>(portsOverride ?? []);
  const [loading, setLoading] = useState(!(heroSectionOverride && headerSectionOverride !== undefined && portsOverride !== undefined));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, headerRes, portsRes] = await Promise.all([
          heroSectionOverride ? Promise.resolve(heroSectionOverride) : getHeroSections().then((res: any) => res?.data || res),
          headerSectionOverride !== undefined
            ? Promise.resolve(headerSectionOverride)
            : getHeadersSections().catch(() => null).then((res: any) => res?.data || res),
          portsOverride !== undefined
            ? Promise.resolve(portsOverride ?? [])
            : getPorts().catch(() => []).then((res: any) => res?.data || res),
        ]);
        setHeroSection(heroRes as any);
        setHeaderSection(headerRes as any);
        setPorts(portsRes as any);
      } catch (error) {
        console.error("Failed to load HeroConcierge data", error);
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
        className="object-cover scale-105"
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
      {/* Full-viewport container */}
      <div className="relative w-full min-h-[680px] md:min-h-[780px] overflow-hidden flex items-center pt-20">
        {showNavbar ? (
          <Navbar forceHomeStyle={forceHomeNavbar} initialHeaderSection={headerSection} />
        ) : null}

        {/* Background media */}
        <div className="absolute inset-0">
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
        </div>

        {/* Overlay — dark navy with slight color tint */}
        <div className="absolute inset-0 bg-[#000a1e]/65 z-[5] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#000a1e]/80 via-[#001b3d]/40 to-transparent z-[5] pointer-events-none" />

        {/* Content grid */}
        <div className="relative z-[10] w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 py-16">
          {/* Left — editorial text */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-[#e9c176] tracking-[0.3em] uppercase text-xs font-bold mb-6">
              The Sovereign Standard
            </p>
            <h1 className="text-5xl md:text-7xl font-serif text-white leading-[1.08] mb-6 tracking-tight">
              {heroSection?.title || (
                <>
                  Navigate the <br />
                  <span className="italic text-white/90">Open Horizon.</span>
                </>
              )}
            </h1>
            <p className="text-white/75 text-lg max-w-xl font-light leading-relaxed">
              {heroSection?.subtitle || "A legacy of maritime excellence — experience the finest ferry crossings."}
            </p>

            {/* Gold divider */}
            <div className="w-16 h-0.5 bg-[#e9c176] mt-8 rounded-full" />
          </div>

          {/* Right — integrated booking card */}
          {showBookingSearch && (
            <div className="lg:col-span-5 self-end">
              <div className="bg-white/95 backdrop-blur-xl p-7 rounded-xl shadow-2xl border border-white/20">
                <h3 className="font-serif text-xl text-[#000a1e] mb-5 tracking-tight">
                  Plan Your Voyage
                </h3>
                <div className="concierge-search-wrapper">
                  <SearchBoxWrapper
                    initialPorts={ports}
                    initialRoutes={bookingRoutesOverride ?? []}
                    initialTripSearchEnabled={tripSearchEnabledOverride}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .concierge-search-wrapper fieldset {
          border-radius: 8px !important;
          background: #f7f9fc !important;
          border: 1px solid #e0e3e6 !important;
          padding: 10px 14px !important;
          transition: all 0.25s ease;
        }
        .concierge-search-wrapper fieldset:focus-within {
          border-color: #000a1e !important;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(0,10,30,0.08) !important;
        }
        .concierge-search-wrapper legend {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.62rem !important;
          font-weight: 700;
          color: #74777f;
          padding: 0 4px;
        }
        .concierge-search-wrapper button[type="submit"] {
          background: #000a1e !important;
          color: white !important;
          border-radius: 8px !important;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .concierge-search-wrapper button[type="submit"]:hover {
          background: #002147 !important;
        }
      `}</style>
    </header>
  );
}
