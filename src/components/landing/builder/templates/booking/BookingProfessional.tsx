"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import type { TripData } from "@oltek/hayahai-sdk/react";
import { HayahAIButton, SearchBoxFormContent } from "@/components/landing/SearchBoxWrapper";
import { useBranding } from "@/hooks/branding";
import type { BookingTemplateProps } from "../../types";
import { DEFAULT_BOOKING_TYPE } from "constants/default";
import { isEffectiveClientApiMode } from "constants/api";

const TripSearchWidget = dynamic(
  () => import("@oltek/hayahai-sdk/react").then((mod) => mod.TripSearchWidget),
  { ssr: false }
);

export default function BookingProfessional({
  theme,
  ports = [],
  routes = [],
}: BookingTemplateProps) {
  const branding = useBranding();
  const [mode, setMode] = useState<"form" | "chat">("form");
  const [bookingType, setBookingType] = useState<string | undefined>(DEFAULT_BOOKING_TYPE);
  const [tripSearchEnabled, setTripSearchEnabled] = useState(true);
  const tenantId =
    isEffectiveClientApiMode && process.env.NEXT_PUBLIC_TENANT_ID
      ? Number(process.env.NEXT_PUBLIC_TENANT_ID)
      : 1;

  useEffect(() => {
    (async () => {
      try {
        const configRes = await fetch(`/api/agent-config?tenantId=${tenantId}&type=trip-search`);

        if (configRes.ok) {
          const data = await configRes.json();
          const cfg = data?.config;
          setTripSearchEnabled(cfg?.enabled ?? true);
        }
      } catch {
        setTripSearchEnabled(true);
      }
    })();
  }, [tenantId]);

  const portNameToCode = new Map(ports.map((port) => [port.name.toLowerCase(), port.code]));
  const logoSrc = branding?.logo?.dark || branding?.logo?.light;
  const brandName = branding?.brand_name || "Ayahay";
  const slogan = branding?.slogan || branding?.tagline || "";

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
    <section id="Book" className="relative z-30 -mt-24 px-4 pb-20 sm:px-6 lg:px-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="container mx-auto max-w-[1180px]"
        >
          <div
            className="relative overflow-visible rounded-[36px] border shadow-[0_30px_90px_-30px_rgba(15,23,42,0.18)]"
            style={{
              borderColor: `${theme.text}14`,
              background: `linear-gradient(135deg, ${theme.surfaceAlt} 0%, ${theme.surface} 100%)`,
              color: theme.text,
            }}
          >
            <div
              className="relative hidden overflow-hidden rounded-t-[36px] border-b px-6 py-5 sm:block md:px-8"
              style={{
                borderColor: `${theme.text}10`,
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
                color: theme.textOnPrimary,
              }}
            >
              <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
              <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    {logoSrc ? (
                      <Image
                        src={logoSrc}
                        alt={`${brandName} Logo`}
                        width={120}
                        height={48}
                        className="h-10 w-auto object-contain"
                      />
                    ) : null}
                    <p className="truncate text-base font-semibold md:text-lg">{brandName}</p>
                  </div>
                  {slogan ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/78">{slogan}</p>
                  ) : null}
                </div>
                {tripSearchEnabled ? (
                  <div className="relative z-20 shrink-0">
                    <HayahAIButton onClick={() => setMode("chat")} variant="overlay" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="relative z-20 overflow-visible rounded-[36px] bg-white px-6 py-6 sm:rounded-t-none md:px-8 md:py-8">
              {mode === "chat" && tripSearchEnabled ? (
                <div className="relative z-[40] overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-3">
                  <TripSearchWidget
                    tenantId={tenantId}
                    chatApiUrl="/api/chat-booking"
                    routesApiUrl="/api/routes"
                    tripsApiUrl="/api/trips"
                    configApiUrl="/api/agent-config"
                    onSwitchToForm={() => setMode("form")}
                    onTripSelect={handleTripSelect}
                    showFormToggle={true}
                    poweredByText="Powered by HayahAI"
                  />
                </div>
              ) : (
                <div className="booking-professional-form-wrapper relative z-[60] overflow-visible">
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
        </motion.div>

      <style jsx global>{`
        .booking-professional-form-wrapper > div {
          overflow: visible !important;
        }

        .booking-professional-form-wrapper .grid,
        .booking-professional-form-wrapper fieldset,
        .booking-professional-form-wrapper [data-slot="popover-trigger"] {
          overflow: visible !important;
        }

        .booking-professional-form-wrapper fieldset {
          border-radius: 16px !important;
          background: rgba(255, 255, 255, 0.82) !important;
          border-color: rgba(15, 23, 42, 0.08) !important;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease !important;
          position: relative !important;
          z-index: 10 !important;
        }

        .booking-professional-form-wrapper fieldset:focus-within {
          background: white !important;
          border-color: ${theme.primary} !important;
          transform: translateY(-1px);
          z-index: 50 !important;
        }

        .booking-professional-form-wrapper fieldset:focus-within,
        .booking-professional-form-wrapper fieldset:hover {
          z-index: 120 !important;
        }

        .booking-professional-form-wrapper button[variant="default"] {
          border-radius: 16px !important;
          background: ${theme.primary} !important;
          font-weight: 700 !important;
          border: none !important;
          box-shadow: 0 10px 25px -5px ${theme.primary}44 !important;
        }
      `}</style>
    </section>
  );
}
