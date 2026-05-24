"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import type { TripData } from "@oltek/hayahai-sdk/react";
import { ArrowRight, MapPin, Ship, Sparkles } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";
import { FaEnvelope, FaPhone } from "react-icons/fa6";
import { FaXTwitter } from "react-icons/fa6";
import { HayahAIButton, SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";
import Media from "@/components/landing/Media";
import Navbar from "@/components/Navbar";
import { useBranding } from "@/hooks/branding";
import { useContactUs } from "@/hooks/contact-us";
import { useFooter } from "@/hooks/footer";
import { cn } from "@/lib/utils";
import { DEFAULT_BOOKING_TYPE } from "constants/default";
import { isEffectiveClientApiMode } from "constants/api";
import type {
  BookingTemplateProps,
  BuilderThemeTokens,
  GetToKnowTemplateProps,
  PartnersTemplateProps,
  PromotionsTemplateProps,
  RoutesTemplateProps,
  WhyChooseTemplateProps,
} from "../../types";
import type { IHeroSection } from "@/services/ui/hero-section.service";
import type { HeaderNavigationConfig } from "@/lib/landing-nav";

const TripSearchWidget = dynamic(
  () => import("@oltek/hayahai-sdk/react").then((mod) => mod.TripSearchWidget),
  { ssr: false }
);

function islandGradient(theme: BuilderThemeTokens) {
  return `radial-gradient(circle at 18% 12%, ${theme.secondary}44 0, transparent 28%), radial-gradient(circle at 82% 18%, #fbbf2455 0, transparent 24%), linear-gradient(135deg, ${theme.primary}, ${theme.accent})`;
}

function resolveMediaType(value?: string | null, src?: string | null): "image" | "video" | "youtube" {
  const normalized = (value || "").toLowerCase();
  const source = (src || "").toLowerCase();

  if (normalized === "image" || normalized === "video" || normalized === "youtube") {
    return normalized;
  }

  if (source.includes("youtube.com") || source.includes("youtu.be")) {
    return "youtube";
  }

  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(source)) {
    return "video";
  }

  return "image";
}

function renderSectionMedia({
  src,
  type,
  alt,
  className,
  priority,
}: {
  src?: string | null;
  type?: string | null;
  alt?: string | null;
  className: string;
  priority?: boolean;
}) {
  if (!src) return null;

  return (
    <Media
      src={src}
      type={(type?.toLowerCase() as "image" | "video" | "youtube") || "image"}
      alt={alt || ""}
      priority={priority}
      className={className}
      autoPlay
      loop
      muted
      playsInline
      playing
    />
  );
}

