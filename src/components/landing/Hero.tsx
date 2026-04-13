'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Media from '@/components/landing/Media';
import SearchBoxWrapper from '@/components/landing/SearchBoxWrapper';
import { getHeadersSections, getHeroSections, getPorts } from '@/services';
import type { PreviewPageSection } from '@/lib/preview/landing-preview';
import type { IPort } from '@/models';
import type { IRoute } from '@/models/shipping-line/route.model';
import type { HeaderNavigationConfig } from '@/lib/landing-nav';

interface HeroProps {
  heroSectionOverride?: PreviewPageSection | null;
  forceHomeNavbar?: boolean;
  showNavbar?: boolean;
  showBookingSearch?: boolean;
  headerSectionOverride?: HeaderNavigationConfig | null;
  portsOverride?: IPort[] | null;
  bookingRoutesOverride?: IRoute[] | null;
  tripSearchEnabledOverride?: boolean;
}

export default function Hero({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  showBookingSearch = true,
  headerSectionOverride,
  portsOverride,
  bookingRoutesOverride,
  tripSearchEnabledOverride = true,
}: HeroProps = {}) {
  const [heroSection, setHeroSection] = useState<PreviewPageSection | null>(heroSectionOverride ?? null);
  const [headerSection, setHeaderSection] = useState<HeaderNavigationConfig | null>(
    headerSectionOverride ?? null
  );
  const [ports, setPorts] = useState<IPort[]>(portsOverride ?? []);
  const [loading, setLoading] = useState(
    () =>
      !(
        heroSectionOverride !== undefined &&
        headerSectionOverride !== undefined &&
        portsOverride !== undefined
      )
  );

  useEffect(() => {
    if (
      heroSectionOverride !== undefined &&
      headerSectionOverride !== undefined &&
      portsOverride !== undefined
    ) {
      setHeroSection(heroSectionOverride ?? null);
      setHeaderSection(headerSectionOverride ?? null);
      setPorts(portsOverride ?? []);
      setLoading(false);
      return;
    }

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
        console.error("Failed to load hero data", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [heroSectionOverride, headerSectionOverride, portsOverride]);

  if (loading) return <div className="h-[650px] bg-[var(--surface-alt)] animate-pulse rounded-[32px] m-4" />;

  let captionBackground;

  if (heroSection?.bg_type?.toLowerCase() == 'youtube') {
    captionBackground = (
      <Media
        src={heroSection?.bg_url || ''}
        type="youtube"
        playing={true}
        loop={true}
        muted={true}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover scale-150"
      />
    );
  } else if (heroSection?.bg_type?.toLowerCase() == 'image') {
    captionBackground = (
      <Media
        src={heroSection?.bg_url || ''}
        type="image"
        alt={heroSection?.bg_alt || ''}
        className="object-cover"
        priority={true}
      />
    );
  } else {
    captionBackground = (
      <Media
        src={heroSection?.bg_url || ''}
        type="video"
        autoPlay={true}
        loop={true}
        muted={true}
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    );
  }

  return (
    <header id="Book" className="relative bg-[var(--surface-alt)]">
      <div className="relative w-auto h-[650px] mx-4 mt-4 rounded-[32px] overflow-hidden">
        {showNavbar ? (
          <Navbar
            forceHomeStyle={forceHomeNavbar}
            initialHeaderSection={headerSection}
          />
        ) : null}

        {captionBackground ? (
          captionBackground
        ) : (
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

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-[5] pointer-events-none" />

        {/* Content overlay on top of the video */}
        <div className="flex flex-col items-center absolute z-[10] inset-0 text-white text-center mt-[85px] md:mt-[100px] lg:mt-[150px]">
          <h1 className="font-bold leading-tight px-6 text-[22px] min-w-[500px] max-w-[500px] md:text-[40px] md:max-w-[800px] lg:text-[50px] lg:max-w-[1002px]">
            {heroSection?.title}
          </h1>
          <p className="font-medium px-4 pt-3 text-sm md:text-2xl">{heroSection?.subtitle}</p>
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
