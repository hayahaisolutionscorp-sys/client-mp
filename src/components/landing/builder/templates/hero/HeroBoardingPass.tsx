"use client";

import { useEffect, useState, type ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Media from "@/components/landing/Media";
import SearchBoxWrapper from "@/components/landing/SearchBoxWrapper";
import { getHeadersSections, getHeroSections, getPorts } from "@/services";
import type { PreviewPageSection } from "@/lib/preview/landing-preview";
import type { IPort } from "@/models";
import type { IRoute } from "@/models/shipping-line/route.model";
import type { HeaderNavigationConfig } from "@/lib/landing-nav";

interface HeroBoardingPassProps {
  heroSectionOverride?: PreviewPageSection | null;
  forceHomeNavbar?: boolean;
  showNavbar?: boolean;
  showBookingSearch?: boolean;
  headerSectionOverride?: HeaderNavigationConfig | null;
  portsOverride?: IPort[] | null;
  bookingRoutesOverride?: IRoute[] | null;
  tripSearchEnabledOverride?: boolean;
  /** Optional booking slot rendered inside the ticket body. */
  bookingSlot?: ReactNode;
}

function unwrapServiceData<T>(response: T | { data?: T } | null | undefined): T | null {
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data?: T }).data ?? null;
  }

  return (response as T) ?? null;
}

function formatDateParts() {
  const d = new Date();
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const yr = d.getFullYear();
  return { month, day, yr };
}