export function HeroIslandPremium({
  heroSection,
  theme,
  brandName,
  showNavbar,
  headerSectionOverride,
}: {
  heroSection?: IHeroSection | null;
  theme: BuilderThemeTokens;
  brandName?: string | null;
  showNavbar?: boolean;
  headerSectionOverride?: HeaderNavigationConfig | null;
}) {
  const title = heroSection?.title || `Sail better with ${brandName || "Ayahay"}`;
  const subtitle = heroSection?.subtitle || heroSection?.description || "Premium island trips, clear schedules, and smoother booking.";
  const islandSurfaceAlt = theme.surfaceAlt;
  const mediaType = resolveMediaType(heroSection?.bg_type, heroSection?.bg_url);
  const hasHeroMedia = Boolean(heroSection?.bg_url);
  const heroMedia =
    hasHeroMedia && mediaType === "youtube" ? (
      <Media
        src={heroSection?.bg_url || ""}
        type="youtube"
        playing
        loop
        muted
        className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    ) : hasHeroMedia && mediaType === "image" ? (
      <Media
        src={heroSection?.bg_url || ""}
        type="image"
        alt={heroSection?.bg_alt || title}
        className="h-full w-full object-cover"
        priority
      />
    ) : hasHeroMedia ? (
      <Media
        src={heroSection?.bg_url || ""}
        type="video"
        autoPlay
        loop
        muted
        className="absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
      />
    ) : null;

  return (
    <section id="Book" className="relative px-3 pt-3 sm:px-5 sm:pt-5" style={{ backgroundColor: islandSurfaceAlt }}>
      <div
        className="relative mx-auto overflow-hidden rounded-[2rem] border border-white/70 shadow-[0_35px_120px_-70px_rgba(8,47,73,0.55)] sm:rounded-[2.5rem]"
        style={{ background: islandGradient(theme), color: "#fff" }}
      >
        {heroMedia ? <div className="absolute inset-0 opacity-35">{heroMedia}</div> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/25" />
        {showNavbar ? (
          <div className="absolute inset-x-0 top-0 z-20">
            <Navbar forceHomeStyle initialHeaderSection={headerSectionOverride ?? undefined} />
          </div>
        ) : null}
        <div className="relative z-10 grid gap-3 px-5 pt-[80px] pb-4 sm:px-8 sm:pt-[100px] sm:pb-14 lg:min-h-[560px] lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:pt-14 lg:pb-14">
          <div className="flex flex-col justify-center">
            <h1 className="max-w-3xl text-[32px] font-semibold leading-tight sm:text-[46px] lg:text-[62px]">
              {title}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-white/84 sm:text-base">{subtitle}</p>
          </div>
          {heroMedia ? (
            <div className="relative min-h-[120px] overflow-hidden rounded-[2rem] border border-white/25 bg-white/16 backdrop-blur sm:min-h-[240px]">
              {heroMedia}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function BookingIslandPremium({ theme, ports = [], routes = [] }: BookingTemplateProps) {
  const [mode, setMode] = useState<"form" | "chat">("form");
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);
  const [tripSearchEnabled, setTripSearchEnabled] = useState(true);
  const tenantId =
    isEffectiveClientApiMode && process.env.NEXT_PUBLIC_TENANT_ID
      ? Number(process.env.NEXT_PUBLIC_TENANT_ID)
      : 1;
  const islandSurface = theme.surface;
  const islandSurfaceAlt = theme.surfaceAlt;
  const islandText = theme.text;

  useEffect(() => {
    (async () => {
      try {
        const configRes = await fetch(`/api/agent-config?tenantId=${tenantId}&type=trip-search`);
        if (configRes.ok) {
          const data = await configRes.json();
          setTripSearchEnabled(data?.config?.enabled ?? true);
        }
      } catch {
        setTripSearchEnabled(true);
      }
    })();
  }, [tenantId]);

  const portNameToCode = new Map(ports.map((port) => [port.name.toLowerCase(), port.code]));

  const handleTripSelect = (trip: TripData) => {
    const depDate = trip.departureTime
      ? new Date(trip.departureTime).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const originCode = portNameToCode.get(trip.srcPort.toLowerCase());
    const destinationCode = portNameToCode.get(trip.destPort.toLowerCase());
    const params = new URLSearchParams({
      departure_date: depDate,
      passenger_count: "1",
      vehicle_count: "0",
      sort: "departureDate",
      page: "1",
    });
    if (originCode) params.set("origin_code", originCode);
    if (destinationCode) params.set("destination_code", destinationCode);
    window.location.href = `/booking/destination?${params.toString()}`;
  };

  return (
    <section id="Book" className="relative z-[60] -mt-24 overflow-visible px-3 pb-16 sm:-mt-16 sm:px-6 lg:px-10">
      <div className="container mx-auto max-w-[1180px] overflow-visible">
        <div className="overflow-visible rounded-[2rem] border border-white/80 p-3 shadow-[0_28px_90px_-45px_rgba(8,47,73,0.45)] sm:p-5" style={{ backgroundColor: islandSurfaceAlt }}>
          <div className="mb-2 hidden flex-col gap-3 rounded-[1.5rem] p-4 sm:mb-4 sm:flex sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: islandSurface }}>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: islandText }}>Booking Search</h2>
            </div>
            {mode === "form" && tripSearchEnabled ? (
              <HayahAIButton onClick={() => setMode("chat")} variant="default" />
            ) : null}
          </div>
          {mode === "chat" && tripSearchEnabled ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-cyan-100 bg-white p-3">
              <TripSearchWidget
                tenantId={tenantId}
                chatApiUrl="/api/chat-booking"
                routesApiUrl="/api/routes"
                tripsApiUrl="/api/trips"
                configApiUrl="/api/agent-config"
                onSwitchToForm={() => setMode("form")}
                onTripSelect={handleTripSelect}
                showFormToggle
                poweredByText="Powered by HayahAI"
              />
            </div>
          ) : (
            <div className="island-booking-form relative z-[70] overflow-visible rounded-[1.5rem] bg-white p-3 sm:p-4">
              <SearchBoxFormContent
                bookingType={bookingType}
                setBookingType={setBookingType}
                initialPorts={ports}
                initialRoutes={routes}
              />
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .island-booking-form > div {
          overflow: visible !important;
        }
        .island-booking-form [data-radix-popper-content-wrapper],
        .island-booking-form [role="listbox"],
        .island-booking-form [role="dialog"] {
          z-index: 9999 !important;
        }
        .island-booking-form fieldset:focus-within {
          border-color: ${theme.primary} !important;
          box-shadow: 0 0 0 3px ${theme.primary}18 !important;
        }
      `}</style>
    </section>
  );
}

export function PromotionsIslandPremium({ promos }: PromotionsTemplateProps) {
  const items = promos.filter((promo) => promo.is_active !== false).slice(0, 4);
  if (items.length === 0) return null;
  const [featured, ...secondary] = items;

  return (
    <section className="px-4 py-16" style={{ backgroundColor: "var(--surface-alt)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">Travel Promotions & Updates</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Link href="/promos" className="group relative min-h-[420px] overflow-hidden rounded-[2rem] bg-white shadow-[0_22px_70px_-45px_rgba(8,47,73,0.35)]">
            {featured.image_url ? (
              <img src={featured.image_url} alt={featured.image_alt || featured.title || ""} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="absolute inset-0 bg-cyan-50" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-3xl font-semibold">{featured.title}</h3>
              {featured.description ? <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">{featured.description}</p> : null}
            </div>
          </Link>
          <div className="grid gap-4">
            {secondary.map((promo) => (
              <Link key={promo.id} href="/promos" className="group grid gap-4 rounded-[1.5rem] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 sm:grid-cols-[140px_1fr]">
                <div className="min-h-32 overflow-hidden rounded-[1.1rem] bg-cyan-50">
                  {promo.image_url ? <img src={promo.image_url} alt={promo.image_alt || promo.title || ""} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                </div>
                <div className="flex flex-col justify-center p-2">
                  <h3 className="font-semibold text-slate-950">{promo.title}</h3>
                  {promo.description ? <p className="mt-2 line-clamp-2 text-sm text-slate-500">{promo.description}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RoutesIslandPremium({ routes }: RoutesTemplateProps) {
  const [showAllRoutes, setShowAllRoutes] = useState(false);
  const activeRoutes = routes.filter((route) => route.is_active !== false);
  const items = showAllRoutes ? activeRoutes : activeRoutes.slice(0, 6);
  const hasMoreRoutes = activeRoutes.length > items.length;
  if (items.length === 0) return null;

  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-3xl font-semibold text-slate-950 md:text-4xl">Most Popular Routes Recommended For You</h2>
          <Link href="/booking/destination" className="inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5" style={{ backgroundColor: "var(--surface-alt)", color: "var(--primary)" }}>
            Search trips
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {items.map((route, index) => (
            <Link
              key={route.id}
              href="/booking/destination"
              className={cn(
                "group overflow-hidden rounded-[2rem] p-3 transition-transform hover:-translate-y-1",
                index === 0 && "lg:col-span-2 lg:row-span-2"
              )}
              style={{ backgroundColor: "var(--surface-alt)" }}
            >
              <div className={cn("relative overflow-hidden rounded-[1.5rem] bg-cyan-50", index === 0 ? "h-72 lg:h-[390px]" : "h-48")}>
                {route.image_url ? <img src={route.image_url} alt={route.image_alt || route.route} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : null}
                {index === 0 ? <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 to-transparent" /> : null}
              </div>
              <div className="flex items-center justify-between gap-3 p-3">
                <h3 className={cn("font-semibold text-slate-950", index === 0 && "text-xl")}>{route.route}</h3>
                <ArrowRight className="h-4 w-4 text-cyan-700 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
        {hasMoreRoutes ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              data-template-ignore="true"
              onClick={() => setShowAllRoutes(true)}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
              style={{ backgroundColor: "var(--surface-alt)", color: "var(--primary)" }}
            >
              View all routes
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function WhyChooseIslandPremium({ section, reasons, theme }: WhyChooseTemplateProps) {
  const items = reasons.filter((reason) => reason.is_active !== false).slice(0, 6);
  if (items.length === 0) return null;
  return (
    <section className="px-4 py-16" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-white p-5 shadow-[0_24px_80px_-50px_rgba(8,47,73,0.4)] md:p-8">
          <h2 className="text-3xl font-semibold text-slate-950">{section?.title || "Why choose this marketplace"}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{section?.description}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((reason) => (
              <article key={reason.id} className="rounded-[1.5rem] border p-5" style={{ borderColor: `${theme.primary}26`, backgroundColor: theme.surfaceAlt }}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: islandGradient(theme) }}>
                  {reason.icon_url ? <img src={reason.icon_url} alt={reason.icon_alt || reason.title} className="h-6 w-6 object-contain" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GetToKnowIslandPremium({ main, mission, vision }: GetToKnowTemplateProps) {
  const hasMedia = Boolean(main.bg_url && main.bg_type);

  return (
    <section className="bg-white px-4 py-16">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-[2rem]" style={{ backgroundColor: "var(--surface-alt)" }}>
          {hasMedia ? (
            <div className="h-80 overflow-hidden">
              {renderSectionMedia({
                src: main.bg_url,
                type: main.bg_type,
                alt: main.bg_alt || main.title,
                className: "h-full w-full object-cover",
              })}
            </div>
          ) : null}
          <div className="p-6">
            <h2 className="text-3xl font-semibold text-slate-950">{main.title || "Get to know us"}</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">{main.description}</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[mission, vision].map((item, index) => (
            <article key={item.id ?? index} className="grid gap-5 rounded-[2rem] border border-cyan-100 bg-white p-5 shadow-[0_20px_60px_-45px_rgba(8,47,73,0.35)] sm:grid-cols-[120px_1fr]">
              <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-2xl bg-cyan-50 text-cyan-700 sm:h-full">
                {item.bg_url && item.bg_type ? (
                  renderSectionMedia({
                    src: item.bg_url,
                    type: item.bg_type,
                    alt: item.bg_alt || item.title,
                    className: "h-full w-full object-cover",
                  })
                ) : index === 0 ? (
                  <MapPin className="h-6 w-6" />
                ) : (
                  <Ship className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-500">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PartnersIslandPremium({ partners }: PartnersTemplateProps) {
  const activePartners = partners.filter((partner) => partner.is_active !== false);
  if (activePartners.length === 0) return null;
  return (
    <section className="px-4 py-14" style={{ backgroundColor: "var(--surface-alt)" }}>
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-white p-6">
        <h2 className="text-center text-3xl font-semibold text-slate-950">Our Partners</h2>
        <div className="mt-8 grid items-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activePartners.map((partner) => (
            <div key={partner.id} className="flex min-h-24 items-center justify-center rounded-[1.5rem] border p-5 transition hover:-translate-y-0.5" style={{ borderColor: "color-mix(in srgb, var(--primary) 20%, transparent)", backgroundColor: "var(--surface-alt)" }}>
              {partner.logo_url ? <img src={partner.logo_url} alt={partner.name} className="max-h-12 w-auto object-contain" /> : <span className="text-sm font-semibold text-slate-600">{partner.name}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FooterIslandPremium({ theme }: { theme: BuilderThemeTokens; brandName?: string }) {
  const branding = useBranding();
  const footerSection = useFooter();
  const contactInfo = useContactUs();
  const socialLinks = {
    facebook: contactInfo.find((contact) => contact.type === "facebook" && contact.is_active),
    instagram: contactInfo.find((contact) => contact.type === "instagram" && contact.is_active),
    twitter: contactInfo.find((contact) => contact.type === "twitter" && contact.is_active),
    linkedin: contactInfo.find((contact) => contact.type === "linkedin" && contact.is_active),
  };
  const phones = contactInfo.filter((contact) => contact.type === "phone" && contact.is_active).slice(0, 1);
  const emails = contactInfo.filter((contact) => contact.type === "email" && contact.is_active).slice(0, 1);

  return (
    <footer className="px-4 py-12" style={{ backgroundColor: theme.surfaceAlt }}>
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-[0_28px_90px_-60px_rgba(8,47,73,0.45)]">
        <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1.15fr_1.85fr]">
          <div className="rounded-[1.75rem] p-6 text-white" style={{ background: islandGradient(theme) }}>
            <Image
              src={branding?.logo?.light || branding?.logo?.dark || "/assets/images/ayahay_logo.png"}
              alt={branding?.brand_name || "Logo"}
              width={180}
              height={60}
              className="h-12 w-auto object-contain"
            />
            {branding?.slogan ? <p className="mt-6 text-sm leading-7 text-white/78">{branding.slogan}</p> : null}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Company</h4>
              <ul className="space-y-3 text-sm" style={{ color: theme.text }}>
                {footerSection?.hasAboutUs ? <li><Link href="/about-us" className="hover:opacity-60">About us</Link></li> : null}
                {footerSection?.hasPress ? <li><Link href="/press" className="hover:opacity-60">Press</Link></li> : null}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Support</h4>
              <ul className="space-y-3 text-sm" style={{ color: theme.text }}>
                {footerSection?.hasFaq ? <li><Link href="/faq" className="hover:opacity-60">FAQ</Link></li> : null}
                <li><Link href="/contact-us" className="hover:opacity-60">Contact us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Legal Docs</h4>
              <ul className="space-y-3 text-sm" style={{ color: theme.text }}>
                {footerSection?.hasPrivacyPolicy ? <li><Link href="/privacy-policy" className="hover:opacity-60">Privacy Policy</Link></li> : null}
                {footerSection?.hasTermsAndConditions ? <li><Link href="/terms" className="hover:opacity-60">Terms and Conditions</Link></li> : null}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Contact Us</h4>
              <div className="space-y-3 text-sm" style={{ color: theme.text }}>
                {phones.map((phone) => (
                  <a key={phone.id} href={`tel:${phone.value}`} className="flex items-center gap-3 hover:opacity-60">
                    <FaPhone className="h-4 w-4 text-cyan-700" />
                    {phone.value}
                  </a>
                ))}
                {emails.map((email) => (
                  <a key={email.id} href={`mailto:${email.value}`} className="flex items-center gap-3 hover:opacity-60">
                    <FaEnvelope className="h-4 w-4 text-cyan-700" />
                    {email.value}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5 border-t border-cyan-100 px-6 py-6 text-sm md:flex-row md:items-center md:justify-between md:px-10" style={{ color: theme.text }}>
          <span className="opacity-60">© {new Date().getFullYear()} {branding?.brand_name}. All rights reserved.</span>
          <div className="flex gap-5">
            {socialLinks.facebook ? <a href={socialLinks.facebook.value} target="_blank" rel="noreferrer" className="hover:opacity-60"><FaFacebook className="h-5 w-5" /></a> : null}
            {socialLinks.twitter ? <a href={socialLinks.twitter.value} target="_blank" rel="noreferrer" className="hover:opacity-60"><FaXTwitter className="h-5 w-5" /></a> : null}
            {socialLinks.instagram ? <a href={socialLinks.instagram.value} target="_blank" rel="noreferrer" className="hover:opacity-60"><FaInstagram className="h-5 w-5" /></a> : null}
            {socialLinks.linkedin ? <a href={socialLinks.linkedin.value} target="_blank" rel="noreferrer" className="hover:opacity-60"><FaLinkedin className="h-5 w-5" /></a> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
