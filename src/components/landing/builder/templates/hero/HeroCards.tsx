import Navbar from "@/components/Navbar";
import Media from "@/components/landing/Media";
import SearchBoxWrapper from "@/components/landing/SearchBoxWrapper";
import { getHeadersSections, getHeroSections, getPorts } from "@/services";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";
import type { IHeaderSection, IPort } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";

interface HeroCardsProps {
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
 * Cards hero variant — full-bleed background media with a centered
 * frosted-glass card containing the title and subtitle.
 * The card uses backdrop-blur + customPrimary top border accent for branding.
 */
export default async function HeroCards({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  showBookingSearch = true,
  headerSectionOverride,
  portsOverride,
  bookingRoutesOverride,
  tripSearchEnabledOverride = true,
}: HeroCardsProps = {}) {
  const [heroSection, headerSection, ports] = await Promise.all([
    heroSectionOverride ? Promise.resolve(heroSectionOverride) : getHeroSections(),
    headerSectionOverride !== undefined
      ? Promise.resolve(headerSectionOverride)
      : (getHeadersSections().catch(() => null) as Promise<IHeaderSection | null>),
    portsOverride !== undefined
      ? Promise.resolve(portsOverride ?? [])
      : (getPorts().catch(() => []) as Promise<IPort[]>),
  ]);

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
    <header id="Book" className="relative bg-[#EEF8FC]">
      <div className="relative w-auto h-[650px] mx-4 mt-4 rounded-[32px] overflow-hidden">
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

        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-[5] pointer-events-none" />

        {/* Centered frosted-glass card */}
        <div className="absolute inset-0 z-[10] flex items-center justify-center px-4">
          <div className="w-full max-w-[340px] sm:max-w-[480px] md:max-w-[600px] rounded-2xl overflow-hidden shadow-2xl">
            {/* customPrimary top accent stripe */}
            <div className="h-1.5 w-full bg-customPrimary" />
            {/* Glass body */}
            <div className="bg-white/15 backdrop-blur-md px-8 py-10 md:px-12 md:py-14 text-center">
              {heroSection?.title && (
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-customPrimary mb-3">
                  Set sail today
                </p>
              )}
              <h1 className="font-bold leading-tight text-white text-[24px] sm:text-[32px] md:text-[42px]">
                {heroSection?.title || "Book Your Ferry Trip"}
              </h1>
              {heroSection?.subtitle && (
                <>
                  {/* Divider */}
                  <div className="mx-auto mt-5 mb-5 h-px w-16 bg-white/40" />
                  <p className="text-white/85 text-sm md:text-base font-medium">
                    {heroSection.subtitle}
                  </p>
                </>
              )}
            </div>
            {/* customPrimary bottom accent stripe */}
            <div className="h-1.5 w-full bg-customPrimary" />
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