export default function HeroBoardingPass({
  heroSectionOverride,
  forceHomeNavbar = false,
  showNavbar = true,
  showBookingSearch = true,
  headerSectionOverride,
  portsOverride,
  bookingRoutesOverride,
  tripSearchEnabledOverride = true,
  bookingSlot,
}: HeroBoardingPassProps = {}) {
  const [heroSection, setHeroSection] = useState<PreviewPageSection | null>(heroSectionOverride ?? null);
  const [headerSection, setHeaderSection] = useState<HeaderNavigationConfig | null>(headerSectionOverride ?? null);
  const [ports, setPorts] = useState<IPort[]>(portsOverride ?? []);
  const [loading, setLoading] = useState(
    !(heroSectionOverride && headerSectionOverride !== undefined && portsOverride !== undefined)
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, headerRes, portsRes] = await Promise.all([
          heroSectionOverride
            ? Promise.resolve(heroSectionOverride)
            : getHeroSections().then((res) => unwrapServiceData<PreviewPageSection | null>(res)),
          headerSectionOverride !== undefined
            ? Promise.resolve(headerSectionOverride)
            : getHeadersSections().catch(() => null).then((res) => unwrapServiceData<HeaderNavigationConfig | null>(res)),
          portsOverride !== undefined
            ? Promise.resolve(portsOverride ?? [])
            : getPorts().catch(() => []).then((res) => unwrapServiceData<IPort[]>(res)),
        ]);
        setHeroSection(heroRes ?? null);
        setHeaderSection(headerRes ?? null);
        setPorts(Array.isArray(portsRes) ? portsRes : []);
      } catch (error) {
        console.error("Failed to load HeroBoardingPass data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [heroSectionOverride, headerSectionOverride, portsOverride]);

  const { month, day, yr } = formatDateParts();

  if (loading) return <div className="h-[520px] sm:h-[650px] bg-[var(--surface-alt)] animate-pulse rounded-xl mx-4 mt-4" />;

  return (
    <header id="Book" className="relative w-full overflow-hidden pb-8 sm:pb-16" style={{ backgroundColor: "#FAF7F0" }}>
      {/* Soft warm background wash */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.4) 1px, transparent 0)",
        backgroundSize: "14px 14px",
      }} />

      {/* Optional background media — pushed behind a paper overlay */}
      {heroSection?.bg_url && heroSection.bg_type ? (
        <div className="absolute inset-0 z-0 opacity-15">
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
        </div>
      ) : null}

      {/* Navbar */}
      {showNavbar ? (
        <Navbar forceHomeStyle={forceHomeNavbar} initialHeaderSection={headerSection} />
      ) : null}

      <div className="relative z-10 container mx-auto w-full max-w-[min(96vw,1400px)] lg:max-w-[min(77vw,946px)] 2xl:max-w-[min(96vw,1400px)] px-3 pt-20 sm:px-6 sm:pt-28 lg:px-6">
        {/* TICKET CARD */}
        <div
          className="relative rounded-2xl border-2 shadow-[0_20px_40px_-20px_rgba(15,23,42,0.25),0_8px_20px_-8px_rgba(15,23,42,0.15)]"
          style={{
            backgroundColor: "#FFFDF7",
            borderColor: "rgba(15,23,42,0.12)",
          }}
        >
          {/* Top stub */}
          <div className="flex items-stretch">
            <div className="flex-1 px-4 py-3 sm:px-7 sm:py-5 lg:px-7 lg:py-4 2xl:px-12 flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-md grid place-items-center text-white text-[10px] font-black flex-shrink-0"
                  style={{ backgroundColor: "var(--customPrimary, #13357B)" }}
                >
                  ✈
                </div>
                <span className="font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-60 truncate">
                  Boarding Pass · {month} {day}
                </span>
              </div>
              <span
                className="hidden sm:inline-block font-mono text-[9px] font-black uppercase tracking-[0.3em] px-2 py-1 border-2 rotate-[-4deg] flex-shrink-0"
                style={{ borderColor: "var(--customPrimary, #13357B)", color: "var(--customPrimary, #13357B)" }}
              >
                ★ Confirmed
              </span>
            </div>
          </div>

          {/* Perforation with circle punches */}
          <div className="relative">
            <div
              className="h-[1px] mx-6 border-t-2 border-dashed"
              style={{ borderColor: "rgba(15,23,42,0.18)" }}
            />
            <div
              className="absolute left-[-8px] top-[-8px] h-4 w-4 rounded-full"
              style={{ backgroundColor: "#FAF7F0" }}
            />
            <div
              className="absolute right-[-8px] top-[-8px] h-4 w-4 rounded-full"
              style={{ backgroundColor: "#FAF7F0" }}
            />
          </div>

          {/* Body */}
          <div className="px-4 py-2 sm:px-7 sm:py-5 lg:px-7 lg:py-4 2xl:px-12 2xl:py-8">
            <h1
              className="text-xl sm:text-3xl md:text-4xl lg:text-[2.25rem] xl:text-5xl 2xl:text-7xl font-black leading-[1.1] sm:leading-[1.05] tracking-tight text-slate-900 max-w-5xl"
              style={{ fontFamily: "var(--font-title)" }}
            >
              {heroSection?.title || "Book your next voyage."}
            </h1>
            {heroSection?.subtitle ? (
              <p className="mt-2 sm:mt-3 text-xs sm:text-base lg:text-sm 2xl:text-lg text-slate-600 max-w-2xl leading-relaxed">
                {heroSection.subtitle}
              </p>
            ) : null}

          </div>

          {/* Perforation 2 */}
          <div className="relative">
            <div
              className="h-[1px] mx-6 border-t-2 border-dashed"
              style={{ borderColor: "rgba(15,23,42,0.18)" }}
            />
            <div
              className="absolute left-[-8px] top-[-8px] h-4 w-4 rounded-full"
              style={{ backgroundColor: "#FAF7F0" }}
            />
            <div
              className="absolute right-[-8px] top-[-8px] h-4 w-4 rounded-full"
              style={{ backgroundColor: "#FAF7F0" }}
            />
          </div>

          {/* Booking body — the stub */}
          <div className="px-3 py-2 sm:px-6 sm:py-4 lg:px-7 lg:py-4 2xl:px-12 2xl:py-6">
            {bookingSlot ? (
              bookingSlot
            ) : showBookingSearch ? (
              <div className="boarding-pass-form">
                <SearchBoxWrapper
                  initialPorts={ports}
                  initialRoutes={bookingRoutesOverride ?? []}
                  initialTripSearchEnabled={tripSearchEnabledOverride}
                  isRelative={true}
                />
              </div>
            ) : null}
          </div>

          {/* Barcode footer */}
          <div
            className="flex items-center justify-between px-4 py-2.5 sm:px-7 sm:py-3 lg:px-7 2xl:px-12 border-t-2 border-dashed"
            style={{ borderColor: "rgba(15,23,42,0.12)", backgroundColor: "rgba(250,247,240,0.6)" }}
          >
            <div className="flex gap-[2px] items-end h-6 overflow-hidden flex-1 opacity-80 mr-4">
              {Array.from({ length: 48 }).map((_, i) => (
                <span
                  key={i}
                  className="block bg-slate-900"
                  style={{
                    width: (i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1) + "px",
                    height: "100%",
                    opacity: i % 5 === 0 ? 0.9 : 0.7,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] font-black tracking-[0.15em] opacity-60 whitespace-nowrap">
              SEQ · {String(day)}{String(yr).slice(-2)}-AYH
            </span>
          </div>
        </div>

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.3em] opacity-40">
          Tear along dashed line · Present at gate
        </p>
      </div>
    </header>
  );
}
