import Navbar from "@/components/Navbar";
import Media from "@/components/landing/Media";
import SearchBoxWrapper from "@/components/landing/SearchBoxWrapper";
import { getHeadersSections, getHeroSections, getPorts } from "@/services";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";
import type { IHeaderSection, IPort } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";

interface HeroSplitProps {
  heroSectionOverride?: PreviewPageSection | null;
  forceHomeNavbar?: boolean;
  showNavbar?: boolean;
  showBookingSearch?: boolean;
  headerSectionOverride?: IHeaderSection | null;
  portsOverride?: IPort[] | null;
  bookingRoutesOverride?: IRoute[] | null;
  tripSearchEnabledOverride?: boolean;
}

export default async function HeroSplit({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  showBookingSearch = true,
  headerSectionOverride,
  portsOverride,
  bookingRoutesOverride,
  tripSearchEnabledOverride = true,
}: HeroSplitProps = {}) {
  const [heroSection, headerSection, ports] = await Promise.all([
    heroSectionOverride ? Promise.resolve(heroSectionOverride) : getHeroSections(),
    headerSectionOverride !== undefined
      ? Promise.resolve(headerSectionOverride)
      : (getHeadersSections().catch(() => null) as Promise<IHeaderSection | null>),
    portsOverride !== undefined
      ? Promise.resolve(portsOverride ?? [])
      : (getPorts().catch(() => []) as Promise<IPort[]>),
  ]);

  return (
    <header id="Book" className="relative bg-[#EEF8FC]">
      <div className="relative mx-4 mt-4 overflow-hidden rounded-[32px]">
        {/* Navbar */}
        {showNavbar ? (
          <div className="absolute inset-x-0 top-0 z-20">
            <Navbar forceHomeStyle={forceHomeNavbar} initialHeaderSection={headerSection} />
          </div>
        ) : null}

        {/* Split layout */}
        <div className="flex min-h-[650px] flex-col lg:flex-row">
          {/* Left: text content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center bg-customPrimary px-8 py-24 lg:px-14 lg:py-32">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-customText/10" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-customText/10" />

            <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.22em] text-customText/60">
              {heroSection?.title ? "Welcome aboard" : ""}
            </p>
            <h1 className="relative z-10 mt-3 max-w-lg text-3xl font-bold leading-tight text-customText md:text-4xl lg:text-5xl">
              {heroSection?.title || "Book Your Ferry Trip"}
            </h1>
            <p className="relative z-10 mt-4 max-w-md text-base text-customText/75 md:text-lg">
              {heroSection?.subtitle || "Fast, easy, and reliable ferry booking online."}
            </p>

            {/* Decorative wave divider (desktop only) */}
            <div className="pointer-events-none absolute inset-y-0 -right-8 z-10 hidden w-16 lg:block">
              <svg
                viewBox="0 0 64 650"
                preserveAspectRatio="none"
                className="h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0,0 C40,162 40,325 0,487 L0,650 L64,650 L64,0 Z"
                  className="fill-customPrimary"
                />
              </svg>
            </div>
          </div>

          {/* Right: media */}
          <div className="relative flex-1 overflow-hidden lg:min-h-[650px]">
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
                className="h-full w-full object-cover"
              />
            ) : (
              <video
                className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
                src="/assets/videos/ayahay_landing_bg.mp4"
                autoPlay
                loop
                playsInline
                muted
                aria-hidden="true"
              />
            )}
            {/* Subtle dark overlay on media side */}
            <div className="absolute inset-0 bg-black/20" />
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
