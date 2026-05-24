'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Navbar from "@/components/Navbar";
import Media from "@/components/landing/Media";
import SearchBoxWrapper from "@/components/landing/SearchBoxWrapper";
import { getHeadersSections, getHeroSections, getPorts } from "@/services";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";
import type { IPort } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";
import type { HeaderNavigationConfig } from "@/lib/landing-nav";

interface HeroGlassmorphicProps {
  heroSectionOverride?: PreviewPageSection | null;
  forceHomeNavbar?: boolean;
  showNavbar?: boolean;
  showBookingSearch?: boolean;
  headerSectionOverride?: HeaderNavigationConfig | null;
  portsOverride?: IPort[] | null;
  bookingRoutesOverride?: IRoute[] | null;
  tripSearchEnabledOverride?: boolean;
  /**
   * Optional booking content rendered as a floating overlay inside the hero
   * (used by the glassmorphic preset where the full booking card lives in the
   * hero viewport instead of as a separate section below).
   */
  bookingSlot?: ReactNode;
}

export default function HeroGlassmorphic({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  showBookingSearch = true,
  headerSectionOverride,
  portsOverride,
  bookingRoutesOverride,
  tripSearchEnabledOverride = true,
  bookingSlot,
}: HeroGlassmorphicProps = {}) {
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
        console.error("Failed to load HeroGlassmorphic data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [heroSectionOverride, headerSectionOverride, portsOverride]);

  if (loading) return <div className="h-[650px] bg-[var(--surface-alt)] animate-pulse rounded-[32px] mx-4 mt-4" />;

  return (
    <header id="Book" className="relative min-h-[100dvh] w-full overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        {heroSection?.bg_url && heroSection.bg_type ? (
          <Media
            src={heroSection.bg_url}
            type={heroSection.bg_type as "image" | "video" | "youtube"}
            alt={heroSection.bg_alt || heroSection.title || "Hero background"}
            priority={heroSection.bg_type === "image"}
            autoPlay={heroSection.bg_type === "video"}
            playing={heroSection.bg_type === "youtube"}
            muted={heroSection.bg_type !== "image"}
            loop={heroSection.bg_type !== "image"}
            playsInline={heroSection.bg_type === "video"}
            className="h-full w-full object-cover scale-105" // slight scale to hide edges during entry animation
          />
        ) : (
          <video
            className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover scale-105"
            src="/assets/videos/ayahay_landing_bg.mp4"
            autoPlay
            loop
            playsInline
            muted
            aria-hidden="true"
          />
        )}
        
        {/* Soft, vibrant gradients injected over the media */}
        <div className="absolute inset-0 bg-gradient-to-tr from-customPrimary/80 via-transparent to-black/30 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-customPrimary/40 mix-blend-overlay" />
      </div>

      {/* Floating Navbar */}
      {showNavbar ? (
        <div className="absolute inset-x-0 top-0 z-30 pt-3 px-3 sm:pt-4 sm:px-6">
          <div className="mx-auto max-w-7xl rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] sm:rounded-full">
            <Navbar forceHomeStyle={forceHomeNavbar} initialHeaderSection={headerSection} />
          </div>
        </div>
      ) : null}

      {/* Main Glass Content Layer — arranged top (headline) + bottom (booking) so
          the entire booking flow lives in the hero viewport. */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-6 sm:pb-8 lg:pb-10">

        {/* Compact, Wide Hero Text Panel */}
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
          <div className="w-full rounded-[2rem] border border-white/40 bg-white/60 py-4 px-5 sm:px-10 sm:py-6 lg:py-7 backdrop-blur-xl shadow-xl">
            <p className="mb-2 inline-block rounded-full bg-customPrimary/15 px-3 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-customPrimary border border-customPrimary/20 sm:text-[10px]">
              {heroSection?.title ? "Welcome aboard" : "Experience the journey"}
            </p>
            <h1 className="mb-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl md:text-3xl lg:text-4xl">
              {heroSection?.title || "Book Your Ferry Trip"}
            </h1>
            <p className="mx-auto max-w-2xl text-xs font-medium text-slate-700 sm:text-sm md:text-base">
              {heroSection?.subtitle || "Fast, easy, and reliable ferry booking online. Discover the beauty of island hopping with seamless reservations."}
            </p>
          </div>
        </div>

        {/* Booking overlay area — takes the remaining viewport space so the whole
            booking card floats inside the hero background. */}
        {bookingSlot ? (
          <div className="mt-auto pt-4 sm:pt-6 w-full">
            {bookingSlot}
          </div>
        ) : showBookingSearch ? (
          <div className="mt-auto pt-4 sm:pt-6 w-full">
            <div className="mx-auto w-full max-w-6xl">
              <div className="group rounded-[2.5rem] p-2 sm:p-4 backdrop-blur-3xl bg-white/10 border border-white/20 shadow-[0_30px_70px_rgba(0,0,0,0.4)] transition-all duration-500 hover:bg-white/20 hover:border-white/30">
                <div className="mb-2 px-6 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-40">Main Booking Terminal</span>
                </div>
                <SearchBoxWrapper
                  initialPorts={ports}
                  initialRoutes={bookingRoutesOverride ?? []}
                  initialTripSearchEnabled={tripSearchEnabledOverride}
                  isRelative={true}
                  isGlassmorphic={true}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
